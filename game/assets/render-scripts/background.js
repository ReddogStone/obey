ScriptLoader.module(function() {
	return {
		'default': function(context, data, time, textures) {
			if (textures[0]) {
				context.drawImage(textures[0], 0, 0);
				context.fillStyle = 'white';
//y				context.fillText();
			}
		}
	};
});