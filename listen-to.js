/*jshint browserify: true */
'use strict';
var extend = require('extend');
var listenerMethods = require('./listener-methods');

module.exports = listenTo;

function listenTo(emitter, method) {
  return extend({
    componentDidMount: function () {
      listenerMethods.listenTo.call(this, emitter, method);
    },
    componentWillUnmount: function () {
      listenerMethods.stopListeningTo.call(this, emitter);
    }
  }, listenerMethods);
}