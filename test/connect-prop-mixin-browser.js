/*global global, describe, it, afterEach, before, after */
'use strict';
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var expect = require('expect.js');
var connectProp = require('../').connectProp;
var noop = function () {};
var deeper = function () {return deeper;};
var Document = require('html-document/lib/Document').Document;

describe('connectProp (in a browser)', function () {
  afterEach(function () {
    React.unmountComponentAtNode(global.document.body);
  });
  before(function () {
    // Prepare the globals React expects in a browser
    global.window = {
      location: {},
      navigator: {userAgent: 'Chrome'},
      document: new Document()
    };
    global.window.window = global.window;
    global.document = global.window.document;
    console.debug = console.log;
  });
  after(function () {
    delete global.window;
    delete global.document;
    delete console.debug;
  });
  it('registers a listener with the given store', function (done) {
    var called = false;
    var store = function () {};
    store.unlisten = noop;
    store.listen = function (fn, ctx) {
      expect(fn).to.be.a('function');
      expect(ctx).to.be.a(Component.type);
      called = true;
    };
    var Component = React.createClass({
      mixins: [
        connectProp('meh', 'foo')
      ],
      componentDidMount: function () {
        expect(called).to.equal(true);
        done();
      },
      render: function () {return null;}
    });
    React.render(React.createElement(Component, {meh: store}), global.document.body);
  });
  it('unregisters the listener when the component is unmounted', function (done) {
    var called = false;
    var listener = null;
    var store = function () {};
    store.listen = function (fn) {
      listener = fn;
    };
    store.unlisten = function (fn, ctx) {
      expect(listener).not.to.be(null);
      expect(fn).to.equal(listener);
      expect(ctx).to.be.a(Component.type);
      called = true;
    };
    var Component = React.createClass({
      mixins: [
        connectProp('meh', 'meh')
      ],
      componentWillUnmount: function () {
        expect(called).to.equal(true);
        done();
      },
      render: function () {
        return React.createElement('div');
      }
    });
    React.render(React.createElement(Component, {meh: store}), global.document.body);
    React.unmountComponentAtNode(global.document.body);
  });
  it('sets the initial state from the store', function () {
    var called = false;
    var value = 'potato';
    var store = function () {return value;};
    store.listen = noop;
    store.unlisten = noop;
    var Component = React.createClass({
      mixins: [
        connectProp('meh', 'foo')
      ],
      render: function () {
        called = true;
        expect(this.state).to.have.property('foo', value);
        return React.createElement('div');
      }
    });
    React.render(React.createElement(Component, {meh: store}), global.document.body);
    expect(called).to.be(true);
  });
  it('updates the state when the store emits', function (done) {
    var value = 'potato';
    var newValue = 'tomato';
    var listeners = [];
    var store = function () {return value;};
    store.unlisten = noop;
    store.listen = function (fn, ctx) {
      listeners.push({fn: fn, ctx: ctx});
    };
    var Component = React.createClass({
      mixins: [
        connectProp('meh', 'foo')
      ],
      componentWillUpdate: function (props, state) {
        expect(state).to.have.property('foo', newValue);
        done();
      },
      componentDidMount: function () {
        expect(listeners.length).to.equal(1);
        value = newValue;
        listeners.forEach(function (listener) {
          listener.fn.call(listener.ctx, newValue);
        });
      },
      render: function () {
        return React.createElement('div');
      }
    });
    React.render(React.createElement(Component, {meh: store}), global.document.body);
  });
  describe('when the prop changes', function () {
    it('updates the state', function (done) {
      var value = 'potato';
      var newValue = 'tomato';
      var store1 = function () {return value;};
      store1.unlisten = noop;
      store1.listen = noop;
      var store2 = function () {return newValue;};
      store2.unlisten = noop;
      store2.listen = noop;
      var rerender = function () {
        rerender = noop;
        React.render(React.createElement(Component, {meh: store2}), global.document.body);
      };
      var Component = React.createClass({
        mixins: [
          connectProp('meh', 'foo')
        ],
        componentWillUpdate: function (props, state) {
          expect(props).to.have.property('meh', store2);
          expect(state).to.have.property('foo', newValue);
          done();
        },
        componentDidMount: function () {
          rerender();
        },
        render: function () {
          return React.createElement('div');
        }
      });
      React.render(React.createElement(Component, {meh: store1}), global.document.body);
    });
    it('unregisters the listener', function (done) {
      var called = false;
      var listener = null;
      var store1 = function () {};
      store1.listen = function (fn) {
        listener = fn;
      };
      store1.unlisten = function (fn, ctx) {
        expect(listener).not.to.be(null);
        expect(fn).to.equal(listener);
        expect(ctx).to.be.a(Component.type);
        called = true;
      };
      var store2 = function () {};
      store2.unlisten = noop;
      store2.listen = noop;
      var rerender = function () {
        rerender = noop;
        React.render(React.createElement(Component, {meh: store2}), global.document.body);
      };
      var Component = React.createClass({
        mixins: [
          connectProp('meh', 'foo')
        ],
        componentWillUpdate: function (props, state) {
          expect(called).to.be(true);
          done();
        },
        componentDidMount: function () {
          rerender();
        },
        render: function () {
          return React.createElement('div');
        }
      });
      React.render(React.createElement(Component, {meh: store1}), global.document.body);
    });
    it('registers a new listener', function (done) {
      var called = false;
      var listener = null;
      var store1 = function () {};
      store1.unlisten = noop;
      store1.listen = noop;
      var store2 = function () {};
      store2.listen = function (fn, ctx) {
        expect(fn).to.be.a('function');
        expect(ctx).to.be.a(Component.type);
        called = true;
      };
      store2.unlisten = noop;
      var rerender = function () {
        rerender = noop;
        React.render(React.createElement(Component, {meh: store2}), global.document.body);
      };
      var Component = React.createClass({
        mixins: [
          connectProp('meh', 'foo')
        ],
        componentWillUpdate: function (props, state) {
          expect(called).to.be(true);
          done();
        },
        componentDidMount: function () {
          rerender();
        },
        render: function () {
          return React.createElement('div');
        }
      });
      React.render(React.createElement(Component, {meh: store1}), global.document.body);
    });
    describe('when the prop is identical', function () {
      it('does nothing', function (done) {
        var called = false;
        var value = 'potato';
        var store = function () {return value;};
        store.listen = noop;
        store.unlisten = function () {
          called = true;
        };
        var rerender = function () {
          rerender = noop;
          React.render(React.createElement(Component, {meh: store, x: 'y'}), global.document.body);
        };
        var Component = React.createClass({
          mixins: [
            connectProp('meh', 'foo')
          ],
          componentWillUpdate: function (props, state) {
            expect(called).to.be(false);
            done();
          },
          componentDidMount: function () {
            rerender();
          },
          render: function () {
            return React.createElement('div');
          }
        });
        React.render(React.createElement(Component, {meh: store}), global.document.body);
      });
    });
    describe('when the new prop is missing', function () {
      it('clears the state', function (done) {
        var value = 'potato';
        var store = function () {return value;};
        store.unlisten = noop;
        store.listen = noop;
        var rerender = function () {
          rerender = noop;
          React.render(React.createElement(Component), global.document.body);
        };
        var Component = React.createClass({
          mixins: [
            connectProp('meh', 'foo')
          ],
          componentWillUpdate: function (props, state) {
            expect(props.meh).to.be(undefined);
            expect(state.foo).to.be(undefined);
            done();
          },
          componentDidMount: function () {
            rerender();
          },
          render: function () {
            return React.createElement('div');
          }
        });
        React.render(React.createElement(Component, {meh: store}), global.document.body);
      });
    });
  });
  describe('if the prop is missing', function () {
    it('does nothing', function (done) {
      var called = false;
      var Component = React.createClass({
        mixins: [
          connectProp('fourOhFour', 'missing')
        ],
        componentDidMount: function () {
          expect(this.state).not.to.have.property('missing');
          called = true;
        },
        componentWillUnmount: function () {
          expect(called).to.be(true);
          done();
        },
        render: function () {
          return React.createElement('div');
        }
      });
      React.render(React.createElement(Component), global.document.body);
      React.unmountComponentAtNode(global.document.body);
    });
    describe('when the prop changes', function () {
      it('updates the state', function (done) {
        var value = 'potato';
        var store = function () {return value;};
        store.unlisten = noop;
        store.listen = noop;
        var rerender = function () {
          rerender = noop;
          React.render(React.createElement(Component, {meh: store}), global.document.body);
        };
        var Component = React.createClass({
          mixins: [
            connectProp('meh', 'foo')
          ],
          componentWillUpdate: function (props, state) {
            expect(props).to.have.property('meh', store);
            expect(state).to.have.property('foo', value);
            done();
          },
          componentDidMount: function () {
            rerender();
          },
          render: function () {
            return React.createElement('div');
          }
        });
        React.render(React.createElement(Component), global.document.body);
      });
      it('registers a listener', function (done) {
        var called = false;
        var listener = null;
        var store = function () {};
        store.listen = function (fn, ctx) {
          expect(fn).to.be.a('function');
          expect(ctx).to.be.a(Component.type);
          called = true;
        };
        store.unlisten = noop;
        var rerender = function () {
          rerender = noop;
          React.render(React.createElement(Component, {meh: store}), global.document.body);
        };
        var Component = React.createClass({
          mixins: [
            connectProp('meh', 'foo')
          ],
          componentWillUpdate: function (props, state) {
            expect(called).to.be(true);
            done();
          },
          componentDidMount: function () {
            rerender();
          },
          render: function () {
            return React.createElement('div');
          }
        });
        React.render(React.createElement(Component), global.document.body);
      });
      describe('if the prop is still missing', function () {
        it('does nothing', function (done) {
          var called = false;
          var rerender = function () {
            rerender = noop;
            React.render(React.createElement(Component, {x: 'y'}), global.document.body);
          };
          var Component = React.createClass({
            mixins: [
              connectProp('fourOhFour', 'missing')
            ],
            componentWillUpdate: function (props, state) {
              expect(props.meh).to.be(undefined);
              expect(state.foo).to.be(undefined);
              done();
            },
            componentDidMount: function () {
              rerender();
            },
            render: function () {
              return React.createElement('div');
            }
          });
          React.render(React.createElement(Component), global.document.body);
        });
      });
    });
  });
});