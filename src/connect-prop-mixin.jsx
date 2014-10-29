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
    getInitialState() {
      var state = {};
      state[name] = this.props[prop]();
      return state;
    },
    componentWillReceiveProps(nextProps) {
      if (!nextProps || !nextProps[prop]) return;
      if (this.props && nextProps[prop] === this.props[prop]) return;
      nextProps[prop].listen(update, this);
      update(nextProps[prop]());
      if (!this.props || !this.props[prop]) return;
      this.props[prop].unlisten(update, this);
    },
    componentDidMount() {
      if (!this.props || !this.props[prop]) return;
      this.props[prop].listen(update, this);
    },
    componentWillUnmount() {
      if (!this.props || !this.props[prop]) return;
      this.props[prop].unlisten(update, this);
    }
  };
}