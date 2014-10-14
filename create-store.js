/*jshint browserify: true */
'use strict';
var extend = require('extend');
var omit = require('object-omit');
var inherits = require('util').inherits;
var construct = require('./util').construct;
var Publisher = require('./publisher');
var listenerMethods = require('./listener-methods');

module.exports = createStore;

function createStore(spec) {
  if (!spec) spec = {};
  var init = spec.init;
  function Store(opts) {
    if (!(this instanceof Store)) return new Store(opts);
    if (!opts) opts = {};
    var listenTo = opts.listenTo || [];
    if (!Array.isArray(listenTo)) listenTo = [listenTo];
    Publisher.call(this);
    var self = this;
    listenTo.forEach(function (map) {
      Object.keys(map).forEach(function (key) {
        listenerMethods.listenTo.call(self, map[key], key);
      });
    });
    if (init) init.call(this, opts);
  }
  inherits(Store, Publisher);
  extend(Store.prototype, listenerMethods, omit(spec, ['init']));
  return Store;
}