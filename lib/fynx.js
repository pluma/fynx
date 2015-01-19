!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Fynx=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/*jshint browserify: true */
'use strict';
var axn = require('axn');
var createCursorStore = require('./lib/create-cursor-store');
module.exports = {
  createAction: axn,
  createActions: require('./lib/create-actions'),
  createAsyncAction: axn.async,
  createAsyncActions: require('./lib/create-async-actions'),
  createStore: createCursorStore,
  createSimpleStore: require('./lib/create-simple-store'),
  createCursorStore: createCursorStore,
  createRawStore: require('./lib/create-raw-store'),
  listenTo: require('./lib/listento-mixin'),
  listenToProp: require('./lib/listento-prop-mixin'),
  connect: require('./lib/connect-mixin'),
  connectProp: require('./lib/connect-prop-mixin'),
  connectVia: require('./lib/connect-via-mixin')
};

},{"./lib/connect-mixin":3,"./lib/connect-prop-mixin":4,"./lib/connect-via-mixin":5,"./lib/create-actions":6,"./lib/create-async-actions":7,"./lib/create-cursor-store":8,"./lib/create-raw-store":9,"./lib/create-simple-store":10,"./lib/listento-mixin":11,"./lib/listento-prop-mixin":12,"axn":13}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
/*jshint browserify: true */
'use strict';
var axn = require('axn');
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
},{"axn":13}],7:[function(require,module,exports){
/*jshint browserify: true */
'use strict';
var axn = require('axn');
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

},{"axn":13}],8:[function(require,module,exports){
/*jshint browserify: true, -W014 */
'use strict';
var immutable = require('immutable');
var Cursor = require('immutable/contrib/cursor');
var axn = require('axn');
module.exports = createCursorStore;

function createCursorStore(emptyValue, prepare) {
  var action = axn();
  var state = (function (value) {
    function cursor(data) {
      return Cursor.from(data, function (newData) {
        state = cursor(newData);
        action(state);
      });
    }
    return cursor(value);
  }(emptyValue || immutable.Map()));
  function store(data) {
    if (data !== undefined) {
      state.update(function()  
        {return data === null
        ? emptyValue
        : immutable.fromJS(prepare ? prepare(data) : data);}
      );
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
},{"axn":13,"immutable":1,"immutable/contrib/cursor":1}],9:[function(require,module,exports){
/*jshint browserify: true, -W014 */
'use strict';
var axn = require('axn');
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
},{"axn":13}],10:[function(require,module,exports){
/*jshint browserify: true, -W014 */
'use strict';
var axn = require('axn');
var immutable = typeof Immutable === 'undefined' ? require('immutable') : Immutable;
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

},{"axn":13,"immutable":1}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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
},{}]},{},[2])(2)
});