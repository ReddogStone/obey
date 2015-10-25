var StatefulBehavior = (function() {
	return function(init, handleEvent) {
		function main(state) {
			return function() {
				var answer = handleEvent.apply(null, [state].concat(Array.prototype.slice.call(arguments)));

				return {
					next: main(answer.state),
					result: answer.result
				};
			}
		}

		return {
			init: function() {
				var state = init.apply(null, arguments);
				return main(state);
			}
		};
	};
})();