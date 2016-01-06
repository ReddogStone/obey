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

	var redLight = {
		pos: vec(0, 0),
		sprite: { id: 'red-light' },
		render: { scriptId: 'sprite' },
		zOrder: 3
	};

	var player = entities.add({
		pos: vec(1500, 720),
		sprite: { id: 'player', anchor: vec(0.5, 1) },
		render: { scriptId: 'sprite' },
		zOrder: 4
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

	function showText(entity) {
		return Behavior.interval(3, function(progress) {
			entity.text.progress = progress;
		});
	}

	function fadeIn(entity, duration) {
		return Behavior.interval(duration, function(progress) {
			entity.alpha = progress;
		});
	}
	function fadeOut(entity, duration) {
		return Behavior.interval(duration, function(progress) {
			entity.alpha = 1 - progress;
		});
	}
	function blink(entity, duration) {
		return Behavior.interval(duration, function(progress) {
			entity.alpha = 0.2 * Math.cos(2 * Math.PI * progress) + 0.8;
		});
	}

	function lightCycle() {
		return Behavior.run(function*() {
			entities.add(redLight);
			yield fadeIn(redLight, 0.5);
			yield Behavior.wait(2);
			yield blink(redLight, 0.5);
			yield Behavior.wait(1);
			yield blink(redLight, 0.5);
			yield blink(redLight, 0.5);
			yield Behavior.wait(1);
		});
	}

	behaviorSystem.add(Behavior.run(function*() {
		var startPlayerPos = vclone(player.pos);

		yield Behavior.parallel(
			Behavior.run(function*() {
				yield Behavior.performTask(Sound.play('door'));
				yield Behavior.performTask(Sound.play('welcome'));

				var result = yield Behavior.first(
					Behavior.run(function*() {
						yield Behavior.mouseDown();
						return true;
					}),
					Behavior.run(function*() {
						yield lightCycle();
						return false;
					})
				);
				behaviorSystem.add(Behavior.run(function*() {
					yield fadeOut(redLight, 0.5);
					entities.remove(redLight);
				}));
				if (result) {
					yield Behavior.performTask(Sound.play('wellDone'));
				} else {
					yield Behavior.performTask(Sound.play('obeyTheRules'));
				}

				entities.remove(case1Text);
				entities.add(case2Text);
				yield showText(case2Text)

				var result = yield Behavior.first(
					Behavior.run(function*() {
						yield Behavior.mouseDown();
						return false;
					}),
					Behavior.run(function*() {
						yield lightCycle();
						return true;
					})
				);
				behaviorSystem.add(Behavior.run(function*() {
					yield fadeOut(redLight, 0.5);
					entities.remove(redLight);
				}));
				if (result) {
					yield Behavior.performTask(Sound.play('wellDone'));
				} else {
					yield Behavior.performTask(Sound.play('obeyTheRules'));
				}
			}),
			Behavior.run(function*() {
				yield Behavior.interval(0.5, function(progress) {
					door.pos.y = -progress * 720;
				});
				yield Behavior.interval(2.0, function(progress) {
					player.pos = vlerp(startPlayerPos, vec(640, 720), progress);
				});
				yield Behavior.interval(0.5, function(progress) {
					door.pos.y = -720 * (1 - progress);
				});

				yield Behavior.wait(17);
				entities.add(codexText);

				behaviorSystem.add(showText(codexText));

				yield Behavior.wait(9);
				entities.add(case1Text);

				behaviorSystem.add(showText(case1Text));
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