/*jshint node: true */
/*global global, describe, it, afterEach, before, after */
'use strict';
var React = require('react/addons');
var expect = require('expect.js');
var connect = require('../').connect;
var noop = function () {};
var deeper = function () {return deeper;};
var Document = require('html-document/lib/Document').Document;

describe('connect (in a browser)', function () {
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
        connect(store, 'foo')
      ],
      componentDidMount: function () {
        expect(called).to.equal(true);
        done();
      },
      render: function () {return null;}
    });
    React.render(React.createElement(Component), global.document.body);
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
        connect(store, 'meh')
      ],
      componentWillUnmount: function () {
        expect(called).to.equal(true);
        done();
      },
      render: function () {
        return React.createElement('div');
      }
    });
    React.render(React.createElement(Component), global.document.body);
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
        connect(store, 'foo')
      ],
      render: function () {
        called = true;
        expect(this.state).to.have.property('foo', value);
        return React.createElement('div');
      }
    });
    React.render(React.createElement(Component), global.document.body);
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
        connect(store, 'foo')
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
    React.render(React.createElement(Component), global.document.body);
  });
});