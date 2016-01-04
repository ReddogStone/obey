var RenderSystem = function(renderScripts) {
	return {
		show: function(context, entities) {
			entities
				.filter(['render'])
				.sort(function(entity1, entity2) {
					return (entity1.zOrder || 0) - (entity2.zOrder || 0);
				})
				.forEach(function(entity) {
					var renderScript = renderScripts[entity.render.scriptId];
					if (!renderScript) { return; }

					var alpha = entity.alpha;
					if (alpha === undefined) { alpha = 1; }

					var saveAlpha = context.globalAlpha;
					context.globalAlpha = alpha;
					renderScript(context, entity);
					context.globalAlpha = saveAlpha;
				});
		}
	};
};