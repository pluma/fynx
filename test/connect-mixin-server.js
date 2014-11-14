/*global global, describe, it, before */
var React = require('react');
var expect = require('expect.js');
var connect = require('../').connect;
var fail = function () {expect().fail();};

describe('connect (on the server)', function () {
  before(function () {
    expect(global.window).to.be(undefined);
    expect(global.document).to.be(undefined);
  });
  it('does not listen to the store', function () {
    var called = false;
    var store = function () {};
    store.listen = fail;
    store.unlisten = fail;
    var Component = React.createClass({
      mixins: [
        connect(store, 'noop')
      ],
      render: function () {
        called = true;
        return React.createElement('div');
      }
    });
    React.renderToString(React.createElement(Component));
    expect(called).to.be(true);
  });
  it('does not write to the store', function () {
    var called = false;
    var store = function () {if (arguments.length) fail();};
    var Component = React.createClass({
      mixins: [
        connect(store, 'noop')
      ],
      render: function () {
        called = true;
        return React.createElement('div');
      }
    });
    React.renderToString(React.createElement(Component));
    expect(called).to.be(true);
  });
  it('sets the initial state from the store', function () {
    var called = false;
    var value = "potato";
    var store = function () {return value;};
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
    React.renderToString(React.createElement(Component));
    expect(called).to.be(true);
  });
});