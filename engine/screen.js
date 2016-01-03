var Screen = (function() {
	return {
		run: Monad(function unit(error, result) {
			if (error) { throw error; }
			return function() {
				return { value: result };
			};
		}, function bind(value, func) {
			var current = value;
			return function() {
				var result = current.apply(null, arguments);
				if (result && (current === value)) {
					current = func(null, result.value);
					result = undefined;
				}
				return result;
			}
		})
	};
})();