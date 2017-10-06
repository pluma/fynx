**NOTE:** This package is no longer being maintained. If you are interested in taking over as maintainer or are interested in the npm package name, get in touch by creating an issue. If you are looking for a React state managament library try [Redux](http://redux.js.org) or [MobX](https://mobx.js.org) (or simply using [React state](https://reactjs.org/docs/state-and-lifecycle.html)).

![Fynx](https://foss-haas.github.io/fynx/fynx.png)

**Fynx** (formerly known as Flox) is an architecture library for [React](http://facebook.github.io/react) loosely based on the [Flux architecture](http://facebook.github.io/flux) and inspired by [Reflux](https://www.npmjs.com/package/reflux) and [Fluxxor](http://fluxxor.com). If React solves the V of your MVC application, Fynx provides the tools for the M and C.

[![license - MIT](https://img.shields.io/npm/l/fynx.svg?style=flat-square)](http://foss-haas.mit-license.org) [![Dependencies](https://img.shields.io/david/foss-haas/fynx.svg?style=flat-square)](https://david-dm.org/foss-haas/fynx)

[![NPM status](https://nodei.co/npm/fynx.png?compact=true)](https://www.npmjs.com/package/fynx)

[![Build status](https://img.shields.io/travis/foss-haas/fynx.svg?style=flat-square)](https://travis-ci.org/foss-haas/fynx) [![Coverage status](https://img.shields.io/coveralls/foss-haas/fynx.svg?style=flat-square)](https://coveralls.io/r/foss-haas/fynx?branch=master)

# Install

## With NPM

```sh
npm install fynx
```

## With Bower

```sh
bower install fynx
```

## From source

```sh
git clone https://github.com/foss-haas/fynx.git
cd fynx
npm install
npm run dist
```

# Overview

Fynx is loosely based on Flux and shares some of its terminology but differs in several important aspects. Like Flux, Fynx shares the notions of actions and stores, embracing React's unidirectional data flow.

## Definitions

**Actions** are the core building blocks of every Fynx application. Conceptually actions represent the overarching behavior of your application that may alter the global state or involve requests to the server. Actions are listenable functions that emit to *Listeners* whatever data they are passed and return the processed result.

**Stores** represent the shared state of an application. Like *Actions* they are listenable functions that emit their data to *Listeners* but they retain the data that is written to them and can be read from subsequently. The data contained in stores should generally be treated as immutable, with changes to that data always requiring the store to be updated.

**Listeners** are ordinary JavaScript functions listening to *Stores* or *Actions*. They provide the implementation of the behavior actions represent and allow connecting different stores and actions with each other and the outside world.

The **Router** resolves URLs to *Views* relative to the application state. To avoid unnecessary coupling, Fynx does not require the use of any particular router and can easily be used alongside your router of choice, such as [react-router](https://github.com/rackt/react-router). However you may want to give the promise-based [Rotunda](https://github.com/foss-haas/rotunda) router a try as it is being developed alongside Fynx.

**Views** in Fynx are generally assumed to be React components, although nothing about Fynx limits you to using React for your views. Generally views should only contain state directly related to their appearance and propagate changes to the global application state by invoking *Actions*. It's possible to directly link React components to Fynx stores using [mixins](https://github.com/foss-haas/fynx-mixins) (for classic React components) or [decorators](https://github.com/foss-haas/fynx-decorators) (for ES2015 class-based React components) but views work best when they have no external dependencies.

# API

## createAction

Creates an action. Returns a function that will pass its argument to all of its listeners in sequence and return the result.

For a full documentation of this function, see [the documentation of `axn`](https://github.com/pluma/axn#axnspecfunction).

**Arguments**

* **spec**: *any* (optional)

  The `axn` spec for this action.

**Examples**

*TODO*

## createActions

Creates an object providing multiple actions. Convenience wrapper around `createAction` for bulk creation of actions.

**Arguments**

* **specs**: *Array<string>*

  An array of action names to create on the returned object.

  If `specs` is an object instead, an action will be created for each property with the action name corresponding to the property name and the property value being used as the `axn` spec for the action.

**Examples**

*TODO*

## createAsyncAction

Creates an asynchronous action. Returns a function that will pass its argument to all of its listeners in sequence and return a cancellable promise.

Note that `React.renderToString` is always synchronous so you should not rely on asynchronous actions being executed in your components during server-side rendering.

For a full documentation of this function, see [the documentation of `axn.async`](https://github.com/pluma/axn#axnasyncspecfunction).

**Arguments**

* **spec**: *any* (optional)

  The `axn` spec for this asynchronous action.

**Examples**

*TODO*

## createAsyncActions

Creates an object providing multiple asynchronous actions. Convenience wrapper around `createAsyncAction` for bulk creation of asynchronous actions.

**Arguments**

* **specs**: *Array<string>*

  An array of action names to create on the returned object.

  If `specs` is an object instead, an asynchronous action will be created for each property with the action name corresponding to the property name and the property value being used as the `axn` spec for the action.

**Examples**

*TODO*

## createRawStore

Creates a raw store that can hold any value (other than `undefined`).

Returns a function with the following behaviour:
* when called without arguments (or `undefined`), returns the store's content.
* when called with `null`, resets the store's value to its initial value.
* when called with any other defined value, sets the store's value to that value

Whenever the store's value changes, the store's content will be passed to its listeners.

**Arguments**

* **emptyValue**: *any* (Default: `null`)

  The store's initial value. Note: the store's value can never be `undefined` as passing `undefined` to the store does not modify the store's value.

* **prepare**: *function* (optional)

  If provided, values other than `null` passed into the store will be passed to this function and its return value will be used as the store's new value instead.

* **isEmpty**: *function* (Default: `Object.is`)

  This function will be used to determine whether the store is currently empty. The function is passed exactly two arguments: the store's current value and the store's initial value. A return value that evaluates to the boolean value `true` indicates that the store should be considered empty.

**Examples**

*TODO*

### store.listen

Registers a change listener with the store.

Returns a function that will remove the listener from the store when called.

**Arguments**

* **listener**: *function*

  A function that will be invoked whenever the store is written to.

  The listener will receive the store's new value.

* **context**: *any* (optional)

  The `this` context to which the listener will be bound when it is invoked.

**Examples**

*TODO*

### store.listenOnce

Like `store.listen` but the listener will be automatically removed the first time it is invoked.

**Arguments**

* **listener**: *function*

  A function that will be invoked the next time the store is written to.

  The listener will receive the store's new value.

* **context**: *any* (optional)

  The `this` context to which the listener will be bound when it is invoked.

**Examples**

*TODO*

### store.unlisten

Removes a change listener from the store. This has the same effect as calling the function returned by `store.listen`. If the listener was registered with a context, the same context must be used.

**Arguments**

* **listener**: *function*

  *TODO*

* **context**: *any* (optional)

  *TODO*

**Examples**

*TODO*

### store.isEmpty

Returns `true` if the store's current value is equivalent to its `emptyValue` or `false` otherwise. This function takes no arguments.

**Examples**

*TODO*

### store.isEmpty.listen

Like `store.listen` but receives a boolean value indicating whether the store is empty (i.e. the result of calling `store.isEmpty()`) instead of the store's new content.

**Arguments**

* **listener**: *function*

  *TODO*

* **context**: *any* (optional)

  *TODO*

**Examples**

*TODO*

### store.isEmpty.listenOnce

Like `store.isEmpty.listen` but the listener will be automatically removed the first time it is invoked.

**Arguments**

* **listener**: *function*

  *TODO*

* **context**: *any* (optional)

  *TODO*

**Examples**

*TODO*

### store.isEmpty.unlisten

Removes a change listener from `store.isEmpty`. This has the same effect as calling the function returned by `store.isEmpty.listen`. If the listener was registered with a context, the same context must be used.

**Arguments**

* **listener**: *function*

  *TODO*

* **context**: *any* (optional)

  *TODO*

**Examples**

*TODO*

### store.toJSON

Returns a JSON-serializable representation of the store's current value by returning the result of the value's `toJSON` method if it exists or the value itself otherwise.

**Examples**

*TODO*

### store.fromJSON

Sets the store's value from a JSON-serializable representation.

**Arguments**

* **value**: *any*

  A JSON-serializable representation of the store's value. By default this value is simply passed to the store itself.

**Examples**

*TODO*

## createImmutableStore

Creates a store for immutable data. The store behaves identically to a raw store except it automatically converts its value using `immutable.fromJS` and emptiness checks are always performed using `immutable.is`.

**Arguments**

* **emptyValue**: *any* (Default: `null`)

  The store's initial value, e.g. `immutable.Map()` for an empty map.

* **prepare**: *function* (optional)

  If provided, values other than `null` will be passed through this function before being passed on to `immutable.fromJS`.

**Examples**

*TODO*

## createCursorStore

Creates an immutable cursor store. The store behaves identically to an immutable store except it passes immutable cursors wherever the immutable store would pass an immutable value. Changes to the cursor will result in the changes being propagated to the store as well.

**Arguments**

* **emptyValue**: *any* (Default: `null`)

  *TODO*

* **prepare**: *function* (optional)

  *TODO*

**Examples**

*TODO*

## createCollection

Creates a collection. Collections can not be listened to directly and represent a collection of stores sharing the same definitions. If a store were a crate, a collection would be a warehouse.

Passing a value to a collection will populate or modify the collection's stores for each key. A collection can be cleared by passing `null` into it. Collections always return an `immutable.OrderedMap` representing the keys and contents of all non-empty stores in the collection.

This function is a convenience wrapper around `createCollection.of` that uses `createRawStore` to create its stores.

**Arguments**

* **emptyValue**: *any* (optional)

  Stores created by the collection will be initialized to this value.

* **prepare**: *function* (optional)

  The *prepare* function that will be used to create the stores.

* **isEmpty**: *function* (optional)

  The *isEmpty* function that will be used to create the stores.

**Examples**

*TODO*

### collection.listen

Registers a change listener with the collection.

Returns a function that will remove the listener from the collection when called.

**Arguments**

* **listener**: *function*

  A function that will be invoked whenever the collection or any of its stores is written to.

  If a store is written to, the listener will receive an array consisting of the key of the store and the store's new value. If the collection itself was written to directly, the first element of the array will be `undefined` and the second element will contain the new value of the collection.

* **context**: *any* (optional)

  The `this` context to which the listener will be bound when it is invoked.

**Examples**

*TODO*

### collection.listenOnce

Like `collection.listen` but the listener will be automatically removed the first time it is invoked.

**Arguments**

* **listener**: *function*

  A function that will be invoked the next time the collection or any of its stores is written to.

  If a store is written to, the listener will receive an array consisting of the key of the store and the store's new value. If the collection itself was written to directly, the first element of the array will be `undefined` and the second element will contain the new value of the collection.

* **context**: *any* (optional)

  The `this` context to which the listener will be bound when it is invoked.

**Examples**

*TODO*

### collection.unlisten

Removes a change listener from the collection. This has the same effect as calling the function returned by `collection.listen`. If the listener was registered with a context, the same context must be used.

**Arguments**

* **listener**: *function*

  *TODO*

* **context**: *any* (optional)

  *TODO*

**Examples**

*TODO*

### collection.isEmpty

Returns `true` if the current value of each of the collection's stores is equivalent to its `emptyValue`, or `false` otherwise. This function takes no arguments.

**Examples**

*TODO*

### collection.isEmpty.listen

Like `collection.listen` but receives a boolean value indicating whether all of the collection's stores are empty (i.e. the result of calling `collection.isEmpty()`) instead of the collection's value.

**Arguments**

* **listener**: *function*

  *TODO*

* **context**: *any* (optional)

  *TODO*

**Examples**

*TODO*

### collection.isEmpty.listenOnce

Like `collection.isEmpty.listen` but the listener will be automatically removed the first time it is invoked.

**Arguments**

* **listener**: *function*

  *TODO*

* **context**: *any* (optional)

  *TODO*

**Examples**

*TODO*

### collection.isEmpty.unlisten

Removes a change listener from `collection.isEmpty`. This has the same effect as calling the function returned by `collection.isEmpty.listen`. If the listener was registered with a context, the same context must be used.

**Arguments**

* **listener**: *function*

  *TODO*

* **context**: *any* (optional)

  *TODO*

**Examples**

*TODO*

### collection.toJSON

Returns a JSON-serializable representation of the collection's current value by returning an array where each element is an array consisting of each store's key and the result of calling that store's `toJSON` method.

**Examples**

*TODO*

### collection.fromJSON

Sets the collection's value from a JSON-serializable representation.

**Arguments**

* **value**: *any*

  A JSON-serializable representation of the collection's value. If the value is an object, a store will be created for each of its keys and each value will be passed to that store's `fromJSON` method. If the value is an array, its elements are expected to be arrays consisting of each store's key and value to be passed to that store's `fromJSON` method. If the value is anything else it will be treated as `null` and clear the collection.

**Examples**

*TODO*

### collection.get

Returns the current value of the store at the given key. Creates the store if it does not exist yet.

**Arguments**

* **key**: *string*

  The key identifying the store within the collection.

**Examples**

*TODO*

### collection.set

Sets the value of the store at the given key to the given value. Creates the store if it does not exist yet. Returns the store's return value.

**Arguments**

* **key**: *string*

  The key identifying the store within the collection.

* **value**: *any*

  The value to pass to the store. Passing `null` will set the store to its initial value. Passing `undefined` will not modify the store.

**Examples**

*TODO*

### collection.has

Returns `true` if a store exists at the given key and that store is not empty, or `false` otherwise.

**Arguments**

* **key**: *string*

  The key identifying the store within the collection.

**Examples**

*TODO*

### collection.at

Returns the store at the given key. Creates the store if it does not exist yet.

**Arguments**

* **key**: *string*

  The key identifying the store within the collection.

**Examples**

*TODO*

### collection.toJSON

Returns a plain object representation of the collection with each property name and value representing each key and store value.

**Examples**

*TODO*

## createCollection.of

Behaves exactly like `createCollection` but takes a store factory function as additional argument.

Note that all stores of the collection will be created using the same function and arguments.

**Arguments**

* **createStore**: *function*

  Function that will be used to create the stores at the collection's keys, e.g. `createRawStore`.

* **emptyValue**: *any* (optional)

  Stores created by the collection will be initialized to this value.

* **prepare**: *function* (optional)

  The *prepare* function that will be used to create the stores.

* **isEmpty**: *function* (optional)

  The *isEmpty* function that will be used to create the stores. This argument is not supported by all store types.

**Examples**

```js
// Collections can be used with any type of store
let collection = createCollection.of(createImmutableStore);
let value = collection.set('x', {a: [1, 2]});
console.log(value); // -> "Map { "a": List [ 1, 2 ] }"

// Collections can even be nested!
let collection = createCollection.of(createCollection);
let subCollection = collection.at('a'); // a collection created by createCollection.of
let store = subCollection.at('b'); // a raw store created by createCollection
```

# License

The MIT/Expat license. For more information, see http://foss-haas.mit-license.org/ or the accompanying [LICENSE](https://github.com/foss-haas/fynx/blob/master/LICENSE) file.
