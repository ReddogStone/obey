var EventQueue = function(nextRender) {
	var mouseDownQueue = {};
	var mouseDownIndex = 0;
	var nextMouseDown = Async.cont(function(callback) {
		var index = mouseDownIndex++;
		mouseDownQueue[index] = callback;

		return function() {
			delete mouseDownQueue[index];
		};
	});
	function onMouseDown(mousePos) {
		console.log('onMouseDown: listener count:', Object.keys(mouseDownQueue).length);

		var queue = mouseDownQueue;

		mouseDownQueue = {};

		queue.forEach(function(callback) {
			callback(mousePos);
		});
	}

	return {
		nextRender: nextRender,
		onMouseDown: onMouseDown,
		nextMouseDown: nextMouseDown
	};
};