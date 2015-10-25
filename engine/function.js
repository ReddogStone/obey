var UnaryFunction = (function() {
	return {
		const: function(value) {
			return function() { return value; };
		},
		interval: function(from, to, func) {
			return function(x) {
				if ((x < from) || (x > to)) { return; }
				return func(x);
			};
		},
		bisection: function(threshold, before, after) {
			return function(x) {
				if (x < threshold) {
					return before(x);
				}

				return after(x);
			};
		},
		sum: function(funcs) {
			if (!Array.isArray(funcs)) {
				funcs = Array.prototype.slice.call(arguments);
			}
			return function(x) {
				return funcs.reduce(function(sum, current) {
					var value = current(x);
					if (value !== undefined) {
						sum = (sum !== undefined) ? sum + value : value
					}
				}, undefined);
			};
		},
		piecewise: function(startValue, startPos) {
			var intervals = Array.prototype.slice.call(arguments, 2);

			return function(x) {
				if (x <= startPos) {
					return startValue;
				}

				x -= startPos;

				for (var i = 0; i < intervals.length; i += 2) {
					var valueFunc = intervals[i];
					var length = intervals[i + 1];
					if (x <= length) {
						var previousValue = (i > 0) ? intervals[i - 2](1) : startValue;
						return valueFunc(previousValue, x / length);
					}
					x -= length;
				}

				return (intervals.length > 0) ? intervals[intervals.length - 2](intervals[intervals.length - 1], 1) : startValue;
			};
		},
		linear: function(toValue) {
			return function(fromValue, percentage) {
				return (1 - percentage) * fromValue + percentage * toValue;
			};
		},
		pow: function(toValue, power) {
			return function(fromValue, percentage) {
				percentage = Math.pow(percentage, power);
				return (1 - percentage) * fromValue + percentage * toValue;
			};
		}
	};
})();