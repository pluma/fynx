/* @flow */
'use strict';
import axn from 'axn';

module.exports = function createRawStore(
  emptyValue = null,
  prepare = v => v,
  isEmpty = (v, emptyValue) => v === emptyValue
) {
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
  store.isEmpty = () => isEmpty(state, emptyValue);
  store.isEmpty.listen = emptyAction.listen.bind(emptyAction);
  store.isEmpty.unlisten = emptyAction.unlisten.bind(emptyAction);
  store.toJSON = () => state && state.toJSON ? state.toJSON() : state;
  return store;
};
