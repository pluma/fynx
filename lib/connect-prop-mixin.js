/*jshint browserify: true */
'use strict';
module.exports = connectProp;

function connectProp(prop, name) {
  function update(value) {
    /*jshint validthis: true */
    var state = {};
    state[name] = value;
    this.setState(state);
  }
  return {
    getInitialState:function() {
      var state = {};
      if (this.props[prop]) {
        state[name] = this.props[prop]();
      }
      return state;
    },
    componentWillReceiveProps:function(nextProps) {
      if (nextProps[prop]) {
        if (nextProps[prop] === this.props[prop]) return;
        nextProps[prop].listen(update, this);
        update.call(this, nextProps[prop]());
        if (this.props[prop]) {
          this.props[prop].unlisten(update, this);
        }
      } else {
        if (!this.props[prop]) return;
        update.call(this, undefined);
        this.props[prop].unlisten(update, this);
      }
    },
    componentDidMount:function() {
      if (!this.props[prop]) return;
      this.props[prop].listen(update, this);
    },
    componentWillUnmount:function() {
      if (!this.props[prop]) return;
      this.props[prop].unlisten(update, this);
    }
  };
}