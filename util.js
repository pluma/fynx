/*jshint browserify: true */
'use strict';
exports.construct = construct;

function construct() {
  var Ctor = function() {};
  Ctor.prototype = this.prototype;
  var self = new Ctor();
  this.apply(self, arguments);
  return self;
}