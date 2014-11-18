/*jshint browserify: true */
'use strict';
module.exports = listenTo;

function listenTo(store, fn) {
  return {
    componentDidMount:function() {
      store.listen(typeof fn === 'function' ? fn : this[fn], this);
    },
    componentWillUnmount:function() {
      store.unlisten(typeof fn === 'function' ? fn : this[fn], this);
    }
  };
}