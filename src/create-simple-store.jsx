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
    beforeEmit: (value) => immutable.is(value, emptyValue)
  });
  action.listen(emptyAction);
  store.listen = action.listen.bind(action);
  store.unlisten = action.unlisten.bind(action);
  store.isEmpty = () => immutable.is(state, emptyValue);
  store.isEmpty.listen = emptyAction.listen.bind(emptyAction);
  store.isEmpty.unlisten = emptyAction.unlisten.bind(emptyAction);
  return store;
}