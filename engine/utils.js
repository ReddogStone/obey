(function() {
	if (!Array.prototype.findIndex) {
		Array.prototype.findIndex = function(predicate, thisArg) {
			if (this == null) {
				throw new TypeError('Array.prototype.find called on null or undefined');
			}
			if (typeof predicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}

			var l = this.length;
			for (var i = 0; i < l; i++) {
				if (predicate.call(thisArg, this[i], i, this)) {
					return i;
				}
			}

			return -1;
		};
	}

	if (!Array.prototype.find) {
		Array.prototype.find = function(predicate, thisArg) {
			var index = this.findIndex(predicate, thisArg);
			return (index >= 0) ? this[index] : undefined;
		};
	}

/*	function defObjectMethod(name, method) {
		try {
			Object.defineProperty(Object.prototype, name, { enumerable: false, value: method });
		} catch (e) {
			console.log(e);
		}
	}

	defObjectMethod('forEach', function(func, thisArg) {
		var keys = Object.keys(this);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			func.call(thisArg, this[key], key, this);
		}
	});
	defObjectMethod('map', function(func, thisArg) {
		var result = {};
		var keys = Object.keys(this);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			result[key] = func.call(thisArg, this[key], key, this);
		}
		return result;
	});
	defObjectMethod('filter', function(func, thisArg) {
		var result = {};
		var keys = Object.keys(this);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var value = this[key];
			if (func.call(thisArg, value, key, this)) {
				result[key] = value;
			}
		}
		return result;
	});
	defObjectMethod('every', function(func, thisArg) {
		var keys = Object.keys(this);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (!func.call(thisArg, this[key], key, this)) {
				return false;
			}
		}
		return true;
	});
	defObjectMethod('some', function(func, thisArg) {
		var keys = Object.keys(this);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (func.call(thisArg, this[key], key, this)) {
				return true;
			}
		}
		return false;
	});

	var findKeyIndex = function(func, thisArg) {
		var keys = Object.keys(this);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (func.call(thisArg, this[key], key, this)) {
				return i;
			}
		}
		return -1;
	};
	defObjectMethod('findKey', function(predicate, thisArg) {
		var index = findKeyIndex.call(this, predicate, thisArg);
		return (index >= 0) ? Object.keys(this)[index] : undefined;
	});
	defObjectMethod('find', function(predicate, thisArg) {
		var key = this.findKey.call(this, predicate, thisArg);
		return (key !== undefined) ? this[key] : undefined;
	});

	defObjectMethod('clone', function() {
		var result = {};
		for (var key in this) {
			result[key] = this[key];
		}
		return result;
	});

	defObjectMethod('merge', function(other) {
		var result = this.clone();
		for (var key in other) {
			result[key] = other[key];
		}
		return result;
	});
	defObjectMethod('with', function(key, value) {
		if (Array.isArray(key)) {
			if (key.length === 0) { throw new Error('Need at least one key element for "with"!'); }
			if (key.length > 1) {
				return this.with(key[0], this[key[0]].with(key.slice(1), value));
			}
			key = key[0];
		}

		var result = this.clone();
		result[key] = value;
		return result;
	});

	defObjectMethod('without', function(key) {
		return this.filter(function(value, myKey) {
			return myKey !== key;
		});
	});

	defObjectMethod('transpose', function(key, value) {
		var result = {};
		this.forEach(function(key, value) {
			result[value] = result[value] || [];
			result[value].push(key);
		});
		return result;
	}); */

	Object.values = function(obj) {
		return Object.keys(obj).map(function(key) { return obj[key]; });
	};
})();
