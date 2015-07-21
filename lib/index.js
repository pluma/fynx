/*jshint browserify: true */
'use strict';
var axn = require('axn');
var createRawStore = require('./create-raw-store');
module.exports = {
  createAction: axn,
  createActions: require('./create-actions'),
  createAsyncAction: axn.async,
  createAsyncActions: require('./create-async-actions'),
  createStore: createRawStore,
  createRawStore: createRawStore,
  createImmutableStore: require('./create-immutable-store'),
  createKeyedStore: require('./create-keyed-store'),
  createCursorStore: require('./create-cursor-store')
};