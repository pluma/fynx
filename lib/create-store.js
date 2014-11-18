/*jshint browserify: true, -W014 */
'use strict';
var immutable = require('immutable');
var Cursor = require('immutable/contrib/cursor');
var axn = require('axn');
module.exports = createStore;

function createStore(emptyValue, prepare) {
  var action = axn();
  var state = (function (value) {
    function cursor(data) {
      return Cursor.from(data, function (newData) {
        state = cursor(newData);
        action(state);
      });
    }
    return cursor(value);
  }(emptyValue || immutable.Map()));
  function store(data) {
    if (data !== undefined) {
      state.update(function()  
        {return data === null
        ? emptyValue
        : immutable.fromJS(prepare ? prepare(data) : data);}
      );
    }
    return state;
  }
  var emptyAction = axn({
    beforeEmit: function(value)  {return immutable.is(value, emptyValue);}
  });
  action.listen(emptyAction);
  store.listen = action.listen.bind(action);
  store.unlisten = action.unlisten.bind(action);
  store.isEmpty = function()  {return immutable.is(state, emptyValue);};
  store.isEmpty.listen = emptyAction.listen.bind(emptyAction);
  store.isEmpty.unlisten = emptyAction.unlisten.bind(emptyAction);
  return store;
}