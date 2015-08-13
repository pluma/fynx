'use strict';
import axn from 'axn';

export default function createRawStore(
  emptyValue = null,
  prepare = v => v,
  isEmpty = Object.is
) {
  const action = axn();
  const emptyAction = axn();
  let state = emptyValue;
  function store(value) {
    if (value !== undefined) {
      state = value === null ? emptyValue : prepare(value);
      action(state);
      emptyAction(store.isEmpty());
    }
    return state;
  }
  store.isFynxStore = true;
  store.listen = ::action.listen;
  store.listenOnce = ::action.listenOnce;
  store.unlisten = ::action.unlisten;
  store.isEmpty = () => isEmpty(state, emptyValue);
  store.isEmpty.listen = ::emptyAction.listen;
  store.isEmpty.listenOnce = ::emptyAction.listenOnce;
  store.isEmpty.unlisten = ::emptyAction.unlisten;
  store.toJSON = () => state && state.toJSON ? state.toJSON() : state;
  store.fromJSON = data => {
    store(data);
  };
  return store;
}
