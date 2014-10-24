/*jshint browserify: true, -W014 */
'use strict';
var immutable = require('immutable');
var axn = require('axn');
module.exports = createStore;

function createStore(emptyValue, prepare) {
  var action = axn();
  var state = (function (value) {
    function cursor(data) {
      return data.cursor(function (newData) {
        state = cursor(newData);
        action(state);
      });
    }
    return cursor(value);
  }(emptyValue || immutable.Map.empty()));
  function store(data) {
    if (data !== undefined) {
      state.update(() => (
        data === null
        ? emptyValue
        : immutable.fromJS(prepare ? prepare(data) : data)
      ));
    }
    return state;
  }
  store.listen = action.listen.bind(action);
  store.unlisten = action.unlisten.bind(action);
  store.isEmpty = () => immutable.is(state, emptyValue);
  return store;
}