/*jshint browserify: true */
'use strict';
var extend = require('extend');
var PubSub = require('sublish');

module.exports = Publisher;

function Publisher() {
  this._emitter = new PubSub();
}
extend(Publisher.prototype, {
  beforeEmit: function () {},
  afterEmit: function () {},
  shouldEmit: function () {
    return true;
  },
  trigger: function (data) {
    if (!this.shouldEmit(this, data)) return;
    var d = this.beforeEmit(data);
    d = (d === undefined ? data : d);
    this._emitter.emit(d);
    this.afterEmit(d);
  },
  listen: function (fn, ctx) {
    return this._emitter.listen(fn, ctx);
  }
});