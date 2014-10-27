/*jshint node: true */
/*global describe, it, afterEach */
'use strict';
var expect = require('expect.js');
var createAction = require('../').createAction;
var invoke = function (fn) {return fn();};

describe('createAction', function () {
  it('is a function', function () {
    expect(createAction).to.be.a('function');
  });
  it('returns a function', function () {
    expect(createAction()).to.be.a('function');
  });
  describe('when invoked', function () {
    var listeners = [];
    function listen(listenable, listener) {
      var cb = listenable.listen(listener);
      listeners.push(cb);
      return cb;
    }
    afterEach(function () {
      listeners.splice(0).forEach(invoke);
    });
    it('notifies listeners', function (done) {
      var action = createAction();
      listen(action, function () {
        done();
      });
      action({});
    });
    it('applies the beforeEmit function', function (done) {
      var value1 = {hello: 'world'};
      var value2 = {foo: 'bar'};
      function beforeEmit(input) {
        expect(input).to.equal(value1);
        beforeEmit.called = true;
        return value2;
      }
      var action = createAction({beforeEmit: beforeEmit});
      listen(action, function (input) {
        expect(beforeEmit.called).to.equal(true);
        expect(input).to.equal(value2);
        done();
      });
      action(value1);
    });
    it('does not notify listeners removed by unlisten', function () {
      var action = createAction();
      var fn = function () {
        expect().fail();
      };
      action.listen(fn);
      action.unlisten(fn);
      action({});
    });
    it('does not notify listeners removed by callback', function () {
      var action = createAction();
      var cb = action.listen(function () {
        expect().fail();
      });
      cb();
      action({});
    });
    it('does not notify listeners if shouldEmit fails', function () {
      function shouldEmit() {
        return false;
      }
      var action = createAction({shouldEmit: shouldEmit});
      listen(action, function () {expect().fail();});
      action({});
    });
    it('invokes listeners in the correct order', function (done) {
      var called = false;
      var action = createAction();
      listen(action, function () {
        called = true;
      });
      listen(action, function () {
        expect(called).to.equal(true);
        done();
      });
      action({});
    });
    it('passes its argument to its listeners', function (done) {
      var value = {hello: 'world'};
      var action = createAction();
      listen(action, function (input) {
        expect(input).to.equal(value);
        done();
      });
      action(value);
    });
  });
});