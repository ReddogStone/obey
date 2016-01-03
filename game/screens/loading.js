var LoadingScreen = function() {
	var message = '';
	var progress = 0;
	var finished = false;

	message = 'Loading sounds';
	Sound.init(SOUNDS)(function(value) {
		progress = value;
	})(function() {
		message = 'Loading images';
		Images.init(IMAGES)(function(value) {
			progress = value;
		})(function() {
			finished = true;
		});
	});

	return function(event) {
		if (finished) {
			return {};
		}

		switch (event.type) {
			case 'show':
				var context = event.context;
				var canvas = context.canvas;

				context.font = 'normal 40px Trebuchet';
				context.fillStyle = 'black';
				context.textAlign = 'left';
				context.textBaseline = 'top';

				var msg = message + ': ' + Math.floor(progress * 100) + '%';
				var textWidth = context.measureText(msg).width;

				context.fillText(msg, (canvas.width - textWidth) * 0.5, (canvas.height - 40) * 0.5);

				break;
		}
	};
}