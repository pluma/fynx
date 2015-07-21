
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _createRawStore = require('./create-raw-store');

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
    return map.get(key);
  };
  store.has = function (key) {
    return map.has(key) && !map.get(key).isEmpty();
  };
  store.get = function (key) {
    if (!map.has(key)) map.set(key, createStore.apply(undefined, args));
    return map.get(key)();
  };
  store.set = function (key, value) {
    if (!map.has(key)) map.set(key, createStore.apply(undefined, args));
    return map.get(key)(value);
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

module.exports = function createKeyedStore() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return createKeyedStoreOf.apply(undefined, [_createRawStore2['default']].concat(args));
};
module.exports.of = createKeyedStoreOf;