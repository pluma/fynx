'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports['default'] = createCollection;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _createRawStore = require('./create-raw-store');

var _createRawStore2 = _interopRequireDefault(_createRawStore);

var _axn = require('axn');

var _axn2 = _interopRequireDefault(_axn);

function ievery(fn) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = this.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2);

      var key = _step$value[0];
      var value = _step$value[1];

      var result = fn(value, key, this);
      if (!result) return false;
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

  return true;
}

function imap(fn) {
  var result = [];
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = this.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _step2$value = _slicedToArray(_step2.value, 2);

      var key = _step2$value[0];
      var value = _step2$value[1];

      result.push(fn(value, key, this));
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

  return result;
}

function createCollectionOf(createStore) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var action = (0, _axn2['default'])();
  var emptyAction = (0, _axn2['default'])();
  var map = new Map();
  var writing = false;
  function collection(newValue) {
    var state = undefined;
    if (newValue === undefined) {
      state = _immutable2['default'].OrderedMap(imap.call(map, function (store, key) {
        return store.isEmpty() ? false : [key, store()];
      }).filter(Boolean));
    } else if (newValue === null) {
      state = _immutable2['default'].OrderedMap();
      try {
        writing = true;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = map.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _step3$value = _slicedToArray(_step3.value, 2);

            var store = _step3$value[1];

            store(null);
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
      } finally {
        writing = false;
      }
      action([undefined, state]);
      emptyAction(true);
    } else {
      state = _immutable2['default'].OrderedMap(newValue);
      try {
        writing = true;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = state.entries()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _step4$value = _slicedToArray(_step4.value, 2);

            var key = _step4$value[0];
            var value = _step4$value[1];

            var store = collection.at(key);
            store(value);
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

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = map.entries()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var _step5$value = _slicedToArray(_step5.value, 2);

            var key = _step5$value[0];
            var store = _step5$value[1];

            if (!state.has(key) && !store.isEmpty()) {
              store(null);
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5['return']) {
              _iterator5['return']();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      } finally {
        writing = false;
      }
      action([undefined, state]);
      emptyAction(collection.isEmpty());
    }
    return state;
  }
  collection.isFynxStore = true;
  collection.listen = action.listen.bind(action);
  collection.listenOnce = action.listenOnce.bind(action);
  collection.unlisten = action.unlisten.bind(action);
  collection.isEmpty = function () {
    return ievery.call(map, function (store) {
      return store.isEmpty();
    });
  };
  collection.isEmpty.listen = emptyAction.listen.bind(emptyAction);
  collection.isEmpty.listenOnce = emptyAction.listenOnce.bind(emptyAction);
  collection.isEmpty.unlisten = emptyAction.unlisten.bind(emptyAction);
  collection.toJSON = function () {
    return imap.call(map, function (store, key) {
      return [key, store.toJSON()];
    });
  };
  collection.fromJSON = function (data) {
    if (Array.isArray(data)) data.forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var key = _ref2[0];
      var value = _ref2[1];
      return collection.at(key).fromJSON(value);
    });else if (!data || typeof data !== 'object') collection(null);else Object.keys(data).forEach(function (key) {
      return collection.at(key).fromJSON(data[key]);
    });
  };
  collection.at = function (key) {
    if (!map.has(key)) {
      var store = createStore.apply(undefined, args);
      map.set(key, store);
      store.listen(function (value) {
        return writing ? action([key, value]) : value;
      });
    }
    return map.get(key);
  };
  collection.has = function (key) {
    return Boolean(map.has(key) && !map.get(key).isEmpty());
  };
  collection.get = function (key) {
    return collection.at(key)();
  };
  collection.set = function (key, value) {
    return collection.at(key)(value);
  };
  return collection;
}

function createCollection() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return createCollectionOf.apply(undefined, [_createRawStore2['default']].concat(args));
}

createCollection.of = createCollectionOf;
module.exports = exports['default'];