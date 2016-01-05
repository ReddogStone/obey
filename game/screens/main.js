var MainScreen = function() {
	var entities = EntitySystem();
	var behaviorSystem = BehaviorSystem();
	var renderSystem = RenderSystem({
		'sprite': renderSprite,
		'text': renderText
	});

	var floor = entities.add({
		pos: vec(0, 0),
		sprite: { id: 'floor' },
		render: { scriptId: 'sprite' },
		zOrder: 0
	});
	var door = entities.add({
		pos: vec(0, 0),
		sprite: { id: 'door' },
		render: { scriptId: 'sprite' },
		zOrder: 1
	});
	var background = entities.add({
		pos: vec(0, 0),
		sprite: { id: 'bg' },
		render: { scriptId: 'sprite' },
		zOrder: 2
	});

	var player = entities.add({
		pos: vec(1500, 720),
		sprite: { id: 'player', anchor: vec(0.5, 1) },
		render: { scriptId: 'sprite' },
		zOrder: 3
	});

	var codexText = {
		pos: vec(650, 50),
		size: vec(300, 400),
		text: {
			font: { name: 'consolas', height: 14, lineSpacing: 1.5 },
			message: "{{bold}}{{huge}}" + 
				"The CODEX\n" +
				"{{normal}}{{big}}" + 
				"Minor defect :\n" +
				"{{regular}}" +
				"  no prior defects : reconditioning\n" +
				"  otherwise        : isolation\n\n" +
				"{{big}}" + 
				"Major defect:\n" +
				"{{regular}}" +
				"  no prior defects : isolation\n" +
				"  otherwise        : termination\n"
		},
		render: { scriptId: 'text' },
		zOrder: 4
	};

	var case1Text = {
		pos: vec(320, 50),
		size: vec(300, 400),
		text: {
			font: { name: 'consolas', height: 14, lineSpacing: 1.5 },
			message: "{{bold}}{{huge}}" +
				"The CASE\n" +
				"{{normal}}{{big}}" +
				"Routine investigation :\n" +
				"{{regular}}" +
				"  Minor defect detected in element :\n" +
				"    ES_31_m\n\n" +
				"  Prior defects : 1\n\n" +
				"  Suggested action :\n" +
				"{{bold}}" +
				"    ISOLATION"
		},
		render: { scriptId: 'text' },
		zOrder: 4
	};

	var case2Text = {
		pos: vec(320, 50),
		size: vec(300, 400),
		text: {
			font: { name: 'consolas', height: 14, lineSpacing: 1.5 },
			message: "{{bold}}{{huge}}" +
				"The CASE\n" +
				"{{normal}}{{big}}" +
				"Routine investigation :\n" +
				"{{regular}}" +
				"  Minor defect detected in element :\n" +
				"    OS_28_f\n\n" +
				"  Prior defects : 0\n\n" +
				"  Suggested action :\n" +
				"{{bold}}" +
				"    ISOLATION"
		},
		render: { scriptId: 'text' },
		zOrder: 4
	};

	var mouseDown = false;

	function fadeInAndBlink(entity) {
		return Action.run(function*() {
			yield Action.interval(3, function(progress) {
				entity.text.progress = progress;
			});
			yield Action.interval(2, function(progress) {
				entity.alpha = 0.25 * Math.cos(4 * Math.PI * progress) + 0.75;
			});
		});
	}

	function fadeOut(entity) {
		return Action.interval(1, function(progress) {
			entity.alpha = 1 - progress;
		});
	}

	behaviorSystem.add(Behavior.run(function*() {
		var startPlayerPos = vclone(player.pos);

		yield Behavior.parallel(
			Behavior.run(function*() {
				yield Behavior.action( Action.performTask(Sound.play('door')) );
				yield Behavior.action( Action.performTask(Sound.play('welcome')) );

				var where = yield Behavior.mouseDown();

				yield Behavior.action( Action.performTask(Sound.play('wellDone')) );

				var result = yield Behavior.first(
					Behavior.run(function*() {
						yield Behavior.mouseDown();
						return false;
					}),
					Behavior.run(function*() {
						yield Behavior.action(Action.wait(2));
						return true;
					})
				);
				if (result) {
					yield Behavior.action( Action.performTask(Sound.play('wellDone')) );					
				} else {
					yield Behavior.action( Action.performTask(Sound.play('door')) );
				}
			}),
			Behavior.run(function*() {
				yield Behavior.action( Action.interval(0.5, function(progress) {
					door.pos.y = -progress * 720;
				}) );
				yield Behavior.action( Action.interval(2.0, function(progress) {
					player.pos = vlerp(startPlayerPos, vec(640, 720), progress);
				}) );
				yield Behavior.action( Action.interval(0.5, function(progress) {
					door.pos.y = -720 * (1 - progress);
				}) );

				yield Behavior.action( Action.wait(17) );
				entities.add(codexText);

				behaviorSystem.add(Behavior.action( fadeInAndBlink(codexText) ));

				yield Behavior.action( Action.wait(9) );
				entities.add(case1Text);

				behaviorSystem.add(Behavior.action( fadeInAndBlink(case1Text) ));
			})
		);
	}));

	return function(event) {
		switch (event.type) {
			case 'update':
				RelativeSystem.update(entities);
				break;

			case 'show':
				renderSystem.show(event.context, entities);
				break;
		}

		if (event.type !== 'show') {
			behaviorSystem.update(event);
		}
	};
}