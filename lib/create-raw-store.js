'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createRawStore;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _axn = require('axn');

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
      emptyAction(store.isEmpty());
    }
    return state;
  }
  store.isFynxStore = true;
  store.listen = action.listen.bind(action);
  store.listenOnce = action.listenOnce.bind(action);
  store.unlisten = action.unlisten.bind(action);
  store.isEmpty = function () {
    return isEmpty(state, emptyValue);
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