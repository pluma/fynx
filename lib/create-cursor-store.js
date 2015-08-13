'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createCursorStore;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _immutableContribCursor = require('immutable/contrib/cursor');

var _immutableContribCursor2 = _interopRequireDefault(_immutableContribCursor);

var _axn = require('axn');

var _axn2 = _interopRequireDefault(_axn);

function createCursorStore(emptyValue, prepare) {
  var action = (0, _axn2['default'])();
  var emptyAction = (0, _axn2['default'])();
  var state = (function (value) {
    function cursor(data) {
      return _immutableContribCursor2['default'].from(data, function (rawData) {
        var newData = rawData === null ? emptyValue : _immutable2['default'].fromJS(prepare ? prepare(rawData) : rawData);
        state = cursor(newData);
        action(state);
        emptyAction(_immutable2['default'].is(state, emptyValue));
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
  store.isFynxStore = true;
  store.listen = action.listen.bind(action);
  store.listenOnce = action.listenOnce.bind(action);
  store.unlisten = action.unlisten.bind(action);
  store.isEmpty = function () {
    return _immutable2['default'].is(state, emptyValue);
  };
  store.isEmpty.listen = emptyAction.listen.bind(emptyAction);
  store.isEmpty.listenOnce = emptyAction.listenOnce.bind(emptyAction);
  store.isEmpty.unlisten = emptyAction.unlisten.bind(emptyAction);
  store.toJSON = function () {
    return state && state.toJSON ? state.toJSON() : state;
  };
  return store;
}

module.exports = exports['default'];