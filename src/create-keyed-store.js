'use strict';
import immutable from 'immutable';
import createRawStore from './create-raw-store';

function _map(iterator, fn = x => x) {
  var arr = [];
  for (var value of iterator) {
    arr.push(fn(value));
  }
  return arr;
}

function createKeyedStoreOf(createStore, ...args) {
  var map = new Map();
  function store(newValue) {
    var state, key, store, value;
    if (newValue === undefined) {
      state = immutable.OrderedMap(_map(
        map.entries(), ([key, store]) => store.isEmpty() ? false : [key, store()]
      ).filter(Boolean));
    } else if (newValue === null) {
      state = immutable.OrderedMap();
      for ([key, store] of map.entries()) {
        store(null);
      }
    } else {
      state = immutable.OrderedMap(newValue);
      for ([key, value] of state.entries()) {
        store = map.get(key);
        store(value);
      }
      for ([key, store] of map.entries()) {
        if (!state.has(key) && !store.isEmpty()) {
          store(null);
        }
      }
    }
    return state;
  }
  store.at = key => {
    if (!map.has(key)) map.set(key, createStore(...args));
    return map.get(key);
  };
  store.has = key => Boolean(map.has(key) && !map.get(key).isEmpty());
  store.get = key => store.at(key)();
  store.set = (key, value) => store.at(key)(value);
  store.toJSON = () => _map(
    map.entries(),
    ([key, store]) => [key, store.toJSON()]
  );
  return store;
}

export default function createKeyedStore(...args) {
  return createKeyedStoreOf(createRawStore, ...args);
}
export var of = createKeyedStoreOf;
