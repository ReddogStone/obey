var Sound = (function() {
	var DUPLICATES = 5;
	var pool = {};

	var playing = [];

	function stop(sound) {
		sound.pause();
		sound.currentTime = 0;
	}

	function registerPlaying(sound) {
		playing.push(sound);
	}

	function unregisterPlaying(sound) {
		playing.splice(playing.indexOf(sound), 1);
	}

	return {
		init: function(sounds) {
			return function(progress) {
				var count = Object.keys(sounds).length * DUPLICATES;
				var remaining = count;

				return function(callback) {
					function onLoadEnd() {
						remaining--;
						progress((count - remaining) / count);

						if (remaining <= 0) {
							callback();
						}
					}

					Object.keys(sounds).forEach(function(id) {
						var desc = sounds[id];

						var list = pool[id] = [];
						for (var i = 0; i < DUPLICATES; i++) {
							var sound = new Audio(desc.url);
							sound.oncanplaythrough = onLoadEnd;

							sound.volume = desc.volume;
							sound.load();

							list.push(sound);
						}
					});
				};
			};
		},
		play: function(id) {
			return Async.cancellable(function(callback) {
				// console.log('Play "' + id + '"');

				var list = pool[id];
				var sound = list.pop();
				list.unshift(sound);

				registerPlaying(sound);

				sound.currentTime = 0;
				sound.play();

				function onEnded() {
					sound.removeEventListener('ended', onEnded, false);
					sound.currentTime = 0;

					unregisterPlaying(sound);

					callback(null);
				}
				sound.addEventListener('ended', onEnded, false);

				return function() {
					stop(sound);
					unregisterPlaying(sound);
					sound.removeEventListener('ended', onEnded, false);
				};
			});
		},
		stopAll: function() {
			playing.forEach(stop);
		},
		pauseAll: function() {
			playing.forEach(function(sound) { sound.pause(); });
		},
		resumeAll: function() {
			playing.forEach(function(sound) { sound.play(); });
		},
	};
})();