var MainGameBehavior = (function() {
	var PLAYER_POS = Point.make(100, 500);
	var MONSTER_START = Point.make(1024, 500);

	function getRenderList(world, time) {
		if (world.state === 'splash') {
			return [
				{
					renderScript: { name: 'splash', textures: ['Splash1', 'Splash2'] }
				}
			]
		}


		var doorX = 0;

		var playerY = 0;

		var newPlayerX = 0;
		var armX = PLAYER_INITIAL_X;

		var trapX = 0;

		var lightBulbAlpha = 0.0;

		if (world.state === 'intro') {
			var dt = time - world.startTime;
			if (dt < TRAP_OPEN_TIME) {
				trapX = dt / TRAP_OPEN_TIME * TRAP_OPEN_X;
			} else if (dt < OLD_PLAYER_DIE_TIME) {
				trapX = TRAP_OPEN_X;
			} else if (dt < OLD_PLAYER_DIE_TIME + TRAP_CLOSE_TIME) {
				trapX = (OLD_PLAYER_DIE_TIME + TRAP_CLOSE_TIME - dt) / TRAP_CLOSE_TIME * TRAP_OPEN_X;			
			}

			if (dt < OLD_PLAYER_DIE_TIME) {
				if (dt > OLD_PLAYER_DIE_TIME - DOOR_OPEN_TIME) {
					doorX = DOOR_OPEN_X - (OLD_PLAYER_DIE_TIME - dt) / DOOR_OPEN_TIME * DOOR_OPEN_X;
				}
			} else if (dt < OLD_PLAYER_DIE_TIME + NEW_PLAYER_DELIVERY_TIME + ARM_BACK) {
				doorX = DOOR_OPEN_X;
				if (dt > OLD_PLAYER_DIE_TIME + NEW_PLAYER_DELIVERY_TIME + ARM_BACK - DOOR_OPEN_TIME) {
					doorX = (OLD_PLAYER_DIE_TIME + NEW_PLAYER_DELIVERY_TIME + ARM_BACK - dt) / DOOR_OPEN_TIME * DOOR_OPEN_X;
				}
			}

			if (dt < OLD_PLAYER_DIE_TIME) {
				newPlayerX = PLAYER_INITIAL_X;
				playerY = PLAYER_INITIAL_Y;
			} else if (dt < OLD_PLAYER_DIE_TIME + NEW_PLAYER_DELIVERY_TIME) {
				var progress = (OLD_PLAYER_DIE_TIME + NEW_PLAYER_DELIVERY_TIME - dt) / NEW_PLAYER_DELIVERY_TIME;
				newPlayerX = progress * PLAYER_INITIAL_X;
				playerY = PLAYER_INITIAL_Y;
				armX = newPlayerX;
			} else if (dt < OLD_PLAYER_DIE_TIME + NEW_PLAYER_DELIVERY_TIME + ARM_BACK) {
				var progress = (OLD_PLAYER_DIE_TIME + NEW_PLAYER_DELIVERY_TIME + ARM_BACK - dt) / ARM_BACK;
				playerY = progress * PLAYER_INITIAL_Y;
				armX = (1.0 - progress) * PLAYER_INITIAL_X;
			}
		}

		if (world.state === 'round' || world.state === 'after-round') {
			var dt = time - world.roundStart;
			if (dt > LIGHT_START && dt < LIGHT_END) {
				lightBulbAlpha = 1.0;
			}
		}

		var playerFrame = 0;
		if (world.lastPress > world.roundStart) {
			var frameDelta = time - world.lastPress;
			playerFrame = Math.floor(frameDelta * 7);
			if (playerFrame > 6) { playerFrame = 0; }
		}

		var result = [
			{
				renderScript: { name: 'background', textures: ['background'] }
			},
			{
				renderScript: { name: 'background', textures: ['layer01'] }
			},
			{
				pos: { x: -trapX, y: 720 },
				renderScript: { name: 'simple', textures: ['layer02'] }
			},
			{
				pos: { x: trapX, y: 720 },
				renderScript: { name: 'simple', textures: ['layer03'] }
			},
			{
				pos: { x: doorX, y: 720 },
				renderScript: { name: 'simple', textures: ['layer04'] }
			},
			{
				renderScript: { name: 'background', textures: ['layer05'] }
			},
			{
				pos: { x: newPlayerX + 550, y: 550 + playerY},
				frame: playerFrame,
				renderScript: { name: 'player', textures: ['player_anim'] }
			},
			{
				pos: { x: armX, y: 720 + playerY},
				renderScript: { name: 'simple', textures: ['layer06'] }
			},
			{
				renderScript: { name: 'background', textures: ['layer05_a'] }
			},
			{
				renderScript: { name: 'background', textures: ['layer07'] }
			},
			{
				pos: { x: 0, y: 720},
				alpha: lightBulbAlpha,
				renderScript: { name: 'simple', textures: ['layer08'] }
			},
			{
				pos: { x: 0, y: 720},
				alpha: world.stage > 0 ? Math.sin(time - world.roundStart) : 0.0,
				renderScript: { name: 'simple', textures: ['layer09'] }
			},
			{
				renderScript: { name: 'background', textures: ['layer10'] }
			},
		];

		return result;
	}

	function draw(world, context, time) {
		Renderer.draw(context, world.assets, getRenderList(world, time), time);
	}

	var WARNING_SOUNDS = {
		1: 'bad1',
		2: 'bad2',
		3: 'termination'
	};

	function finishRound(world, voiceName) {
		return world.merge({
			voice: Sound.play(voiceName),
			state: 'after-round'
		});
	}

	function warn(world) {
		if (world.warnings >= 2) {
			return world.merge({
				state: 'before-death',
				voice: Sound.play('termination')
			});
		}
		world = world.with('warnings', world.warnings + 1);
		return finishRound(world, WARNING_SOUNDS[world.warnings]);
	}

	function update(world, deltaTime, time) {
		if (world.state === 'splash') { return world; }

		if (world.state === 'before-death') {
			if (world.voice && world.voice.finished) {
				Sound.play('playerOut');
				return createWorld(world.assets, time, 'intro');
			}
			return world;
		}

		if (world.state === 'intro') {
			if (world.voice) {
				var finished = world.voice.finished;
				if (finished) {
					return world.merge({
						state: 'round',
						roundStart: time + 1
					}).without('voice');
				}
			} else if (time > world.startTime + OLD_PLAYER_DIE_TIME + NEW_PLAYER_DELIVERY_TIME + ARM_BACK) {
				return world.with('voice', Sound.play('intro'));
			}

			var dt = time - world.startTime;
			if (!world.playerInPlayed && dt > OLD_PLAYER_DIE_TIME) {
				Sound.play('playerIn');
				return world.with('playerInPlayed', true);
			}

			return world;
		}

		if (world.state === 'round') {
			if (time - world.roundStart > LIGHT_END) {
				world = warn(world);
			}

			if (world.lastPress > world.roundStart && time - world.lastPress > 0.5) {
				var dt = world.lastPress - world.roundStart;
				if ((dt > LIGHT_START) && (dt < LIGHT_END)) {
					var goodSound = world.shortGood ? 'good2' : 'good1';
					world = finishRound(world, goodSound).with('shortGood', true);
				} else {
					world = warn(world);
				}
			}
		}

		if (world.voice && world.voice.finished) {
			world = world.without('voice');
		}

		var roundStart = world.roundStart;

		if (time - world.roundStart > ROUND_LENGTH && !world.voice) {
			Sound.play(world.stage === 0 ? 'amb' : 'ambVolt');
			return world.merge({
				roundStart: world.roundStart + ROUND_LENGTH,
				state: 'round'
			});
		}

		return world.merge({
			roundStart: roundStart
		});
	}

	function keyDown(world, event, time) {
		if (event.which !== 32) { return world; }

		if (world.voice && world.state === 'after-round') {
			return world;
		}

		var dt = time - world.roundStart;

		if (dt > LIGHT_END) {
			world = warn(world);
		}

		if ((world.stage === 0) && (time - world.lastPress < 0.5)) {
			if (dt > LIGHT_START && dt < LIGHT_END) {
				world = finishRound(world, 'multiplePress');
				world = world.with('stage', 1);
			}
		}

		Sound.play('buttonPress');

		return world.with('lastPress', time);
	}

	function keyUp(world) {
		return world.with('buttonPressed', false);
	}

	function createWorld(assets, time, initState) {
		return {
			assets: assets,
			entities: {
			},
			warnings: 0,
			stage: 0,
			state: initState,
			lastPress: -10000,
			voltMeterLight: 0,
			roundStart: time,
			startTime: time
		};
	}

	function handleGameState(world, eventType, data, time) {
		switch (eventType) {
			case 'mousedown':
				if (world.state === 'splash') {
					return createWorld(world.assets, time, 'intro');
				} 
				return world;
			case 'keydown': return keyDown(world, data, time);
			case 'keyup':
				return keyUp(world, data, time);
			case 'update': return update(world, data, time);

			case 'draw': draw(world, data, time); break;
		}

		return world;
	}

	return StatefulBehavior(function init(assets, startTime) {
		return createWorld(assets, startTime - OLD_PLAYER_DIE_TIME, 'splash')/*.with('initial', 0)*/;
	}, function handleEvent(world, eventType, data, time) {
		var newWorld = handleGameState(world, eventType, data, time);

		return {
			state: newWorld,
			result: newWorld.win
		};
	});
})();

