var MainScreen = function() {
	var entities = EntitySystem();

	var playerTest = entities.add({
		sprite: {
			id: 'player-test',
			anchor: vec(0.5, 0.5)
		},
		zOrder: 1
	});

	var middle = entities.add({});

	var top = entities.add({
		pos: vec(100, 100)
	});


	middle.relativePos = {
		offset: vec(500, 0),
		parent: top
	};
	playerTest.relativePos = {
		offset: vec(0, 400),
		parent: middle
	};

	return function(event) {
		switch (event.type) {
			case 'update':
				RelativeSystem.update(entities);
				break;

			case 'show':
				SpriteSystem.show(event.context, entities);
				break;

			case 'mousedown': return {}
		}
	};
}