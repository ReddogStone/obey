var Polygon = (function() {
	function getQuandrant(point) {
		return (point.x > 0) ? 
			((point.y > 0) ? 0 : 3) :
			((point.y > 0) ? 1 : 2)
	}

	function xIntercept(p1, p2) {
		return p2.x - (p2.y * (p1.x - p2.x) / (p1.y - p2.y));
	}

	function getIncrementalAngle(p1, p2) {
		var q1 = getQuandrant(p1);
		var q2 = getQuandrant(p2);
		var delta = q2 - q1;

		switch (delta) {
			case 3: return -1;
			case -3: return 1;

			case 2:
			case -2:
				if (xIntercept(p1, p2) > 0) {
					return -delta;
				}
				break;
		}

		return delta;
	}

	return {
		pointInside: function(vertices, point) {
			var translated = vertices.map(function(vertex) { return Vector.sub(vertex, point); });

			var angle = 0;
			translated.forEach(function(current, index) {
				var next = translated[(index + 1) % translated.length];
				angle += getIncrementalAngle(current, next);
			});

			return (Math.abs(angle) === 4);
		}
	};
})();