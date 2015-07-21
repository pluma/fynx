/*jshint browserify: true */
'use strict';
var axn = require('axn');
var createCursorStore = require('./create-cursor-store');
module.exports = {
  createAction: axn,
  createActions: require('./create-actions'),
  createAsyncAction: axn.async,
  createAsyncActions: require('./create-async-actions'),
  createStore: createCursorStore,
  createSimpleStore: require('./create-simple-store'),
  createKeyedStore: require('./create-keyed-store'),
  createCursorStore: createCursorStore,
  createRawStore: require('./create-raw-store'),
  listenTo: require('./listento-mixin'),
  listenToProp: require('./listento-prop-mixin'),
  connect: require('./connect-mixin'),
  connectProp: require('./connect-prop-mixin'),
  connectVia: require('./connect-via-mixin')
};
