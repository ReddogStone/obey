var SpriteSystem = (function() {
	return {
		show: function(context, entities) {
			entities
				.filter(['pos', 'sprite'])
				.sort(function(entity1, entity2) {
					return entity1.zOrder - entity2.zOrder;
				})
				.forEach(function(entity) {
					var pos = entity.pos;
					var sprite = entity.sprite;
					var image = Images.get(sprite.id);

					var finalPos = vsub(pos, vmul(sprite.anchor, vec(image.width, image.height)));
					context.drawImage(image, finalPos.x, finalPos.y);
				});
		}
	};
})();