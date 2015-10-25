var Sound = (function() {
	var DUPLICATES = 5;
	var pool = {};

	return {
		init: function(sounds) {
			sounds.forEach(function(soundDesc, id) {
				pool[id] = [];
				for (var sourceIndex = 0; sourceIndex < soundDesc.sources.length; sourceIndex++) {
					var source = soundDesc.sources[sourceIndex];
					var variant = [];
					pool[id].push(variant);

					var count = soundDesc.noDuplicates ? 1 : DUPLICATES;
					for (var i = 0; i < count; i++) {
						var sound = new Audio(source.url);
						sound.volume = source.volume || soundDesc.volume;
						sound.load();

						variant.push(sound);
					}
				}
			});
		},
		play: function(id) {
			return Async.cont(function(callback) {
				// console.log('Play "' + id + '"');

				var variants = pool[id];
				var variant = variants[Math.floor(Math.random() * variants.length)];

				var sound = variant.pop();
				variant.unshift(sound);

				sound.currentTime = 0;
				sound.play();

				function onEnded() {
					callback();
					sound.currentTime = 0;
					sound.removeEventListener('ended', onEnded, false);
					delete sound._onEnded;
				}
				sound.addEventListener('ended', onEnded, false);

				sound._onEnded = onEnded;

				return function() {
					sound.pause();
					sound.currentTime = 0;
					sound.removeEventListener('ended', onEnded, false);
				};
			});
		},
		stopAll: function() {
			for (var id in pool) {
				pool[id].forEach(function(variants) {
					variants.forEach(function(sound) {
						sound.pause();
						sound.currentTime = 0;

						if (sound._onEnded) {
							sound._onEnded();
						}
					});
				});
			}
		}
	};
})();