var Images = (function() {
	var pool = {};

	return {
		init: function(descriptions) {
			return function(progress) {
				var count = Object.keys(descriptions).length;
				var remaining = count;

				return function(callback) {
					function onLoadEnd() {
						remaining--;
						progress((count - remaining) / count);

						if (remaining <= 0) {
							callback();
						}
					}

					Object.keys(descriptions).forEach(function(id) {
						var url = descriptions[id];
						var image = pool[id] = new Image();
						image.onload = onLoadEnd;
						image.src = url;
					});
				};
			};
		},
		get: function(id) {
			return pool[id];
		}
	};
})();