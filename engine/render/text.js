var renderText = (function() {
	function applyCommand(state, message, index) {
		if (message[index] === '{' && message[index + 1] === '{') {
			var command = '';
			var i = index + 2;

			while (!(message[i] === '}' && message[i + 1] === '}')) {
				command += message[i];
				i++;
			}

			switch (command) {
				case 'bold': state.style = '900'; break;
				case 'narrow': state.style = 'narrow'; break;
				case 'normal': state.style = 'normal'; break;

				case 'huge': state.heightMultiplier = 2; break;
				case 'large': state.heightMultiplier = 1.5; break;
				case 'big': state.heightMultiplier = 1.2; break;
				case 'regular': state.heightMultiplier = 1.0; break;

				case 'center': state.align = 'center'; break;
				case 'left': state.align = 'left'; break;
				case 'right': state.align = 'right'; break;
			}

			return i + 2;
		}
		return index;
	}

	function showText(context, message, progress, size, font) {
		var withoutCommands = message.replace(/{{[^}]}}/g, '');
		var charsToShow = Math.floor(withoutCommands.length * progress);

		var state = {
			style: 'normal',
			heightMultiplier: 1,
			align: 'left',
			color: 'white'
		};

		var i = 0;

		var y = 0;
		var line = '';
		do {
			if (charsToShow > 0) {
				if (i < message.length) {
					do {
						var lastIndex = i;
						i = applyCommand(state, message, i);
					} while (i > lastIndex);

					if (i >= message.length) { break; }
				}

				var height = Math.floor(font.height * state.heightMultiplier);
				context.font = state.style + ' ' + height + 'px ' + font.name;

				if (i < message.length) {
					var c = message.charAt(i);
					i++;

					if (c !== '\n') {
						var width = context.measureText(line + c).width;
						if (width < size.x) {
							line += c;
							charsToShow--;
							continue;
						}

						i--;
					}
				} else {
					i++;
				}
			}

			context.fillStyle = state.color;
			context.textAlign = state.align;
			context.textBaseline = 'top';

			var x = 0;
			switch (context.textAlign) {
				case 'right': x = size.x; break;
				case 'center': x = 0.5 * size.x; break;
			}

			context.fillText(line, x, y);

			line = '';
			y += height * font.lineSpacing;

			if (charsToShow <= 0) { break; }
		} while (i <= message.length);
	}

	return function(context, entity) {
		var pos = entity.pos;
		var size = entity.size;
		var text = entity.text;
		var message = text.message;
		var font = text.font;
		var progress = (text.progress !== undefined) ? text.progress : 1;

		context.translate(pos.x, pos.y);
		showText(context, message, progress, size, font);
		context.translate(-pos.x, -pos.y);
	};
})();
