/*jshint browserify: true */
'use strict';
var extend = require('extend');
var omit = require('object-omit');
var inherits = require('util').inherits;
var Publisher = require('./publisher');

module.exports = defineAction;

function defineAction(spec) {
  if (!spec) spec = {};
  var init = spec.init;
  function action() {
    action.trigger.apply(action, arguments);
  }
  extend(action, Publisher.prototype, omit(spec, ['init']));
  Publisher.call(action);
  return action;
}