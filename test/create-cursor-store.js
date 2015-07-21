/* @flow */
'use strict';
require('core-js');
import expect from 'expect.js';
import immutable from 'immutable';
import {describe, it, afterEach} from 'mocha';
import {createCursorStore} from '../src';

expect.Assertion.prototype.value = function (obj) {
  var i = expect.stringify;
  this.assert(
    immutable.is(this.obj, obj),
    () => `expected ${i(this.obj)} to have value ${i(obj)}`,
    () => `expected ${i(this.obj)} not to have value ${i(obj)}`
  );
};

describe('createCursorStore', function () {
  it('is a function', function () {
    expect(createCursorStore).to.be.a('function');
  });
  it('returns a function', function () {
    expect(createCursorStore()).to.be.a('function');
  });
  it('stores the emptyValue', function () {
    var emptyValue = immutable.Map({o: 'hi'});
    expect(emptyValue.get('o')).to.equal('hi');
    var store = createCursorStore(emptyValue);
    expect(store()).to.have.value(emptyValue);
  });
  describe('isEmpty', function () {
    it('returns true if the store is empty', function () {
      var emptyValue = immutable.Map({hello: 'world'});
      var store = createCursorStore(emptyValue);
      expect(store.isEmpty()).to.be(true);
    });
    it('returns true if the store contains the emptyValue', function () {
      var emptyValue = immutable.Map({hello: 'world'});
      var store = createCursorStore(emptyValue);
      store({});
      store(emptyValue);
      expect(store.isEmpty()).to.be(true);
    });
    it('returns false if the store contains any other value', function () {
      var emptyValue = immutable.Map({hello: 'world'});
      var store = createCursorStore(emptyValue);
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
      listeners.splice(0).forEach(fn => fn());
    });
    it('replaces "null" with the emptyValue', function (done) {
      var emptyValue = immutable.Map();
      var store = createCursorStore(emptyValue);
      store({x: 'y'});
      expect(store()).not.to.have.value(emptyValue);
      listen(store, function (value) {
        expect(value).to.have.value(emptyValue);
        done();
      });
      store(null);
    });
    it('applies the prepare function', function () {
      var value1 = {hello: 'world'};
      var value2 = {foo: 'bar'};
      function prepare(input) {
        expect(input).to.equal(value1);
        prepare.called = true;
        return value2;
      }
      var store = createCursorStore(immutable.Map(), prepare);
      store(value1);
      expect(prepare.called).to.equal(true);
      expect(store()).to.have.value(immutable.Map(value2));
    });
    it('notifies listeners', function (done) {
      var store = createCursorStore(immutable.Map());
      listen(store, function () {
        done();
      });
      store({});
    });
    it('does not notify listeners removed by unlisten', function () {
      var store = createCursorStore(immutable.Map());
      var fn = function () {
        expect().fail();
      };
      store.listen(fn);
      store.unlisten(fn);
      store({});
    });
    it('does not notify listeners removed by callback', function () {
      var store = createCursorStore(immutable.Map());
      var cb = store.listen(function () {
        expect().fail();
      });
      cb();
      store({});
    });
    it('invokes listeners in the correct order', function (done) {
      var called = false;
      var store = createCursorStore(immutable.Map());
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
      var store = createCursorStore(immutable.Map());
      listen(store, function (input) {
        expect(input).to.have.value(immutable.Map(value));
        done();
      });
      store(value);
    });
    describe('isEmpty', function () {
      it('notifies listeners', function (done) {
        var store = createCursorStore(immutable.Map());
        listen(store.isEmpty, function () {
          done();
        });
        store({});
      });
      it('does not notify listeners removed by unlisten', function () {
        var store = createCursorStore(immutable.Map());
        var fn = function () {
          expect().fail();
        };
        store.isEmpty.listen(fn);
        store.isEmpty.unlisten(fn);
        store({});
      });
      it('does not notify listeners removed by callback', function () {
        var store = createCursorStore(immutable.Map());
        var cb = store.isEmpty.listen(function () {
          expect().fail();
        });
        cb();
        store({});
      });
      it('invokes listeners in the correct order', function (done) {
        var called = false;
        var store = createCursorStore(immutable.Map());
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
        var value = {};
        var store = createCursorStore(immutable.Map());
        listen(store.isEmpty, function (input) {
          expect(input).to.equal(true);
          done();
        });
        store(value);
      });
      it('passes false to its listeners if the new value is not empty', function (done) {
        var value = {hello: 'world'};
        var store = createCursorStore(immutable.Map());
        listen(store.isEmpty, function (input) {
          expect(input).to.equal(false);
          done();
        });
        store(value);
      });
    });
  });
});
