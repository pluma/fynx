/*jshint browserify: true */
'use strict';
module.exports = connectVia;

function connectVia(stores, fn) {
  if (!Array.isArray(stores)) stores = [stores];
  function getStateFromStores(self) {
    var values = stores.map(store => store());
    var func = typeof fn === 'function' ? fn : self[fn];
    return func.apply(self, values);
  }
  function update() {
    /*jshint validthis: true */
    this.setState(getStateFromStores(this));
  }
  return {
    getInitialState() {
      return getStateFromStores(this);
    },
    componentDidMount() {
      store.listen(update, this);
    },
    componentWillUnmount() {
      store.unlisten(update, this);
    }
  };
}