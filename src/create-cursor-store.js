'use strict';
import immutable from 'immutable';
import Cursor from 'immutable/contrib/cursor';
import axn from 'axn';

export default function createCursorStore(emptyValue, prepare) {
  var action = axn();
  var state = (function (value) {
    function cursor(data) {
      return Cursor.from(data, function (rawData) {
        var newData = (
          rawData === null
          ? emptyValue
          : immutable.fromJS(prepare ? prepare(rawData) : rawData)
        );
        state = cursor(newData);
        action(state);
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
  var emptyAction = axn({
    beforeEmit: (value) => immutable.is(value, emptyValue)
  });
  action.listen(emptyAction);
  store.listen = action.listen.bind(action);
  store.unlisten = action.unlisten.bind(action);
  store.isEmpty = () => immutable.is(state, emptyValue);
  store.isEmpty.listen = emptyAction.listen.bind(emptyAction);
  store.isEmpty.unlisten = emptyAction.unlisten.bind(emptyAction);
  store.toJSON = () => state && state.toJSON ? state.toJSON() : state;
  return store;
};
