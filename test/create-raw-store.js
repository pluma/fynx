/*jshint node: true */
/*global describe, it, afterEach */
'use strict';
var expect = require('expect.js');
var createRawStore = require('../').createRawStore;
var invoke = function (fn) {return fn();};

describe('createRawStore', function () {
  it('is a function', function () {
    expect(createRawStore).to.be.a('function');
  });
  it('returns a function', function () {
    expect(createRawStore()).to.be.a('function');
  });
  it('stores the emptyValue', function () {
    var emptyValue = 23;
    var store = createRawStore(emptyValue);
    expect(store()).to.equal(emptyValue);
  });
  describe('isEmpty', function () {
    it('returns true if the store is empty', function () {
      var emptyValue = {hello: 'world'};
      var store = createRawStore(emptyValue);
      expect(store.isEmpty()).to.be(true);
    });
    it('returns true if the store contains the emptyValue', function () {
      var emptyValue = {hello: 'world'};
      var store = createRawStore(emptyValue);
      store({});
      store(emptyValue);
      expect(store.isEmpty()).to.be(true);
    });
    it('returns false if the store contains any other value', function () {
      var emptyValue = {hello: 'world'};
      var store = createRawStore(emptyValue);
      store({});
      expect(store.isEmpty()).to.be(false);
    });
  });
  describe('when written to', function () {
    var listeners = [];
    function listen(listenable, listener) {
      var cb = listenable.listen(listener);
      listeners.push(cb);
      return cb;
    }
    afterEach(function () {
      listeners.splice(0).forEach(invoke);
    });
    it('applies the prepare function', function () {
      var value1 = {hello: 'world'};
      var value2 = {foo: 'bar'};
      function prepare(input) {
        expect(input).to.equal(value1);
        prepare.called = true;
        return value2;
      }
      var store = createRawStore('chicken', prepare);
      store(value1);
      expect(prepare.called).to.equal(true);
      expect(store()).to.equal(value2);
    });
    it('notifies listeners', function (done) {
      var store = createRawStore(42);
      listen(store, function () {
        done();
      });
      store({});
    });
    it('does not notify listeners removed by unlisten', function () {
      var store = createRawStore(42);
      var fn = function () {
        expect().fail();
      };
      store.listen(fn);
      store.unlisten(fn);
      store({});
    });
    it('does not notify listeners removed by callback', function () {
      var store = createRawStore(42);
      var cb = store.listen(function () {
        expect().fail();
      });
      cb();
      store({});
    });
    it('invokes listeners in the correct order', function (done) {
      var called = false;
      var store = createRawStore(42);
      listen(store, function () {
        called = true;
      });
      listen(store, function () {
        expect(called).to.equal(true);
        done();
      });
      store({});
    });
    it('passes the new value to its listeners', function (done) {
      var value = {hello: 'world'};
      var store = createRawStore(42);
      listen(store, function (input) {
        expect(input).to.equal(value);
        done();
      });
      store(value);
    });
    describe('isEmpty', function () {
      it('notifies listeners', function (done) {
        var store = createRawStore(42);
        listen(store.isEmpty, function () {
          done();
        });
        store({});
      });
      it('does not notify listeners removed by unlisten', function () {
        var store = createRawStore(42);
        var fn = function () {
          expect().fail();
        };
        store.isEmpty.listen(fn);
        store.isEmpty.unlisten(fn);
        store({});
      });
      it('does not notify listeners removed by callback', function () {
        var store = createRawStore(42);
        var cb = store.isEmpty.listen(function () {
          expect().fail();
        });
        cb();
        store({});
      });
      it('invokes listeners in the correct order', function (done) {
        var called = false;
        var store = createRawStore(42);
        listen(store.isEmpty, function () {
          called = true;
        });
        listen(store.isEmpty, function () {
          expect(called).to.equal(true);
          done();
        });
        store({});
      });
      it('passes true to its listeners if the new value is empty', function (done) {
        var value = 42;
        var store = createRawStore(42);
        listen(store.isEmpty, function (input) {
          expect(input).to.equal(true);
          done();
        });
        store(value);
      });
      it('passes false to its listeners if the new value is not empty', function (done) {
        var value = {hello: 'world'};
        var store = createRawStore(42);
        listen(store.isEmpty, function (input) {
          expect(input).to.equal(false);
          done();
        });
        store(value);
      });
    });
  });
});