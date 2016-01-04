function renderSprite(context, entity) {
	var pos = entity.pos;
	if (!pos) { return; }

	var sprite = entity.sprite;
	var image = Images.get(sprite.id);
	var anchor = sprite.anchor || vec(0, 0);

	var finalPos = vsub(pos, vmul(anchor, vec(image.width, image.height)));
	context.drawImage(image, finalPos.x, finalPos.y);
}
