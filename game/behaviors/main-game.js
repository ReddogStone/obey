var MainGame = function(eventQueue) {
	var splash = (function() {
		var start = Time.now();

		return Async.doWhileSecondRunning(
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

	function renderIntro(canvas, context, assets, time) {
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
		context.drawImage(assets.textures.layer10, 0, 0);
	}

	var redLightFunc = UnaryFunction.piecewise(
		0, LIGHT_START,
		UnaryFunction.const(1), LIGHT_END - LIGHT_START,
		UnaryFunction.const(0), 0.01
	);

	function voltage(t) {
		var angle = t / ROUND_LENGTH * 4 * Math.PI;
		return Math.sin(angle);
	}

	function renderRound(canvas, context, assets, time, pressTime, stage) {
		context.clearRect(0, 0, canvas.width, canvas.height);

		context.drawImage(assets.textures.layer01, 0, 0);
		context.drawImage(assets.textures.layer02, 0, 0);
		context.drawImage(assets.textures.layer03, 0, 0);
		context.drawImage(assets.textures.layer04, 0, 0);
		context.drawImage(assets.textures.layer05, 0, 0);
		context.drawImage(assets.textures.layer07, 0, 0);

		if (stage > 0) {
			var v = voltage(time);

			context.globalAlpha = v * v;
			context.drawImage(assets.textures.layer09, 0, 0);
			context.globalAlpha = 1;

			context.save();
			context.translate(92, 7);
			context.translate(340, 440);
			context.rotate(v * Math.PI * 0.2 + Math.PI * 0.3);
			context.translate(-92, -7);
			context.drawImage(assets.textures.arrow, 0, 0);
			context.restore();
		}

		var frame = 0;
		if (pressTime !== undefined) {
			frame = Math.floor((time - pressTime) * 15);
			if (frame > 6) {
				frame = 0;
			}
		}
		renderPlayer(context, 550, 226, 1, assets.textures.player, frame);

		context.drawImage(assets.textures.layer05_a, 0, 0);

		context.globalAlpha = redLightFunc(time);
		context.drawImage(assets.textures.layer08, 0, 0);
		context.globalAlpha = 1;

		context.drawImage(assets.textures.layer10, 0, 0);
	}

	var intro = function(startTime) {
		var totalIntroTime = OLD_PLAYER_DIE_TIME + NEW_PLAYER_DELIVERY_TIME + ARM_BACK;

		return Async.doWhileSecondRunning(
			Async.cont(function(callback) {
				return eventQueue.nextRender(function(canvas, context, assets) {
					renderIntro(canvas, context, assets, Time.now() - startTime);
					callback();
				})
			}),
			Async.sequence(
				Async.first(
					Async.sequence(
						Async.waitTo(startTime + OLD_PLAYER_DIE_TIME),
						Async.fireAndForget(Sound.play('playerIn')),
						Async.waitTo(startTime + totalIntroTime),
						Sound.play('intro')
					),
					eventQueue.nextMouseDown
				),
				Async.wait(1)
			)
		);
	};

	var performRound = function(stage, startTime) {
		var rest = Async.cont(function(callback) {
			Async.first(
				Async.ret(Async.waitTo(startTime + ROUND_LENGTH), true),
				Async.ret(eventQueue.nextMouseDown, false)
			)(function(ok) {
				if (ok) {
					return callback({ roundEnd: true });
				}
				callback({ warning: true, press: true }, rest);
			});
		});

		if (stage === 0) {
			var afterPress = Async.cont(function(callback) {
				Async.first(
					Async.ret(Async.wait(0.5), false),
					Async.ret(eventQueue.nextMouseDown, true)
				)(function(nextStage) {
					if (nextStage) {
						return callback({ press: true, nextStage: true }, rest);
					}
					callback({ wellDone: true }, rest);
				});
			});
		} else if (stage === 1) {
			var afterPress = Async.cont(function(callback) {
				eventQueue.nextMouseDown(function() {
					var deltaTime = Time.now() - startTime;
					var v = voltage(deltaTime);

					var event = { press: true };
					if (v < 0) {
						event.nextStage = true;
					} else {
						event.warning = true;
					}

					callback(event, rest);
				});
			});
		} else {
			var afterPress = rest;
		}

		var beforePress = Async.cont(function(callback) {
			Async.first(
				Async.ret(eventQueue.nextMouseDown, true),
				Async.ret(Async.waitTo(startTime + LIGHT_END), false)
			)(function(press) {
				if (press) {
					var event = { press: true };
					switch (stage) {
						case 1:
							event.wellDone = true;
							break;
						case 2:
							event.warning = true;
							break;
					}
					return callback(event, afterPress);
				}
				callback((stage < 2) ? { warning: true } : { nextStage: true }, rest);
			});
		});

		return beforePress;
	};

	var performStages = function(startTime) {
		var pressTime;
		var roundStart = startTime;
		var warnings = 0;
		var shortGood = false;
		var cancelWellDone;
		var cancelWarning;
		var endRound;
		var stage = 0;

		return Async.doWhileSecondRunning(
			Async.cont(function(callback) {
				return eventQueue.nextRender(function(canvas, context, assets) {
					renderRound(canvas, context, assets, Time.now() - roundStart, pressTime, stage);
					callback();
				})
			}),
			Async.cont(function(callback) {
				function processNextEvent(event, nextState) {
					if (event.press) {
						Sound.play('buttonPress')(function() {});
						pressTime = Time.now() - roundStart;
					}

					if (event.warning) {
						warnings++;
						console.log('Warning!');

						if (warnings > 2) {
							return callback();
						}

						if (cancelWellDone) { cancelWellDone(); }
						if (cancelWarning) { cancelWarning(); }
						cancelWarning = Sound.play('bad' + warnings)(function() {
							cancelWarning = null;
							Async.wait(1)(function() {
								if (endRound) { endRound(); }
							});
						});
					}

					if (event.wellDone) {
						var soundName = shortGood ? 'good2' : 'good1';
						if (!shortGood) { shortGood = true; }
						cancelWellDone = Sound.play(soundName)(function() {});
					}

					if (event.nextStage) {
						var sound;
						switch (stage) {
							case 0: sound = 'multiplePress'; break;
							case 1: sound = 'instability'; break;
							case 2: sound = 'overload'; break;
						}
						if (sound) {
							Sound.play(sound)(function() {});
						}
						stage++;

						if (cancelAmb) { cancelAmb(); }
						Sound.play(stage === 0 ? 'amb' : 'ambVolt')(function() {});
					}

					if (event.roundEnd) {
						var end = function() {
							roundStart = Time.now();
							pressTime = undefined;

							if (cancelAmb) { cancelAmb(); }
							Sound.play(stage === 0 ? 'amb' : 'ambVolt')(function() {});

							nextState = performRound(stage, roundStart);
							nextState(processNextEvent);
						};
						if (!cancelWarning) {
							end();
						} else {
							endRound = end;
						}
						return;
					}

					nextState(processNextEvent);
				}

				var cancelAmb = Sound.play('amb')(function() {});
				var initialRoundState = performRound(stage, startTime);
				initialRoundState(processNextEvent);
			})
		);
	};

	var workerCycle = function(startTime) {
		return Async.sequence(
			intro(startTime),
			Async.then(function() {
				return performStages(Time.now());
			}),
			Sound.play('termination'),
			Async.wait(0.5),
			Async.fireAndForget(Sound.play('playerOut'))
		);
	};

	var game = Async.cont(function(callback) {
		function next(result) {
			var start = Time.now();
			workerCycle(start)(next);
		}
		workerCycle(Time.now() - OLD_PLAYER_DIE_TIME)(next);
	});

	return Async.sequence(splash, game);
};