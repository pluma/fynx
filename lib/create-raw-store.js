/** @jsx React.DOM */
/*jshint browserify: true, -W014 */
'use strict';
var axn = require('axn');
module.exports = createRawStore;

function createRawStore(emptyValue, prepare) {
  var action = axn();
  var state = emptyValue;
  function store(value) {
    if (value !== undefined) {
      state = (
        value === null
        ? emptyValue
        : (prepare ? prepare(value) : value)
      );
      action(state);
    }
    return state;
  }
  store.listen = action.listen.bind(action);
  store.unlisten = action.unlisten.bind(action);
  store.isEmpty = function()  {return state === emptyValue;};
  return store;
}