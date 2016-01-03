var EntitySystem = function() {
	var list = [];

	return {
		add: function(entity) {
			list.push(entity);
			return entity;
		},
		remove: function(entity) {
			return list.splice(list.indexOf(entity), 1)[0];
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