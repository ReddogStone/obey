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
			list = list.filter(function(action) {
				var result = action(dt);
				return !result.done;
			});
		}
	};
};