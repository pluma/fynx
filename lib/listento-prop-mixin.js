/*jshint browserify: true */
'use strict';
module.exports = listenToProp;

function listenToProp(prop, fn) {
  return {
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
      var func = typeof fn === 'function' ? fn : this[fn];
      if (nextProps[prop]) {
        if (nextProps[prop] === this.props[prop]) return;
        nextProps[prop].listen(func, this);
        if (this.props[prop]) {
          this.props[prop].unlisten(func, this);
        }
      } else {
        if (!this.props[prop]) return;
        this.props[prop].unlisten(func, this);
      }
    },
    componentDidMount: function componentDidMount() {
      if (!this.props[prop]) return;
      var func = typeof fn === 'function' ? fn : this[fn];
      this.props[prop].listen(func, this);
    },
    componentWillUnmount: function componentWillUnmount() {
      if (!this.props[prop]) return;
      var func = typeof fn === 'function' ? fn : this[fn];
      this.props[prop].unlisten(func, this);
    }
  };
}