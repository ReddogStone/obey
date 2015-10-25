var Renderer = (function() {
	function getScriptPath(scriptName) {
		return 'game/assets/render-scripts/' + scriptName + '.js';
	}

	return {
		draw: function(context, assets, renderList, time) {
			renderList.forEach(function(entity) {
				var renderDescription = entity.renderScript;
				var renderScriptName = renderDescription.name || renderDescription;
				var methodName = renderDescription.method || 'default';
				var textureNames = renderDescription.textures || [];

				var render = assets.renderScripts[getScriptPath(renderScriptName)];

				var method = render && render[methodName];
				if (!method) {
					return console.log('No such script: "' + renderScriptName + '.' + methodName + '"');
				}

				var textures = textureNames.map(function(textureName) {
					return assets.textures[textureName];
				});

				method(context, entity, time, textures);
			});
		}
	};
})();