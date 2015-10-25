ScriptLoader.module(function() {


	return {
		'default': function(context, data, time, textures) {
			var pos = data.pos;

			var tex = textures[0];
			if (tex) {

				context.globalAlpha = data.alpha;
				context.drawImage(tex, pos.x, pos.y - tex.height);
				context.globalAlpha = 1;
			}
		}
	};
});