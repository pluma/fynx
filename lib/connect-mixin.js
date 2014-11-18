/*jshint browserify: true */
'use strict';
module.exports = connect;

function connect(store, name) {
  function update(value) {
    /*jshint validthis: true */
    var state = {};
    state[name] = value;
    this.setState(state);
  }
  return {
    getInitialState:function() {
      var state = {};
      state[name] = store();
      return state;
    },
    componentDidMount:function() {
      store.listen(update, this);
    },
    componentWillUnmount:function() {
      store.unlisten(update, this);
    }
  };
}