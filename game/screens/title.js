var TitleScreen = function() {
	return function(event) {
		switch (event.type) {
			case 'show':
				var context = event.context;
				context.drawImage(Images.get('splash'), 0, 0);
				break;
			case 'mousedown':
				return {};
		}
	};
}