var EntitySystem = function() {
	var list = [];

	return {
		add: function(entity) {
			list.push(entity);
			return entity;
		},
		remove: function(entity) {
			var index = list.indexOf(entity);
			if (index >= 0) {
				return list.splice(index, 1)[0];
			}
			return null;
		},
		filter: function(components) {
			return list.filter(function(entity) {
				return components.every(function(component) {
					return entity[component] !== undefined;
				});
			});
		}
	};
};