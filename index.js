/*jshint browserify: true */
'use strict';
var axn = require('axn');
var createCursorStore = require('./lib/create-cursor-store');
module.exports = {
  createAction: axn,
  createActions: require('./lib/create-actions'),
  createAsyncAction: axn.async,
  createAsyncActions: require('./lib/create-async-actions'),
  createStore: createCursorStore,
  createSimpleStore: require('./lib/create-simple-store'),
  createCursorStore: createCursorStore,
  createRawStore: require('./lib/create-raw-store'),
  listenTo: require('./lib/listento-mixin'),
  listenToProp: require('./lib/listento-prop-mixin'),
  connect: require('./lib/connect-mixin'),
  connectProp: require('./lib/connect-prop-mixin'),
  connectVia: require('./lib/connect-via-mixin')
};
