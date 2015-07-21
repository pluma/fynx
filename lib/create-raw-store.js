/*jshint browserify: true, -W014 */
'use strict';
var axn = require('axn');

module.exports = function createRawStore() {
  var emptyValue = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
  var prepare = arguments.length <= 1 || arguments[1] === undefined ? function (v) {
    return v;
  } : arguments[1];
  var isEmpty = arguments.length <= 2 || arguments[2] === undefined ? function (v, emptyValue) {
    return v === emptyValue;
  } : arguments[2];
  return (function () {
    var action = axn();
    var emptyAction = axn();
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