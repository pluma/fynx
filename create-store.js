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
  var listenTo = spec.listenTo || [];
  if (!Array.isArray(listenTo)) listenTo = [listenTo];
  function Store() {
    if (!(this instanceof Store)) return construct.apply(Store, arguments);
    Publisher.call(this);
    if (init) init.apply(this, arguments);
    var self = this;
    listenTo.forEach(function (map) {
      Object.keys(map).forEach(function (key) {
        self.listenTo(map[key], key);
      });
    });
  }
  inherits(Store, Publisher);
  extend(Store.prototype, listenerMethods, omit(spec, ['init', 'listenTo']));
  return Store;
}