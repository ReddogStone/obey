var SpriteSystem = (function() {
	return {
		show: function(context, entities) {
			entities
				.filter(['pos', 'sprite'])
				.sort(function(entity1, entity2) {
					return (entity1.zOrder || 0) - (entity2.zOrder || 0);
				})
				.forEach(function(entity) {
					var pos = entity.pos;
					var sprite = entity.sprite;
					var image = Images.get(sprite.id);
					var anchor = sprite.anchor || vec(0, 0);

					var finalPos = vsub(pos, vmul(anchor, vec(image.width, image.height)));
					context.drawImage(image, finalPos.x, finalPos.y);
				});
		}
	};
})();