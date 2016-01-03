function rcoords(x, y, sx, sy) {
	return { x: x, y: y, sx: sx, sy: sy };
}

function rcorners(topLeft, bottomRight) {
	return rcoords(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y);
}

function rpointsize(topLeft, size) {
	return rcoords(topLeft.x, topLeft.y, size.x, size.y);
}

function rinside(rect, point) {
	var dx = point.x - rect.x;
	var dy = point.y - rect.y;

	return (dx >= 0) && (dy >= 0) && (dx <= rect.sx) && (dy <= rect.sy);
}
