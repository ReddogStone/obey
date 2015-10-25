var Rect = (function() {
	function make(x, y, sx, sy) {
		return { x: x, y: y, sx: sx, sy: sy };
	}

	return {
		coords: make,
		corners: function(topLeft, bottomRight) {
			return make(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
		},
		posSize: function(topLeft, size) {
			return make(topLeft.x, topLeft.y, size.x, size.y);
		},
		pointInside: function(rect, point) {
			var dx = point.x - rect.x;
			var dy = point.y - rect.y;

			return (dx >= 0) && (dy >= 0) && (dx <= rect.sx) && (dy <= rect.sy);
		}
	};
})();