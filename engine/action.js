var Action = (function() {
	function interval(duration, update) {
		var t = 0;
		update(0);

		return function(dt) {
			var result = { done: false };

			t += dt;
			if (t >= duration) {
				t = duration;
				result = { done: true, remaining: t - duration };
			}

			update(t / duration);

			return result;
		};
	}

	function twoParallel(action1, action2) {
		var done1 = false;
		var done2 = false;
		return function(dt) {
			if (!done1) {
				var res = action1(dt);
				done1 = res.done;
				if (done2) { return res; }
			}
			if (!done2) {
				var res = action2(dt);
				done2 = res.done;
				if (done1) { return res; }
			}

			return { done: false };
		};
	}

	return {
		run: function (generatorFunc) {
			var gen = generatorFunc();

			var res = gen.next();
			if (res.done) {
				return function() {
					return { done: true, remaining: 0 };
				};
			}

			var current = res.value;
			return function(dt) {
				var result = current(dt);

				while (result.done) {
					var next = gen.next();
					if (next.done) { return { done: true, remaining: 0 }; }

					current = next.value;
					if (result.remaining) {
						result = current(result.remaining);
					} else {
						result = { done: false };
					}
				}

				return result;
			};
		},
		parallel: function(actions) {
			if (!Array.isArray(actions)) {
				actions = Array.prototype.slice.call(arguments);
			}

			if (actions.length === 0) {
				return function() { return { done: true, remaining: 0 }; };
			}

			return actions.reduce(twoParallel);
		},
		interval: interval,
		wait: function(duration) {
			return interval(duration, function() {});
		},
		performTask: function(task) {
			var finished = false;

			task(function(error) {
				if (error) { throw error; }
				finished = true;
			});

			return function() {
				return { done: finished };
			};
		}
	};
})();