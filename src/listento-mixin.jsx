/*jshint browserify: true */
'use strict';
module.exports = listenTo;

function listenTo(store, fn) {
  return {
    componentDidMount() {
      store.listen(typeof fn === 'function' ? fn : this[fn], this);
    },
    componentWillUnmount() {
      store.unlisten(typeof fn === 'function' ? fn : this[fn], this);
    }
  };
}