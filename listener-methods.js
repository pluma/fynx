/*jshint browserify: true */
'use strict';
var listenerMethods = {
  listenTo: function (emitter, callback) {
    var self = this;
    if (!callback) {
      return Object.keys(emitter).forEach(function (key) {
        listenerMethods.listenTo.call(self, emitter[key], key);
      });
    }
    var fn = callback;
    if (typeof callback === 'string') {
      var key = callback.substr(0, 1).toUpperCase() + callback.substr(1);
      fn = self[callback] || self['on' + key] || self['handle' + key];
      if (!fn) throw new Error('Unknown method: ' + callback);
    }
    if (!self._subscriptions) self._subscriptions = [];
    var unsubscribe = emitter.listen(fn, self);
    self._subscriptions.push({
      emitter: emitter,
      unsubscribe: unsubscribe
    });
  },
  stopListeningTo: function (emitter) {
    var result = false;
    if (this._subscriptions) {
      this._subscriptions = this._subscriptions.filter(function (sub) {
        if (sub.emitter !== emitter) return true;
        sub.unsubscribe();
        result = true;
        return false;
      });
    }
    return result;
  },
  stopListeningToAll: function () {
    if (!this._subscriptions) return;
    while (this._subscriptions.length) {
      var sub = this._subscriptions.pop();
      sub.unsubscribe();
    }
  }
};
module.exports = listenerMethods;
