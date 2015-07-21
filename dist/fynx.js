var Fynx =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _axn = __webpack_require__(1);

	var _axn2 = _interopRequireDefault(_axn);

	var createAction = _axn2['default'];
	exports.createAction = createAction;
	var createAsyncAction = _axn2['default'].async;

	exports.createAsyncAction = createAsyncAction;

	var _createActions2 = __webpack_require__(2);

	var _createActions3 = _interopRequireDefault(_createActions2);

	exports.createActions = _createActions3['default'];

	var _createAsyncActions2 = __webpack_require__(3);

	var _createAsyncActions3 = _interopRequireDefault(_createAsyncActions2);

	exports.createAsyncActions = _createAsyncActions3['default'];

	var _createRawStore2 = __webpack_require__(4);

	var _createRawStore3 = _interopRequireDefault(_createRawStore2);

	exports.createStore = _createRawStore3['default'];

	var _createRawStore4 = _interopRequireDefault(_createRawStore2);

	exports.createRawStore = _createRawStore4['default'];

	var _createImmutableStore2 = __webpack_require__(5);

	var _createImmutableStore3 = _interopRequireDefault(_createImmutableStore2);

	exports.createImmutableStore = _createImmutableStore3['default'];

	var _createKeyedStore2 = __webpack_require__(7);

	var _createKeyedStore3 = _interopRequireDefault(_createKeyedStore2);

	exports.createKeyedStore = _createKeyedStore3['default'];

	var _createCursorStore2 = __webpack_require__(8);

	var _createCursorStore3 = _interopRequireDefault(_createCursorStore2);

	exports.createCursorStore = _createCursorStore3['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	/*jshint es3: true */
	/*global module, Promise */
	'use strict';
	function createAction(spec, base) {
	  function action(data) {
	    return action.emit(data);
	  }
	  action._listeners = [];
	  if (spec) ext(action, spec);
	  return ext(action, base);
	}

	function axn(spec) {
	  return createAction(spec, axn.methods);
	}

	function aaxn(spec) {
	  return ext(createAction(spec, aaxn.methods), axn.methods);
	}

	function ext(obj, src) {
	  for (var key in src) {
	    if (src.hasOwnProperty(key)) {
	      if (obj.hasOwnProperty(key)) continue;
	      obj[key] = src[key];
	    }
	  }
	  return obj;
	}

	axn.methods = {
	  _cb: function (fn, ctx) {
	    return function (data, result) {
	      return fn.call(ctx, data, result);
	    };
	  },
	  _listen: function (fn, ctx, once) {
	    var cb = this._cb(fn, ctx);
	    this._listeners.push(cb);
	    cb.ctx = ctx;
	    cb.fn = fn;
	    cb.once = once;
	    var self = this;
	    return function () {
	      var i = self._listeners.indexOf(cb);
	      if (i === -1) return false;
	      self._listeners.splice(i, 1);
	      return true;
	    };
	  },
	  listenOnce: function (fn, ctx) {
	    return this._listen(fn, ctx, true);
	  },
	  listen: function (fn, ctx) {
	    return this._listen(fn, ctx, false);
	  },
	  unlisten: function (fn, ctx) {
	    for (var i = 0; i < this._listeners.length; i++) {
	      var listener = this._listeners[i];
	      if (listener.fn === fn && listener.ctx === ctx) {
	        this._listeners.splice(i, 1);
	        return true;
	      }
	    }
	    return false;
	  },
	  shouldEmit: function (/* data */) {
	    return true;
	  },
	  beforeEmit: function (data) {
	    return data;
	  },
	  _beforeEmit: function (data) {
	    return data;
	  },
	  _afterEmit: function (result/*, data */) {
	    return result;
	  },
	  emit: function (/* ...data */) {
	    var data = Array.prototype.slice.call(arguments);
	    if (data.length < 2) data = data[0];
	    data = this.beforeEmit(data);
	    var initial = this._beforeEmit(data);
	    var result = initial;
	    if (!this.shouldEmit(data)) return result;
	    for (var i = 0; i < this._listeners.length; i++) {
	      var listener = this._listeners[i];
	      result = listener(data, result, initial);
	      if (listener.once) {
	        this._listeners.splice(i, 1);
	        i -= 1;
	      }
	    }
	    result = this._afterEmit(result, initial);
	    return result;
	  }
	};

	aaxn.methods = {
	  _cb: function (fn, ctx) {
	    return function (data, p, p0) {
	      return p.then(function (result) {
	        if (p0._cancelled) return Promise.reject(new Error(p0._cancelled));
	        return fn.call(ctx, data, result);
	      });
	    };
	  },
	  _beforeEmit: function (data) {
	    return ext(Promise.resolve(data), {
	      _cancelled: false
	    });
	  },
	  _afterEmit: function (p, p0) {
	    return ext(p.then(function (value) {
	      if (p0._cancelled) return Promise.reject(new Error(p0._cancelled));
	      return value;
	    }), {
	      cancel: function (reason) {
	        p0._cancelled = reason || 'cancelled';
	      },
	      cancelled: function () {
	        return Boolean(p0._cancelled);
	      }
	    });
	  }
	};

	axn.async = aaxn;
	module.exports = axn;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var axn = __webpack_require__(1);

	module.exports = function createActions(specs) {
	  var obj = {};
	  if (Array.isArray(specs)) {
	    specs.forEach(function (name) {
	      obj[name] = axn();
	    });
	  } else {
	    Object.keys(specs).forEach(function (name) {
	      obj[name] = axn(specs[name]);
	    });
	  }
	  return obj;
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var aaxn = __webpack_require__(1).async;

	module.exports = function createActions(specs) {
	  var obj = {};
	  if (Array.isArray(specs)) {
	    specs.forEach(function (name) {
	      obj[name] = aaxn();
	    });
	  } else {
	    Object.keys(specs).forEach(function (name) {
	      obj[name] = aaxn(specs[name]);
	    });
	  }
	  return obj;
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = createRawStore;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _axn = __webpack_require__(1);

	var _axn2 = _interopRequireDefault(_axn);

	function createRawStore() {
	  var emptyValue = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	  var prepare = arguments.length <= 1 || arguments[1] === undefined ? function (v) {
	    return v;
	  } : arguments[1];
	  var isEmpty = arguments.length <= 2 || arguments[2] === undefined ? Object.is : arguments[2];

	  var action = (0, _axn2['default'])();
	  var emptyAction = (0, _axn2['default'])();
	  var state = emptyValue;
	  function store(value) {
	    if (value !== undefined) {
	      state = value === null ? emptyValue : prepare(value);
	      action(state);
	      emptyAction(Boolean(isEmpty(state, emptyValue)));
	    }
	    return state;
	  }
	  store.listen = action.listen.bind(action);
	  store.unlisten = action.unlisten.bind(action);
	  store.isEmpty = function () {
	    return isEmpty(state, emptyValue);
	  };
	  store.isEmpty.listen = emptyAction.listen.bind(emptyAction);
	  store.isEmpty.unlisten = emptyAction.unlisten.bind(emptyAction);
	  store.toJSON = function () {
	    return state && state.toJSON ? state.toJSON() : state;
	  };
	  return store;
	}

	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = createImmutableStore;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _immutable = __webpack_require__(6);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _createRawStore = __webpack_require__(4);

	var _createRawStore2 = _interopRequireDefault(_createRawStore);

	function createImmutableStore() {
	  var emptyValue = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
	  var prepare = arguments.length <= 1 || arguments[1] === undefined ? function (v) {
	    return v;
	  } : arguments[1];

	  return (0, _createRawStore2['default'])(emptyValue, function (v) {
	    return _immutable2['default'].fromJS(prepare(v));
	  }, _immutable2['default'].is);
	}

	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = Immutable;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

	exports['default'] = createKeyedStore;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _immutable = __webpack_require__(6);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _createRawStore = __webpack_require__(4);

	var _createRawStore2 = _interopRequireDefault(_createRawStore);

	function _map(iterator) {
	  var fn = arguments.length <= 1 || arguments[1] === undefined ? function (x) {
	    return x;
	  } : arguments[1];

	  var arr = [];
	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;

	  try {
	    for (var _iterator = iterator[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var value = _step.value;

	      arr.push(fn(value));
	    }
	  } catch (err) {
	    _didIteratorError = true;
	    _iteratorError = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion && _iterator['return']) {
	        _iterator['return']();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }

	  return arr;
	}

	function createKeyedStoreOf(createStore) {
	  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }

	  var map = new Map();
	  function store(newValue) {
	    var state, key, store, value;
	    if (newValue === undefined) {
	      state = _immutable2['default'].OrderedMap(_map(map.entries(), function (_ref) {
	        var _ref2 = _slicedToArray(_ref, 2);

	        var key = _ref2[0];
	        var store = _ref2[1];
	        return store.isEmpty() ? false : [key, store()];
	      }).filter(Boolean));
	    } else if (newValue === null) {
	      state = _immutable2['default'].OrderedMap();
	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;

	      try {
	        for (var _iterator2 = map.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          var _step2$value = _slicedToArray(_step2.value, 2);

	          key = _step2$value[0];
	          store = _step2$value[1];

	          store(null);
	        }
	      } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
	            _iterator2['return']();
	          }
	        } finally {
	          if (_didIteratorError2) {
	            throw _iteratorError2;
	          }
	        }
	      }
	    } else {
	      state = _immutable2['default'].OrderedMap(newValue);
	      var _iteratorNormalCompletion3 = true;
	      var _didIteratorError3 = false;
	      var _iteratorError3 = undefined;

	      try {
	        for (var _iterator3 = state.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	          var _step3$value = _slicedToArray(_step3.value, 2);

	          key = _step3$value[0];
	          value = _step3$value[1];

	          store = map.get(key);
	          store(value);
	        }
	      } catch (err) {
	        _didIteratorError3 = true;
	        _iteratorError3 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion3 && _iterator3['return']) {
	            _iterator3['return']();
	          }
	        } finally {
	          if (_didIteratorError3) {
	            throw _iteratorError3;
	          }
	        }
	      }

	      var _iteratorNormalCompletion4 = true;
	      var _didIteratorError4 = false;
	      var _iteratorError4 = undefined;

	      try {
	        for (var _iterator4 = map.entries()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	          var _step4$value = _slicedToArray(_step4.value, 2);

	          key = _step4$value[0];
	          store = _step4$value[1];

	          if (!state.has(key) && !store.isEmpty()) {
	            store(null);
	          }
	        }
	      } catch (err) {
	        _didIteratorError4 = true;
	        _iteratorError4 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion4 && _iterator4['return']) {
	            _iterator4['return']();
	          }
	        } finally {
	          if (_didIteratorError4) {
	            throw _iteratorError4;
	          }
	        }
	      }
	    }
	    return state;
	  }
	  store.at = function (key) {
	    if (!map.has(key)) map.set(key, createStore.apply(undefined, args));
	    return map.get(key);
	  };
	  store.has = function (key) {
	    return Boolean(map.has(key) && !map.get(key).isEmpty());
	  };
	  store.get = function (key) {
	    return store.at(key)();
	  };
	  store.set = function (key, value) {
	    return store.at(key)(value);
	  };
	  store.toJSON = function () {
	    return _map(map.entries(), function (_ref3) {
	      var _ref32 = _slicedToArray(_ref3, 2);

	      var key = _ref32[0];
	      var store = _ref32[1];
	      return [key, store.toJSON()];
	    });
	  };
	  return store;
	}

	function createKeyedStore() {
	  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	    args[_key2] = arguments[_key2];
	  }

	  return createKeyedStoreOf.apply(undefined, [_createRawStore2['default']].concat(args));
	}

	var of = createKeyedStoreOf;
	exports.of = of;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = createCursorStore;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _immutable = __webpack_require__(6);

	var _immutable2 = _interopRequireDefault(_immutable);

	var _immutableContribCursor = __webpack_require__(9);

	var _immutableContribCursor2 = _interopRequireDefault(_immutableContribCursor);

	var _axn = __webpack_require__(1);

	var _axn2 = _interopRequireDefault(_axn);

	function createCursorStore(emptyValue, prepare) {
	  var action = (0, _axn2['default'])();
	  var state = (function (value) {
	    function cursor(data) {
	      return _immutableContribCursor2['default'].from(data, function (rawData) {
	        var newData = rawData === null ? emptyValue : _immutable2['default'].fromJS(prepare ? prepare(rawData) : rawData);
	        state = cursor(newData);
	        action(state);
	        return newData;
	      });
	    }
	    return cursor(value);
	  })(emptyValue || _immutable2['default'].Map());
	  function store(data) {
	    if (data !== undefined) {
	      state.update(function () {
	        return data;
	      });
	    }
	    return state;
	  }
	  var emptyAction = (0, _axn2['default'])({
	    beforeEmit: function beforeEmit(value) {
	      return _immutable2['default'].is(value, emptyValue);
	    }
	  });
	  action.listen(emptyAction);
	  store.listen = action.listen.bind(action);
	  store.unlisten = action.unlisten.bind(action);
	  store.isEmpty = function () {
	    return _immutable2['default'].is(state, emptyValue);
	  };
	  store.isEmpty.listen = emptyAction.listen.bind(emptyAction);
	  store.isEmpty.unlisten = emptyAction.unlisten.bind(emptyAction);
	  store.toJSON = function () {
	    return state && state.toJSON ? state.toJSON() : state;
	  };
	  return store;
	}

	module.exports = exports['default'];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 *  Copyright (c) 2014-2015, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */

	/**
	 * Cursor is expected to be required in a node or other CommonJS context:
	 *
	 *     var Cursor = require('immutable/contrib/cursor');
	 *
	 * If you wish to use it in the browser, please check out Browserify or WebPack!
	 */

	var Immutable = __webpack_require__(6);
	var Iterable = Immutable.Iterable;
	var Iterator = Iterable.Iterator;
	var Seq = Immutable.Seq;
	var Map = Immutable.Map;
	var Record = Immutable.Record;


	function cursorFrom(rootData, keyPath, onChange) {
	  if (arguments.length === 1) {
	    keyPath = [];
	  } else if (typeof keyPath === 'function') {
	    onChange = keyPath;
	    keyPath = [];
	  } else {
	    keyPath = valToKeyPath(keyPath);
	  }
	  return makeCursor(rootData, keyPath, onChange);
	}


	var KeyedCursorPrototype = Object.create(Seq.Keyed.prototype);
	var IndexedCursorPrototype = Object.create(Seq.Indexed.prototype);

	function KeyedCursor(rootData, keyPath, onChange, size) {
	  this.size = size;
	  this._rootData = rootData;
	  this._keyPath = keyPath;
	  this._onChange = onChange;
	}
	KeyedCursorPrototype.constructor = KeyedCursor;

	function IndexedCursor(rootData, keyPath, onChange, size) {
	  this.size = size;
	  this._rootData = rootData;
	  this._keyPath = keyPath;
	  this._onChange = onChange;
	}
	IndexedCursorPrototype.constructor = IndexedCursor;

	KeyedCursorPrototype.toString = function() {
	  return this.__toString('Cursor {', '}');
	}
	IndexedCursorPrototype.toString = function() {
	  return this.__toString('Cursor [', ']');
	}

	KeyedCursorPrototype.deref =
	KeyedCursorPrototype.valueOf =
	IndexedCursorPrototype.deref =
	IndexedCursorPrototype.valueOf = function(notSetValue) {
	  return this._rootData.getIn(this._keyPath, notSetValue);
	}

	KeyedCursorPrototype.get =
	IndexedCursorPrototype.get = function(key, notSetValue) {
	  return this.getIn([key], notSetValue);
	}

	KeyedCursorPrototype.getIn =
	IndexedCursorPrototype.getIn = function(keyPath, notSetValue) {
	  keyPath = listToKeyPath(keyPath);
	  if (keyPath.length === 0) {
	    return this;
	  }
	  var value = this._rootData.getIn(newKeyPath(this._keyPath, keyPath), NOT_SET);
	  return value === NOT_SET ? notSetValue : wrappedValue(this, keyPath, value);
	}

	IndexedCursorPrototype.set =
	KeyedCursorPrototype.set = function(key, value) {
	  return updateCursor(this, function (m) { return m.set(key, value); }, [key]);
	}

	IndexedCursorPrototype.push = function(/* values */) {
	  var args = arguments;
	  return updateCursor(this, function (m) {
	    return m.push.apply(m, args);
	  });
	}

	IndexedCursorPrototype.pop = function() {
	  return updateCursor(this, function (m) {
	    return m.pop();
	  });
	}

	IndexedCursorPrototype.unshift = function(/* values */) {
	  var args = arguments;
	  return updateCursor(this, function (m) {
	    return m.unshift.apply(m, args);
	  });
	}

	IndexedCursorPrototype.shift = function() {
	  return updateCursor(this, function (m) {
	    return m.shift();
	  });
	}

	IndexedCursorPrototype.setIn =
	KeyedCursorPrototype.setIn = Map.prototype.setIn;

	KeyedCursorPrototype.remove =
	KeyedCursorPrototype['delete'] =
	IndexedCursorPrototype.remove =
	IndexedCursorPrototype['delete'] = function(key) {
	  return updateCursor(this, function (m) { return m.remove(key); }, [key]);
	}

	IndexedCursorPrototype.removeIn =
	IndexedCursorPrototype.deleteIn =
	KeyedCursorPrototype.removeIn =
	KeyedCursorPrototype.deleteIn = Map.prototype.deleteIn;

	KeyedCursorPrototype.clear =
	IndexedCursorPrototype.clear = function() {
	  return updateCursor(this, function (m) { return m.clear(); });
	}

	IndexedCursorPrototype.update =
	KeyedCursorPrototype.update = function(keyOrFn, notSetValue, updater) {
	  return arguments.length === 1 ?
	    updateCursor(this, keyOrFn) :
	    this.updateIn([keyOrFn], notSetValue, updater);
	}

	IndexedCursorPrototype.updateIn =
	KeyedCursorPrototype.updateIn = function(keyPath, notSetValue, updater) {
	  return updateCursor(this, function (m) {
	    return m.updateIn(keyPath, notSetValue, updater);
	  }, keyPath);
	}

	IndexedCursorPrototype.merge =
	KeyedCursorPrototype.merge = function(/*...iters*/) {
	  var args = arguments;
	  return updateCursor(this, function (m) {
	    return m.merge.apply(m, args);
	  });
	}

	IndexedCursorPrototype.mergeWith =
	KeyedCursorPrototype.mergeWith = function(merger/*, ...iters*/) {
	  var args = arguments;
	  return updateCursor(this, function (m) {
	    return m.mergeWith.apply(m, args);
	  });
	}

	IndexedCursorPrototype.mergeIn =
	KeyedCursorPrototype.mergeIn = Map.prototype.mergeIn;

	IndexedCursorPrototype.mergeDeep =
	KeyedCursorPrototype.mergeDeep = function(/*...iters*/) {
	  var args = arguments;
	  return updateCursor(this, function (m) {
	    return m.mergeDeep.apply(m, args);
	  });
	}

	IndexedCursorPrototype.mergeDeepWith =
	KeyedCursorPrototype.mergeDeepWith = function(merger/*, ...iters*/) {
	  var args = arguments;
	  return updateCursor(this, function (m) {
	    return m.mergeDeepWith.apply(m, args);
	  });
	}

	IndexedCursorPrototype.mergeDeepIn =
	KeyedCursorPrototype.mergeDeepIn = Map.prototype.mergeDeepIn;

	KeyedCursorPrototype.withMutations =
	IndexedCursorPrototype.withMutations = function(fn) {
	  return updateCursor(this, function (m) {
	    return (m || Map()).withMutations(fn);
	  });
	}

	KeyedCursorPrototype.cursor =
	IndexedCursorPrototype.cursor = function(subKeyPath) {
	  subKeyPath = valToKeyPath(subKeyPath);
	  return subKeyPath.length === 0 ? this : subCursor(this, subKeyPath);
	}

	/**
	 * All iterables need to implement __iterate
	 */
	KeyedCursorPrototype.__iterate =
	IndexedCursorPrototype.__iterate = function(fn, reverse) {
	  var cursor = this;
	  var deref = cursor.deref();
	  return deref && deref.__iterate ? deref.__iterate(
	    function (v, k) { return fn(wrappedValue(cursor, [k], v), k, cursor); },
	    reverse
	  ) : 0;
	}

	/**
	 * All iterables need to implement __iterator
	 */
	KeyedCursorPrototype.__iterator =
	IndexedCursorPrototype.__iterator = function(type, reverse) {
	  var deref = this.deref();
	  var cursor = this;
	  var iterator = deref && deref.__iterator &&
	    deref.__iterator(Iterator.ENTRIES, reverse);
	  return new Iterator(function () {
	    if (!iterator) {
	      return { value: undefined, done: true };
	    }
	    var step = iterator.next();
	    if (step.done) {
	      return step;
	    }
	    var entry = step.value;
	    var k = entry[0];
	    var v = wrappedValue(cursor, [k], entry[1]);
	    return {
	      value: type === Iterator.KEYS ? k : type === Iterator.VALUES ? v : [k, v],
	      done: false
	    };
	  });
	}

	KeyedCursor.prototype = KeyedCursorPrototype;
	IndexedCursor.prototype = IndexedCursorPrototype;


	var NOT_SET = {}; // Sentinel value

	function makeCursor(rootData, keyPath, onChange, value) {
	  if (arguments.length < 4) {
	    value = rootData.getIn(keyPath);
	  }
	  var size = value && value.size;
	  var CursorClass = Iterable.isIndexed(value) ? IndexedCursor : KeyedCursor;
	  var cursor = new CursorClass(rootData, keyPath, onChange, size);

	  if (value instanceof Record) {
	    defineRecordProperties(cursor, value);
	  }

	  return cursor;
	}

	function defineRecordProperties(cursor, value) {
	  try {
	    value._keys.forEach(setProp.bind(undefined, cursor));
	  } catch (error) {
	    // Object.defineProperty failed. Probably IE8.
	  }
	}

	function setProp(prototype, name) {
	  Object.defineProperty(prototype, name, {
	    get: function() {
	      return this.get(name);
	    },
	    set: function(value) {
	      if (!this.__ownerID) {
	        throw new Error('Cannot set on an immutable record.');
	      }
	    }
	  });
	}

	function wrappedValue(cursor, keyPath, value) {
	  return Iterable.isIterable(value) ? subCursor(cursor, keyPath, value) : value;
	}

	function subCursor(cursor, keyPath, value) {
	  if (arguments.length < 3) {
	    return makeCursor( // call without value
	      cursor._rootData,
	      newKeyPath(cursor._keyPath, keyPath),
	      cursor._onChange
	    );
	  }
	  return makeCursor(
	    cursor._rootData,
	    newKeyPath(cursor._keyPath, keyPath),
	    cursor._onChange,
	    value
	  );
	}

	function updateCursor(cursor, changeFn, changeKeyPath) {
	  var deepChange = arguments.length > 2;
	  var newRootData = cursor._rootData.updateIn(
	    cursor._keyPath,
	    deepChange ? Map() : undefined,
	    changeFn
	  );
	  var keyPath = cursor._keyPath || [];
	  var result = cursor._onChange && cursor._onChange.call(
	    undefined,
	    newRootData,
	    cursor._rootData,
	    deepChange ? newKeyPath(keyPath, changeKeyPath) : keyPath
	  );
	  if (result !== undefined) {
	    newRootData = result;
	  }
	  return makeCursor(newRootData, cursor._keyPath, cursor._onChange);
	}

	function newKeyPath(head, tail) {
	  return head.concat(listToKeyPath(tail));
	}

	function listToKeyPath(list) {
	  return Array.isArray(list) ? list : Immutable.Iterable(list).toArray();
	}

	function valToKeyPath(val) {
	  return Array.isArray(val) ? val :
	    Iterable.isIterable(val) ? val.toArray() :
	    [val];
	}

	exports.from = cursorFrom;


/***/ }
/******/ ]);