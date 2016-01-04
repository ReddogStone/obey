var ActionSystem = function() {
	var list = [];

	return {
		add: function(action) {
			list.push(action);
			return action;
		},
		remove: function(action) {
			return list.splice(list.indexOf(action), 1);
		},
		update: function(dt) {
			list.forEach(function(action) {
				var result = action(dt);
				action._done = result.done;
			});
			list = list.filter(function(action) {
				return !action._done;
			});
		}
	};
};