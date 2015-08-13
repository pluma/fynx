'use strict';
import immutable from 'immutable';
import Cursor from 'immutable/contrib/cursor';
import axn from 'axn';

export default function createCursorStore(emptyValue, prepare) {
  const action = axn();
  const emptyAction = axn();
  let state = (function (value) {
    function cursor(data) {
      return Cursor.from(data, function (rawData) {
        const newData = (
          rawData === null
          ? emptyValue
          : immutable.fromJS(prepare ? prepare(rawData) : rawData)
        );
        state = cursor(newData);
        action(state);
        emptyAction(immutable.is(state, emptyValue));
        return newData;
      });
    }
    return cursor(value);
  }(emptyValue || immutable.Map()));
  function store(data) {
    if (data !== undefined) {
      state.update(() => data);
    }
    return state;
  }
  store.isFynxStore = true;
  store.listen = ::action.listen;
  store.listenOnce = ::action.listenOnce;
  store.unlisten = ::action.unlisten;
  store.isEmpty = () => immutable.is(state, emptyValue);
  store.isEmpty.listen = ::emptyAction.listen;
  store.isEmpty.listenOnce = ::emptyAction.listenOnce;
  store.isEmpty.unlisten = ::emptyAction.unlisten;
  store.toJSON = () => state && state.toJSON ? state.toJSON() : state;
  store.fromJSON = data => {
    store(data);
  };
  return store;
}
