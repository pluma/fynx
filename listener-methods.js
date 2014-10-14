/*jshint browserify: true */
'use strict';
module.exports = {
  listenTo: function (emitter, callback) {
    var fn = callback;
    if (typeof callback === 'string') {
      var key = callback.substr(0, 1).toUpperCase() + callback.substr(1);
      fn = this[callback] || this['on' + key] || this['handle' + key];
      if (!fn) throw new Error('Unknown method: ' + callback);
    }
    if (!this._subscriptions) this._subscriptions = [];
    var unsubscribe = emitter.listen(fn, this);
    this._subscriptions.push({
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
  }
};
