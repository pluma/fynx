/*global global, describe, it, afterEach, before, after */
'use strict';
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var expect = require('expect.js');
var listenTo = require('../').listenTo;
var noop = function () {};
var deeper = function () {return deeper;};
var Document = require('html-document/lib/Document').Document;

describe('listenTo (in a browser)', function () {
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
  describe('when used with a function', function () {
    it('registers it as listener with the given listenable', function (done) {
      var listener = function () {};
      var called = false;
      var listenable = {
        unlisten: noop,
        listen: function (fn, ctx) {
          expect(fn).to.equal(listener);
          expect(ctx).to.be.a(Component.type);
          called = true;
        }
      };
      var Component = React.createClass({
        mixins: [
          listenTo(listenable, listener)
        ],
        componentDidMount: function () {
          expect(called).to.equal(true);
          done();
        },
        render: function () {return null;}
      });
      React.render(React.createElement(Component), global.document.body);
    });
    it('unregisters it when the component is unmounted', function (done) {
      var listener = function () {};
      var called = false;
      var listenable = {
        listen: noop,
        unlisten: function (fn, ctx) {
          expect(fn).to.equal(listener);
          expect(ctx).to.be.a(Component.type);
          called = true;
        }
      };
      var Component = React.createClass({
        mixins: [
          listenTo(listenable, listener)
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
  });
  describe('when used with a method name', function () {
    it('registers the matching method as listener with the given listenable', function (done) {
      var called = false;
      var listenable = {
        unlisten: noop,
        listen: function (fn, ctx) {
          expect(fn()).to.equal(deeper);
          expect(ctx).to.be.a(Component.type);
          called = true;
        }
      };
      var Component = React.createClass({
        mixins: [
          listenTo(listenable, 'weMustGo')
        ],
        weMustGo: deeper,
        componentDidMount: function () {
          expect(called).to.equal(true);
          done();
        },
        render: function () {return null;}
      });
      React.render(React.createElement(Component), global.document.body);
    });
    it('unregisters the matching method when the component is unmounted', function (done) {
      var called = false;
      var listenable = {
        listen: noop,
        unlisten: function (fn, ctx) {
          expect(fn()).to.equal(deeper);
          expect(ctx).to.be.a(Component.type);
          called = true;
        }
      };
      var Component = React.createClass({
        mixins: [
          listenTo(listenable, 'weMustGo')
        ],
        weMustGo: deeper,
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
  });
});