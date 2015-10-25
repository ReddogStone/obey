ScriptLoader.module(function() {


	return {
		'default': function(context, data, time, textures) {
			var pos = data.pos;

			context.globalAlpha = 1;

			var tex = textures[0];
			if (tex) {
				var frame = data.frame || 0;
				var w = tex.width;
				var h = tex.height;
				context.drawImage(tex, frame * w / 7, 0, w / 7, h, pos.x, pos.y - h, w / 7, h);
			}
		}
	};
});