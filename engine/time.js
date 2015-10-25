var Time = (function() {
	var provider = window.performance ? performance : Date;

	return {
		now: function() {
			return provider.now() * 0.001;
		}
	};
})();