/*jshint browserify: true */
'use strict';
module.exports = connectVia;

function connectVia(stores, fn) {
  if (!Array.isArray(stores)) stores = [stores];
  function getStateFromStores(self) {
    var values = stores.map(function(store)  {return store();});
    var func = typeof fn === 'function' ? fn : self[fn];
    return func.apply(self, values);
  }
  function update() {
    /*jshint validthis: true */
    this.setState(getStateFromStores(this));
  }
  return {
    getInitialState:function() {
      return getStateFromStores(this);
    },
    componentDidMount:function() {
      stores.map(function(store)  {return store.listen(update, this);}.bind(this));
    },
    componentWillUnmount:function() {
      stores.map(function(store)  {return store.unlisten(update, this);}.bind(this));
    }
  };
}