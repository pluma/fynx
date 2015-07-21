
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _axn = require('axn');

var _axn2 = _interopRequireDefault(_axn);

module.exports = function createRawStore() {
  var emptyValue = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
  var prepare = arguments.length <= 1 || arguments[1] === undefined ? function (v) {
    return v;
  } : arguments[1];
  var isEmpty = arguments.length <= 2 || arguments[2] === undefined ? function (v, emptyValue) {
    return v === emptyValue;
  } : arguments[2];
  return (function () {
    var action = (0, _axn2['default'])();
    var emptyAction = (0, _axn2['default'])();
    var state = emptyValue;
    function store(value) {
      if (value !== undefined) {
        state = value === null ? emptyValue : prepare(value);
        action(state);
        emptyAction(isEmpty(state, emptyValue));
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
  })();
};