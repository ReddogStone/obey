var Action = (function() {
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
		interval: function(interval, update) {
			var t = 0;
			update(0);

			return function(dt) {
				var result = { done: false };

				t += dt;
				if (t >= interval) {
					t = interval;
					result = { done: true, remaining: t - interval };
				}

				update(t / interval);

				return result;
			};
		}
	};
})();