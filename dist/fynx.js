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

	/*jshint browserify: true */
	'use strict';
	var axn = __webpack_require__(1);
	var createCursorStore = __webpack_require__(2);
	module.exports = {
	  createAction: axn,
	  createActions: __webpack_require__(5),
	  createAsyncAction: axn.async,
	  createAsyncActions: __webpack_require__(6),
	  createStore: createCursorStore,
	  createSimpleStore: __webpack_require__(7),
	  createCursorStore: createCursorStore,
	  createRawStore: __webpack_require__(8),
	  listenTo: __webpack_require__(9),
	  listenToProp: __webpack_require__(10),
	  connect: __webpack_require__(11),
	  connectProp: __webpack_require__(12),
	  connectVia: __webpack_require__(13)
	};


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
	  emit: function (data) {
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
	        if (p0._cancelled) return Promise.reject(new Error('rejected'));
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
	      if (p0._cancelled) return Promise.reject(new Error('rejected'));
	      return value;
	    }), {
	      cancel: function () {
	        p0._cancelled = true;
	      },
	      cancelled: function () {
	        return p0._cancelled;
	      }
	    });
	  }
	};

	axn.async = aaxn;

	module.exports = axn;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*jshint browserify: true, -W014 */
	'use strict';
	var immutable = __webpack_require__(3);
	var Cursor = __webpack_require__(4);
	var axn = __webpack_require__(1);
	module.exports = createCursorStore;

	function createCursorStore(emptyValue, prepare) {
	  var action = axn();
	  var state = (function (value) {
	    function cursor(data) {
	      return Cursor.from(data, function (rawData) {
	        var newData = (
	          rawData === null
	          ? emptyValue
	          : immutable.fromJS(prepare ? prepare(rawData) : rawData)
	        );
	        state = cursor(newData);
	        action(state);
	        return newData;
	      });
	    }
	    return cursor(value);
	  }(emptyValue || immutable.Map()));
	  function store(data) {
	    if (data !== undefined) {
	      state.update(function()  {return data;});
	    }
	    return state;
	  }
	  var emptyAction = axn({
	    beforeEmit: function(value)  {return immutable.is(value, emptyValue);}
	  });
	  action.listen(emptyAction);
	  store.listen = action.listen.bind(action);
	  store.unlisten = action.unlisten.bind(action);
	  store.isEmpty = function()  {return immutable.is(state, emptyValue);};
	  store.isEmpty.listen = emptyAction.listen.bind(emptyAction);
	  store.isEmpty.unlisten = emptyAction.unlisten.bind(emptyAction);
	  return store;
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = Immutable;

/***/ },
/* 4 */
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

	var Immutable = __webpack_require__(3);
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


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*jshint browserify: true */
	'use strict';
	var axn = __webpack_require__(1);
	module.exports = createActions;

	function createActions(specs) {
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
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/*jshint browserify: true */
	'use strict';
	var axn = __webpack_require__(1);
	module.exports = createActions;

	function createActions(specs) {
	  var obj = {};
	  if (Array.isArray(specs)) {
	    specs.forEach(function (name) {
	      obj[name] = axn.async();
	    });
	  } else {
	    Object.keys(specs).forEach(function (name) {
	      obj[name] = axn.async(specs[name]);
	    });
	  }
	  return obj;
	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/*jshint browserify: true, -W014 */
	'use strict';
	var axn = __webpack_require__(1);
	var immutable = __webpack_require__(3);
	module.exports = createSimpleStore;

	function createSimpleStore(emptyValue, prepare) {
	  emptyValue = emptyValue === undefined ? null : emptyValue;
	  var action = axn();
	  var state = emptyValue;
	  function store(value) {
	    if (value !== undefined) {
	      state = (
	        value === null
	        ? emptyValue
	        : immutable.fromJS(prepare ? prepare(value) : value)
	      );
	      action(state);
	    }
	    return state;
	  }
	  var emptyAction = axn({
	    beforeEmit: function(value)  {return immutable.is(value, emptyValue);}
	  });
	  action.listen(emptyAction);
	  store.listen = action.listen.bind(action);
	  store.unlisten = action.unlisten.bind(action);
	  store.isEmpty = function()  {return immutable.is(state, emptyValue);};
	  store.isEmpty.listen = emptyAction.listen.bind(emptyAction);
	  store.isEmpty.unlisten = emptyAction.unlisten.bind(emptyAction);
	  return store;
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*jshint browserify: true, -W014 */
	'use strict';
	var axn = __webpack_require__(1);
	module.exports = createRawStore;

	function createRawStore(emptyValue, prepare) {
	  emptyValue = emptyValue === undefined ? null : emptyValue;
	  var action = axn();
	  var state = emptyValue;
	  function store(value) {
	    if (value !== undefined) {
	      state = (
	        value === null
	        ? emptyValue
	        : (prepare ? prepare(value) : value)
	      );
	      action(state);
	    }
	    return state;
	  }
	  var emptyAction = axn({
	    beforeEmit: function(value)  {return value === emptyValue;}
	  });
	  action.listen(emptyAction);
	  store.listen = action.listen.bind(action);
	  store.unlisten = action.unlisten.bind(action);
	  store.isEmpty = function()  {return state === emptyValue;};
	  store.isEmpty.listen = emptyAction.listen.bind(emptyAction);
	  store.isEmpty.unlisten = emptyAction.unlisten.bind(emptyAction);
	  return store;
	}

/***/ },
/* 9 */
/***/ function(module, exports) {

	/*jshint browserify: true */
	'use strict';
	module.exports = listenTo;

	function listenTo(store, fn) {
	  return {
	    componentDidMount:function() {
	      store.listen(typeof fn === 'function' ? fn : this[fn], this);
	    },
	    componentWillUnmount:function() {
	      store.unlisten(typeof fn === 'function' ? fn : this[fn], this);
	    }
	  };
	}

/***/ },
/* 10 */
/***/ function(module, exports) {

	/*jshint browserify: true */
	'use strict';
	module.exports = listenToProp;

	function listenToProp(prop, fn) {
	  return {
	    componentWillReceiveProps:function(nextProps) {
	      var func = typeof fn === 'function' ? fn : this[fn];
	      if (nextProps[prop]) {
	        if (nextProps[prop] === this.props[prop]) return;
	        nextProps[prop].listen(func, this);
	        if (this.props[prop]) {
	          this.props[prop].unlisten(func, this);
	        }
	      } else {
	        if (!this.props[prop]) return;
	        this.props[prop].unlisten(func, this);
	      }
	    },
	    componentDidMount:function() {
	      if (!this.props[prop]) return;
	      var func = typeof fn === 'function' ? fn : this[fn];
	      this.props[prop].listen(func, this);
	    },
	    componentWillUnmount:function() {
	      if (!this.props[prop]) return;
	      var func = typeof fn === 'function' ? fn : this[fn];
	      this.props[prop].unlisten(func, this);
	    }
	  };
	}

/***/ },
/* 11 */
/***/ function(module, exports) {

	/*jshint browserify: true */
	'use strict';
	module.exports = connect;

	function connect(store, name) {
	  function update(value) {
	    /*jshint validthis: true */
	    var state = {};
	    state[name] = value;
	    this.setState(state);
	  }
	  return {
	    getInitialState:function() {
	      var state = {};
	      state[name] = store();
	      return state;
	    },
	    componentDidMount:function() {
	      store.listen(update, this);
	    },
	    componentWillUnmount:function() {
	      store.unlisten(update, this);
	    }
	  };
	}

/***/ },
/* 12 */
/***/ function(module, exports) {

	/*jshint browserify: true */
	'use strict';
	module.exports = connectProp;

	function connectProp(prop, name) {
	  function update(value) {
	    /*jshint validthis: true */
	    var state = {};
	    state[name] = value;
	    this.setState(state);
	  }
	  return {
	    getInitialState:function() {
	      var state = {};
	      if (this.props[prop]) {
	        state[name] = this.props[prop]();
	      }
	      return state;
	    },
	    componentWillReceiveProps:function(nextProps) {
	      if (nextProps[prop]) {
	        if (nextProps[prop] === this.props[prop]) return;
	        nextProps[prop].listen(update, this);
	        update.call(this, nextProps[prop]());
	        if (this.props[prop]) {
	          this.props[prop].unlisten(update, this);
	        }
	      } else {
	        if (!this.props[prop]) return;
	        update.call(this, undefined);
	        this.props[prop].unlisten(update, this);
	      }
	    },
	    componentDidMount:function() {
	      if (!this.props[prop]) return;
	      this.props[prop].listen(update, this);
	    },
	    componentWillUnmount:function() {
	      if (!this.props[prop]) return;
	      this.props[prop].unlisten(update, this);
	    }
	  };
	}

/***/ },
/* 13 */
/***/ function(module, exports) {

	/*jshint browserify: true */
	'use strict';
	module.exports = connectVia;

	function connectVia(stores, fn) {
	  if (!Array.isArray(stores)) stores = [stores];
	  function getStateFromStores(self) {
	    var values = stores.map(function(store)  {return store();});
	    var func = typeof fn === 'function' ? fn : self[fn];
	    return func.apply(self, values);
	  }
	  function update() {
	    /*jshint validthis: true */
	    this.setState(getStateFromStores(this));
	  }
	  return {
	    getInitialState:function() {
	      return getStateFromStores(this);
	    },
	    componentDidMount:function() {
	      stores.map(function(store)  {return store.listen(update, this);}.bind(this));
	    },
	    componentWillUnmount:function() {
	      stores.map(function(store)  {return store.unlisten(update, this);}.bind(this));
	    }
	  };
	}

/***/ }
/******/ ]);