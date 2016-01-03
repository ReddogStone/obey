function vec(x, y) {
	return { x: x, y: y };
}

function vadd(v1, v2) {
	return vec(v1.x + v2.x, v1.y + v2.y);
}
function vsub(v1, v2) {
	return vec(v1.x - v2.x, v1.y - v2.y);
}

function vneg(v) {
	return vec(-v.x, -v.y);
}
function vscale(v, s) {
	return vec(v.x * s, v.y * s);
}

function vmul(v1, v2) {
	return vec(v1.x * v2.x, v1.y * v2.y);
}

function vsqlen(v) {
	return v.x * v.x + v.y * v.y;
}

function vlen(v) {
	return Math.sqrt(vsqlen(v));
}

function vnorm(v) {
	return vscale(v, 1.0 / vlen(v));
}

function vdir(from, to) {
	return vnorm(vsub(to, from));
}
