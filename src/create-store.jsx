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
      state.update(() => (
        data === null
        ? emptyValue
        : castToImmutable(prepare ? prepare(data) : data)
      ));
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

function castToImmutable(struct) {
  return isImmutableStructure(struct)
    ? struct
    : immutable.fromJS(struct);
}

// Check if passed structure is existing immutable structure.
// From https://github.com/facebook/immutable-js/wiki/Upgrading-to-Immutable-v3#additional-changes
function isImmutableStructure (data) {
  return immutableSafeCheck('Iterable', 'isIterable', data) ||
          immutableSafeCheck('Seq', 'isSeq', data) ||
          immutableSafeCheck('Map', 'isMap', data) ||
          immutableSafeCheck('OrderedMap', 'isOrderedMap', data) ||
          immutableSafeCheck('List', 'isList', data) ||
          immutableSafeCheck('Stack', 'isStack', data) ||
          immutableSafeCheck('Set', 'isSet', data);
}

function immutableSafeCheck (ns, method, data) {
  return immutable[ns] && immutable[ns][method] && immutable[ns][method](data);
}