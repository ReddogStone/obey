var Vector = (function() {
	var make = Point.make;

	function add(v1, v2) {
		return make(v1.x + v2.x, v1.y + v2.y);
	}
	function sub(v1, v2) {
		return make(v1.x - v2.x, v1.y - v2.y);
	}

	function neg(v) {
		return make(-v.x, -v.y);
	}
	function mul(v, s) {
		return make(v.x * s, v.y * s);
	}

	function sqLength(v) {
		return v.x * v.x + v.y * v.y;
	}

	function length(v) {
		return Math.sqrt(sqLength(v));
	}

	function normalize(v) {
		return mul(v, 1.0 / length(v));		
	}

	return {
		make: make,
		clone: Point.clone,
		add: add,
		neg: neg,
		mul: mul,
		sub: sub,
		lerp: function(v1, v2, a) {
			return add(mul(v1, 1 - a), mul(v2, a));
		},
		sqLength: sqLength,
		length: length,
		normalize: normalize,
		direction: function(p1, p2) {
			return normalize(sub(p2, p1));
		}
	}
})();