var MainGame = function(eventQueue) {
	var splash = (function() {
		var start = Time.now();

		return Async.doUntil(
			Async.cont(function(callback) {
				return eventQueue.nextRender(function(canvas, context, assets) {
					var dt = Time.now() - start;
					var frame = Math.floor(dt % 2) + 1;
					context.drawImage(assets.textures['splash' + frame], 0, 0);

					callback();
				})
			}),
			eventQueue.nextMouseDown
		);
	})();

	function renderPlayer(context, x, y, scale, texture, frame) {
		var frame = frame || 0;
		var w = texture.width;
		var h = texture.height;

		context.save();
		context.translate(x, y);
		context.translate(w / 7 * 0.5, h * 0.9);
		context.scale(scale, scale);
		context.translate(-w / 7 * 0.5, -h * 0.9);
		context.drawImage(texture, frame * w / 7, 0, w / 7, h, 0, 0, w / 7, h);
		context.restore();
	}

	var playerYFunc = UnaryFunction.piecewise(
		226, OLD_PLAYER_DIE_TIME,
		UnaryFunction.const(226 + PLAYER_INITIAL_Y), NEW_PLAYER_DELIVERY_TIME - 0.3,
		UnaryFunction.linear(226), 0.3
	);
	var playerXFunc = UnaryFunction.piecewise(
		550, OLD_PLAYER_DIE_TIME,
		UnaryFunction.const(550 + PLAYER_INITIAL_X), 0.01,
		UnaryFunction.linear(550), NEW_PLAYER_DELIVERY_TIME - 0.6
	);

	var playerScaleFunc = UnaryFunction.piecewise(
		1, 0,
		UnaryFunction.pow(0, 0.2), OLD_PLAYER_DIE_TIME,
		UnaryFunction.const(1), OLD_PLAYER_DIE_TIME + 1
	);

	var trapXFunc = UnaryFunction.piecewise(
		0, 0,
		UnaryFunction.linear(TRAP_OPEN_X), TRAP_OPEN_TIME,
		UnaryFunction.const(TRAP_OPEN_X), OLD_PLAYER_DIE_TIME - TRAP_OPEN_TIME,
		UnaryFunction.linear(0), TRAP_CLOSE_TIME
	);

	var armXFunc = UnaryFunction.piecewise(
		PLAYER_INITIAL_X, OLD_PLAYER_DIE_TIME,
		UnaryFunction.linear(0), NEW_PLAYER_DELIVERY_TIME - 0.6,
		UnaryFunction.const(0), 0.6,
		UnaryFunction.linear(PLAYER_INITIAL_X), ARM_BACK
	);

	var armYFunc = UnaryFunction.piecewise(
		PLAYER_INITIAL_Y, OLD_PLAYER_DIE_TIME + NEW_PLAYER_DELIVERY_TIME - 0.3,
		UnaryFunction.linear(0), 0.3
	);

	var doorXFunc = UnaryFunction.piecewise(
		0, OLD_PLAYER_DIE_TIME - DOOR_OPEN_TIME,
		UnaryFunction.linear(DOOR_OPEN_X), DOOR_OPEN_TIME,
		UnaryFunction.const(DOOR_OPEN_X), NEW_PLAYER_DELIVERY_TIME + ARM_BACK - DOOR_OPEN_TIME,
		UnaryFunction.linear(0), DOOR_OPEN_TIME
	);

	function renderGame(canvas, context, assets, time) {
		var playerX = playerXFunc(time);
		var playerY = playerYFunc(time);
		var trapX = trapXFunc(time);
		var armX = armXFunc(time);
		var armY = armYFunc(time);
		var doorX = doorXFunc(time);
		var playerScale = playerScaleFunc(time);

		context.clearRect(0, 0, canvas.width, canvas.height);

		context.drawImage(assets.textures.layer01, 0, 0);
		context.drawImage(assets.textures.layer02, -trapX, 0);
		context.drawImage(assets.textures.layer03, trapX, 0);
		context.drawImage(assets.textures.layer04, doorX, 0);
		context.drawImage(assets.textures.layer05, 0, 0);
		context.drawImage(assets.textures.layer07, 0, 0);
		context.drawImage(assets.textures.layer06, armX, armY);

		renderPlayer(context, playerX, playerY, playerScale, assets.textures.player);

		context.drawImage(assets.textures.layer05_a, 0, 0);
		context.drawImage(assets.textures.layer08, 0, 0);
		context.drawImage(assets.textures.layer09, 0, 0);
		context.drawImage(assets.textures.layer10, 0, 0);
	}

	var intro = function(startTime) {
		var totalIntroTime = OLD_PLAYER_DIE_TIME + NEW_PLAYER_DELIVERY_TIME + ARM_BACK;

		return Async.doUntil(
			Async.cont(function(callback) {
				return eventQueue.nextRender(function(canvas, context, assets) {
					renderGame(canvas, context, assets, Time.now() - startTime);
					callback();
				})
			}),
			Async.first(
				Async.sequence(
					Async.waitTo(startTime + OLD_PLAYER_DIE_TIME),
					Async.fireAndForget(Sound.play('playerIn')),
					Async.waitTo(startTime + totalIntroTime),
					Sound.play('intro'),
					Async.wait(1)
				),
				eventQueue.nextMouseDown
			)
		);
	};

	var workerCycle = function(startTime) {
		return Async.sequence(
			intro(startTime),
			Async.fireAndForget(Sound.play('playerOut'))
		);
	};

	var game = Async.forever(function(callback) {
		function next(result) {
			var start = Time.now();
			workerCycle(start)(next);
		}
		workerCycle(Time.now() - OLD_PLAYER_DIE_TIME)(next);
	});

	return Async.sequence(splash, game);
};