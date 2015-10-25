var Async = (function() {
	function cont(raw) {
		return function(callback) {
			var cancelled = false;
			var nestedCancel = raw(function() {
				if (!cancelled) {
					callback.apply(null, arguments);
				}
			});

			return function() {
				if (cancelled) { return; }
				cancelled = true;
				if (nestedCancel) { nestedCancel(); }
			};
		};
	}

	function sequence(tasks) {
		if (!Array.isArray(tasks)) {
			tasks = Array.prototype.slice.call(arguments);
		}

		return cont(function(callback) {
			var results = new Array(tasks.length);

			var nestedCancel = null;
			var cancelled = false;

			var runAll = tasks.reduceRight(function(memo, current, index) {
				return function() {
					if (cancelled) { return; }

					nestedCancel = current(function(result) {
						results[index] = result;
						memo();
					});
				};
			}, function() {
				callback(results);
			});

			runAll();

			return function() {
				cancelled = true;
				if (nestedCancel) { nestedCancel(); }
			};
		});
	}

	function waterfall(tasks) {
		if (!Array.isArray(tasks)) {
			tasks = Array.prototype.slice.call(arguments);
		}

		return cont(function(callback) {
			var results = new Array(tasks.length);

			var nestedCancel = null;
			var cancelled = false;

			var runAll = tasks.reduceRight(function(memo, current, index) {
				return function() {
					if (cancelled) { return; }

					var nextTask = current.apply(null, arguments);
					nestedCancel = nextTask(function() {
						memo.apply(null, arguments);
					});
				};
			}, function() {
				callback.apply(null, arguments);
			});

			runAll();

			return function() {
				cancelled = true;
				if (nestedCancel) { nestedCancel(); }
			};
		});
	}

	function first(tasks) {
		if (!Array.isArray(tasks)) {
			tasks = Array.prototype.slice.call(arguments);
		}

		return cont(function(callback) {
			var finished = false;

			function cancelAll() {
				nestedCancels.forEach(function(nestedCancel) {
					if (nestedCancel) { nestedCancel(); }
				});
			}

			function finish() {
				if (finished) { return; }
				finished = true;

				callback.apply(null, arguments);
				cancelAll();
			}

			var nestedCancels = tasks.map(function(task) {
				return task(finish);
			});

			return cancelAll;
		});
	}

	function forever(task) {
		return cont(function(callback) {
			function next() {
				nestedCancel = task(next);
			}
			var nestedCancel = task(next);

			return function() {
				if (nestedCancel) { nestedCancel(); }
			};
		});
	}

	function doUntil(repeat, rejecter) {
		return first(forever(repeat), rejecter);
	}

	function wait(seconds) {
		return cont(function(callback) {
			var id = setTimeout(function() {
				callback();
			}, seconds * 1000);
			return function() {
				clearTimeout(id);
			};
		});
	}

	function waitTo(time) {
		var timeToWait = time - Time.now();
		return wait((timeToWait > 0) ? timeToWait : 0);
	}

	function doAndContinue(func) {
		return cont(function(callback) {
			func();
			setTimeout(callback, 0);
		});
	}

	function fireAndForget(continuation) {
		return cont(function(callback) {
			var nestedCancel = continuation(function() {});
			setTimeout(callback, 0)

			return function() {
				if (nestedCancel) { nestedCancel(); }
			};
		});
	}

	return {
		cont: cont,
		first: first,
		sequence: sequence,
		waterfall: waterfall,
		doUntil: doUntil,
		wait: wait,
		waitTo: waitTo,
		doAndContinue: doAndContinue,
		fireAndForget: fireAndForget,
		forever: forever
	};
})();
