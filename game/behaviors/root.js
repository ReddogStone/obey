var RootBehavior = (function() {
	function getScriptPath(scriptName) {
		return 'game/assets/render-scripts/' + scriptName + '.js';
	}

	function getTexturePath(textureName) {
		return 'game/assets/textures/' + textureName + '.png';
	}

	var renderScriptUrls = [
		'background',
		'simple',
		'player',
		'splash'
	].map(getScriptPath);

	var textureNames = [
		'background',
		'layer01',
		'layer02',
		'layer03',
		'layer04',
		'layer05',
		'layer05_a',
		'layer06',
		'layer07',
		'layer08',
		'layer09',
		'layer10',
		'Splash1',
		'Splash2',
		'player_anim'
	];

	var renderScriptCache = {};
	var textureCache = {};

	var assets = {};

	function loadScriptCache() {
		renderScriptUrls.forEach(function(url) {
			ScriptLoader.load(url, {}, function(err, script, cache) {
				if (err) {
					return console.log(err);
				}
				Object.keys(cache).forEach(function(id) {
					renderScriptCache[id] = cache[id];
				});
			});
		});

		textureNames.forEach(function(name) {
			var image = new Image();
			image.src = getTexturePath(name);
			image.onload = function() {
				textureCache[name] = image;
			};
		});

		assets = {
			renderScripts: renderScriptCache,
			textures: textureCache
		};
	}

	function getGrade(duration) {
		if (duration > 5 * 60) {
			return 0;
		} else if (duration > 2 * 60) {
			return 1;
		} else if (duration > 1 * 60) {
			return 2;
		} else if (duration > 30) {
			return 3;
		} else {
			return 4;
		}
	}

	function makeLevel(levelIndex, startTime, gameState) {
		return main({ index: levelIndex, startTime: startTime }, gameState || { level: true }, MainGameBehavior.init(assets, levelIndex));
	}

	function main(next) {
		return function(eventType, data, time) {
			var answer = next(eventType, data, time);
			if (answer.result) {
				Sound.play('win');
				return main(answer.next);
			}

			next = answer.next;

			return main(next);
		};
	}

	return {
		init: function() {
			document.getElementById('btnReload').addEventListener('click', function() {
				loadScriptCache();
			}, false);

			loadScriptCache();
			var time = 0.35;
			return main(MainGameBehavior.init(assets, time));
		}
	};
})();