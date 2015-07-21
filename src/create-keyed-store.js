/*jshint browserify: true, -W014 */
'use strict';
var axn = require('axn');
var immutable = require('immutable');
var createRawStore = require('./create-raw-store');

function _map(iterator, fn=(x => x)) {
  var arr = [];
  for (var value of iterator) {
    arr.push(fn(value));
  }
  return arr;
}

function createKeyedStoreOf(createStore, ...args) {
  var map = new Map();
  function store(value) {
    let state;
    if (value === undefined) {
      state = immutable.OrderedMap(
        _map(map.entries(), x => x)
        .filter(([key, store]) => !store.isEmpty())
        .map(([key, store]) => [key, store()])
      );
    } else if (value === null) {
      state = immutable.OrderedMap();
      for (var [key, store] of map.entries()) {
        store(null);
      }
    } else {
      state = immutable.OrderedMap(value);
      for (var [key, value] of state.entries()) {
        var store = map.get(key);
        store(value);
      }
      for (var [key, store] of map.entries()) {
        if (!state.has(key) && !store.isEmpty()) {
          store(null);
        }
      }
    }
    return state;
  }
  store.at = key => map.get(key);
  store.has = key => map.has(key) && !map.get(key).isEmpty();
  store.get = key => {
    if (!map.has(key)) map.set(key, createStore(...args));
    return map.get(key)();
  };
  store.set = (key, value) => {
    if (!map.has(key)) map.set(key, createStore(...args));
    return map.get(key)(value);
  };
  store.toJSON = () => _map(
    map.entries(),
    ([key, store]) => [key, store.toJSON()]
  );
  return store;
}

module.exports = function createKeyedStore(...args) {
  return createKeyedStoreOf(createRawStore, ...args);
};
module.exports.of = createKeyedStoreOf;
