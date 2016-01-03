var RelativeSystem = (function() {
	return {
		update: function(entities) {
			var dependent = entities.filter(['relativePos']);
			dependent.forEach(function(entity) {
				entity._dirty = true;
			});

			var dirty = true;
			while (dirty) {
				dirty = false;
				dependent.forEach(function(entity) {
					if (entity._dirty) {
						var parent = entity.relativePos.parent;
						if (parent.relativePos && parent._dirty) {
							dirty = true;
							return;
						}

						entity.pos = vadd(parent.pos, entity.relativePos.offset);
						delete entity._dirty;
					}
				});
			}
		}
	};
})();