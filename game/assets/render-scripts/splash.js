ScriptLoader.module(function() {
	return {
		'default': function(context, data, time, textures) {
			var index = Math.floor(time % 2);

			if (textures[index]) {
				context.drawImage(textures[index], 0, 0);
				context.fillStyle = 'white';
//y				context.fillText();
			}
		}
	};
});