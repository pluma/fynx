/*jshint browserify: true, -W014 */
'use strict';
var axn = require('axn');
module.exports = createRawStore;

function createRawStore(emptyValue, prepare) {
  emptyValue = emptyValue === undefined ? null : emptyValue;
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
  var emptyAction = axn({
    beforeEmit: function(value)  {return value === emptyValue;}
  });
  action.listen(emptyAction);
  store.listen = action.listen.bind(action);
  store.unlisten = action.unlisten.bind(action);
  store.isEmpty = function()  {return state === emptyValue;};
  store.isEmpty.listen = emptyAction.listen.bind(emptyAction);
  store.isEmpty.unlisten = emptyAction.unlisten.bind(emptyAction);
  return store;
}