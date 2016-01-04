var MainScreen = function() {
	var entities = EntitySystem();
	var actionSystem = ActionSystem();

	var floor = entities.add({
		pos: vec(0, 0),
		sprite: { id: 'floor' },
		zOrder: 0
	});
	var door = entities.add({
		pos: vec(0, 0),
		sprite: { id: 'door' },
		zOrder: 1
	});
	var background = entities.add({
		pos: vec(0, 0),
		sprite: { id: 'bg' },
		zOrder: 2
	});

	var player = entities.add({
		pos: vec(1500, 720),
		sprite: { id: 'player', anchor: vec(0.5, 1) },
		zOrder: 3
	});

	actionSystem.add(Action.run(function*() {
		var startPlayerPos = vclone(player.pos);

		yield Action.interval(0.5, function(progress) {
			door.pos.y = -progress * 720;
		});
		yield Action.interval(2.0, function(progress) {
			player.pos = vlerp(startPlayerPos, vec(640, 720), progress);
		});
		yield Action.interval(0.5, function(progress) {
			door.pos.y = -720 * (1 - progress);
		});
	}));

	return function(event) {
		switch (event.type) {
			case 'update':
				RelativeSystem.update(entities);
				actionSystem.update(event.dt);
				break;

			case 'show':
				SpriteSystem.show(event.context, entities);
				break;

			case 'mousedown': return {}
		}
	};
}