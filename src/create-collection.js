'use strict';
import immutable from 'immutable';
import createRawStore from './create-raw-store';
import axn from 'axn';

function ievery(fn) {
  for (let [key, value] of this.entries()) {
    const result = fn(value, key, this);
    if (!result) return false;
  }
  return true;
}

function imap(fn) {
  const result = [];
  for (let [key, value] of this.entries()) {
    result.push(fn(value, key, this));
  }
  return result;
}

function createCollectionOf(createStore, ...args) {
  const action = axn();
  const emptyAction = axn();
  const map = new Map();
  let writing = false;
  function collection(newValue) {
    let state;
    if (newValue === undefined) {
      state = immutable.OrderedMap(map::imap(
        (store, key) => store.isEmpty() ? false : [key, store()]
      ).filter(Boolean));
    } else if (newValue === null) {
      state = immutable.OrderedMap();
      try {
        writing = true;
        for (let [, store] of map.entries()) {
          store(null);
        }
      } finally {
        writing = false;
      }
      action([undefined, state]);
      emptyAction(true);
    } else {
      state = immutable.OrderedMap(newValue);
      try {
        writing = true;
        for (let [key, value] of state.entries()) {
          let store = map.get(key);
          store(value);
        }
        for (let [key, store] of map.entries()) {
          if (!state.has(key) && !store.isEmpty()) {
            store(null);
          }
        }
      } finally {
        writing = false;
      }
      action([undefined, state]);
      emptyAction(collection.isEmpty());
    }
    return state;
  }
  collection.isFynxStore = true;
  collection.listen = ::action.listen;
  collection.listenOnce = ::action.listenOnce;
  collection.unlisten = ::action.unlisten;
  collection.isEmpty = () => map::ievery(store => store.isEmpty());
  collection.isEmpty.listen = ::emptyAction.listen;
  collection.isEmpty.listenOnce = ::emptyAction.listenOnce;
  collection.isEmpty.unlisten = ::emptyAction.unlisten;
  collection.toJSON = () => map::imap((store, key) => [key, store.toJSON()]);
  collection.fromJSON = data => {
    if (Array.isArray(data)) data.forEach(([key, value]) => collection.at(key).fromJSON(value));
    else if (!data || typeof data !== 'object') collection(null);
    else Object.keys(data).forEach(key => collection.at(key).fromJSON(data[key]));
  };
  collection.at = key => {
    if (!map.has(key)) {
      const store = createStore(...args);
      map.set(key, store);
      store.listen(value => writing ? action([key, value]) : value);
    }
    return map.get(key);
  };
  collection.has = key => Boolean(map.has(key) && !map.get(key).isEmpty());
  collection.get = key => collection.at(key)();
  collection.set = (key, value) => collection.at(key)(value);
  return collection;
}

export default function createCollection(...args) {
  return createCollectionOf(createRawStore, ...args);
}
export var of = createCollectionOf;
