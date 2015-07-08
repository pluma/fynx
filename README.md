![Fynx](https://foss-haas.github.io/fynx/fynx.png)

# Synopsis

**Fynx** (formerly known as Flox) is an architecture library for [React](http://facebook.github.io/react) loosely based on the [Flux architecture](http://facebook.github.io/flux) and inspired by [Reflux](https://www.npmjs.com/package/reflux) and [Fluxxor](http://fluxxor.com).

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/foss-haas/fynx)

[![license - MIT](https://img.shields.io/npm/l/fynx.svg)](http://foss-haas.mit-license.org) [![Dependencies](https://img.shields.io/david/foss-haas/fynx.svg)](https://david-dm.org/foss-haas/fynx)

[![NPM status](https://nodei.co/npm/fynx.png?compact=true)](https://www.npmjs.com/package/fynx)

[![Build status](https://img.shields.io/travis/foss-haas/fynx.svg)](https://travis-ci.org/foss-haas/fynx) [![Coverage status](https://img.shields.io/coveralls/foss-haas/fynx.svg)](https://coveralls.io/r/foss-haas/fynx?branch=master) [![Codacy rating](https://img.shields.io/codacy/6f19c1455aa04fd08d77445fb5b9fc91.svg)](https://www.codacy.com/public/me_4/fynx)

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

# Usage

## Obligatory ASCII diagram

```
  ╔═════════════════╗     ╔════════╗   ┌────────────┐
  ║ View Components ║<────╢ Stores ║   │ Server API │
  ╚═══╤════╤════════╝     ╚════════╝   └────────────┘
      │    │                   ^                ^
      │    └────────────────┐  └────────────┐   │
      v                     v               │   │
  ╔═════════════════╗   ╔═════════╗     ┌───┴───┴───┐
  ║ Pure Components ║   ║ Actions ║<═══>│ Listeners │
  ╚═════════════════╝   ╚═════════╝     └───────────┘
```

## Definitions

**View Components** are components that listen to *Stores* and/or invoke *Actions*. According to the philosophy of React, these should usually be the outer most components in an application. They pass (immutable) data from *Stores* as props to the underlying **Pure Components**, the regular self-contained React components. They may also invoke *Actions* as the result of user interaction with those components.

**Stores** are listenable functions that contain the application state and emit their contents whenenever they are written to. In Fynx, these contents are generally immutable, so modifying them requires updating the store that contains them.

**Actions** are listenable functions that emit to *Listeners* whatever data is passed to them. They provide the core building block of all interactions between *View Components* and *Stores* or the *Server API*.

**Listeners** are arbitrary functions that listen to *Actions* and connect them with each other. They are the only part of the application that communicates directly with the *Server API* or writes to *Stores*. Listeners may also invoke other actions.

The **Server API** is the code that directly communicates with the remote server or persistence layer of the application. Its implementation should be entirely orthogonal to the rest of the application. For example, a thin wrapper around `XMLHttpRequest` that takes arguments and a callback or returns a promise.

## Example: Login view

For brevity, we'll use JSX with the harmony flag enabled throughout this example. This allows us to use [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) and the [method shorthand syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) introduced in ECMAScript 6. Also, if you want to give the example a try yourself, please make sure the `Promise` function is available globally. If you are using a modern evergreen browser like Chrome or Firefox, this should already be the case.

For a usable implementation based on this example [see bevanhunt's login demo app](https://github.com/bevanhunt/react-fynx-login-demo).

We're going to assume the Server API is an object that provides a single method with the following signature that returns a promise which resolves to the user data or is rejected with a descriptive error message that can be presented to the user:

`api.login(username:String, password:String):Promise`

We'll need at least two actions:

* `loginAttempt` to perform the login via the Server API.
* `loginComplete` to react to successful login attempts throughout the app.

For simplicity, we'll make both of them asynchronous and just use the bulk creation method Fynx provides:

```js
var actions = Fynx.createAsyncActions([
  'loginAttempt',
  'loginComplete'
]);
```

The application also needs a store for the user data. We're going to assume that the user data will always be a simple mapping of keys and values (i.e. a plain object) that requires no special processing:

```js
var immutable = require('immutable');
var userStore = Fynx.createSimpleStore(immutable.Map());
```

Next we need to make sure successful login attempts result in the user object provided by the server being updated in the store:

```js
actions.loginComplete.listen((userData) => userStore(userData));
```

We also need a listener that makes the actual server request. Notice that we could simply combine the two actions into one, but keeping them separate allows us to re-use them throughout the application:

```js
actions.loginAttempt.listen(
  (credentials) => api.login(credentials.username, credentials.password)
  .then((userData) => actions.loginComplete(userData))
);
```

The server API does the heavy lifting of communicating with the server, so we're only left with a little bit of glue.

Finally, the controller view itself:

```js
var Login = React.createClass({
  mixins: [
    // Make sure the "user" state is updated whenever the store changes.
    Fynx.connect(userStore, 'user')
  ],
  getInitialState() {
    return {
      username: '',
      password: '',
      error: null,
      promise: null
    };
  },
  handleFormSubmit(evt) {
    evt.preventDefault();
    // If a login attempt has already been made, cancel it.
    if (this.state.promise) this.state.promise.cancel();
    var promise = actions.loginAttempt({
      username: this.state.username,
      password: this.state.password
    });
    // If the login attempt fails, show the error message.
    promise.then(null, (reason) => {
      // If it failed because it was cancelled, ignore it.
      if (promise.cancelled()) return;
      this.setState({error: reason});
    });
    // Finally clear the previous error message.
    this.setState({
      error: null,
      promise: promise
    });
  },
  handleUsernameChange(evt) {
    this.setState({username: evt.target.value});
  },
  handlePasswordChange(evt) {
    this.setState({password: evt.target.value});
  },
  componentWillUnmount() {
    // If the component is being unmounted, old promises can only do harm.
    // So we need to make sure the component does not react to it.
    if (this.state.promise) this.state.promise.cancel();
  },
  render() {
    // Don't show the form if the user is already logged in.
    if (this.state.user.get('username')) {
      return <div>Already logged in.</div>;
    }
    return (
      <form onSubmit={this.handleFormSubmit}>
        {this.state.error}
        <label>
          Username:
          <input type="text" value={this.state.username}
            onChange={this.handleUsernameChange}/>
        </label>
        <label>
          Password:
          <input type="password" value={this.state.password}
            onChange={this.handlePasswordChange}/>
        </label>
        <button>Log in</button>
      </form>
    );
  }
});
```

## But what about waitFor?

Flux has `waitFor`, Fynx does not. Because Flux's dispatcher is entirely replaced by Fynx's actions and listeners and you're encouraged to create as many different actions as your application needs, you'll rarely run into situations where stores actually depend on each other in a way that can't be solved with a few event listeners.

If you run into a real-world scenario you can't solve with additional actions or services, feel free to [report an issue on GitHub](https://github.com/foss-haas/fynx/issues) or [discuss it on Gitter](https://gitter.im/foss-haas/fynx). Otherwise, just stick to the Fynx mantra: *If in doubt, use more duct tape!*

# API

## createAction([spec]):action

Creates an action optionally extended with the given `spec`.

Returns a function that will pass its argument to all of its listeners in sequence and return the result.

For a full documentation of this function, see [the documentation of `axn`](https://github.com/pluma/axn#axnspecfunction).

## createActions(specs):Object

Creates actions for the given `specs`. Convenience wrapper around `createAction` for bulk creation of actions.

If `specs` is an array of strings, returns an object mapping the strings to actions.

If `specs` is an object, returns an object mapping the object's keys to the result of calling `createAction` with the object's values.

## createAsyncAction([spec]):asyncAction

Creates an asynchronous action optionally extended with the given `spec`.

Returns a function that will pass its argument to all of its listeners in sequence and return a cancellable promise.

If you want to use async actions in your app, make sure the global `Promise` function is available. If you want to use async actions in environments where this is not the case (such as node and older browsers), make sure to include a polyfill like [es6-promise](https://www.npmjs.com/package/es6-promise) before the async actions are invoked.

Note that `React.renderToString` does not support asynchronous actions, so there is no need to use a polyfill to pre-render your app in node if all your asynchronous actions are only invoked in browser code.

For a full documentation of this function, see [the documentation of `axn.async`](https://github.com/pluma/axn#axnasyncspecfunction).

## createAsyncActions(specs):Object

Creates asynchronous actions for the given `specs`. Convenience wrapper around `createAction` for bulk creation of actions.

If `specs` is an array of strings, returns an object mapping the strings to async actions.

If `specs` is an object, returns an object mapping the object's keys to the result of calling `createAsyncAction` with the object's values.

## createSimpleStore(emptyValue, [prepare]):simpleStore

Creates a store for immutable data initialized with the given `emptyValue`.

Returns a function with the following behaviour:
* when called without arguments, returns the store's content.
* when called with `null`, resets the store's value to `emptyValue`.
* when called with any other defined value, sets the store's value to the result of passing that value to `immutable.fromJS`.

If `prepare` is a function, values other than `null` and `undefined` passed to the store will be preprocessed using that function.

Whenever the store's value changes, the store's content will be passed to its listeners.

### store.listen(listener, [context]):Function

Registers a change listener with the store. The listener will be invoked with the store's new content whenever it is written to.

The listener will be bound to the given `context`.

Returns a function that will remove the listener from the store when called.

### store.unlisten(listener, [context])

Removes a change listener from the store. This has the same effect as calling the function returned by `store.listen`. If the listener was registered with a context, the same context must be used.

### store.isEmpty():Boolean

Returns `true` if the store's current value is equivalent to its `emptyValue` or `false` otherwise.

### store.isEmpty.listen(listener, [context]):Function

Like `store.listen`, but receives a boolean value indicating whether the store is empty (i.e. the result of calling `store.isEmpty()`) instead of the store's new content.

### store.isEmpty.unlisten(listener, [context])

Removes a change listener from `store.isEmpty`. This has the same effect as calling the function returned by `store.isEmpty.listen`. If the listener was registered with a context, the same context must be used.

## createCursorStore(emptyValue, [prepare]):cursorStore

Creates a store initialized with the given `emptyValue`.

Behaves like `createSimpleStore` with the difference that wherever simple stores would pass an immutable value, an immutable cursor to that value is passed instead.

Changes to the cursor will result in the changes being propagated to the store as well.

## createRawStore(emptyValue, [prepare]):rawStore

Creates a store initialized with the given `emptyValue`.

Behaves like `createSimpleStore` with the difference that values are not passed to `immutable.fromJS`.

Raw stores can be useful if you want to store data that can't be meaningfully represented by `immutable`'s data structures.

## listenTo(listenable, listener):Mixin

Creates a React mixin that registers the given listener function with the given `listenable` store or action (or anything that has methods `listen(fn, ctx)` and `unlisten(fn, ctx)`). The listener will be invoked with its context set to the React component.

If `listener` is a string, the component's method with the given name will be used.

Registers the listener on `componentDidMount` and unregisters it on `componentWillUnmount`.

## listenToProp(propName, listener):Mixin

Creates a React mixin that registers the given listener function with the store or action (or anything that has methods `listen(fn, ctx)` and `unlisten(fn, ctx)`) in the prop `propName`. The listener will be invoked with its context set to the React component.

Automatically reacts to prop changes.

If `listener` is a string, the component's method with the given name will be used.

Registers the listener on `componentDidMount` and unregisters it on `componentWillUnmount`.

## connect(store, name):Mixin

Creates a React mixin that updates the component's state by setting `name` to the store's value whenever the store's value changes.

Automatically adds the store's current value to the component's initial state.

Registers the listener on `componentDidMount` and unregisters it on `componentWillUnmount`.

## connectProp(propName, name):Mixin

Creates a React mixin that updates the component's state by setting `name` to the value of the store in the prop `propName` whenever the store's value changes.

Automatically adds the store's current value to the component's initial state and reacts to prop changes.

Registers the listener on `componentDidMount` and unregisters it on `componentWillUnmount`.

## connectVia(stores, fn):Mixin

Creates a React mixin that updates the component's state by passing the current value of each store in `stores` to the given function `fn` whenever any of the stores changes. The function will be invoked with its context set to the React component.

Automatically adds the result of invoking the function with the current value of each store to the component's initial state.

If `fn` is a string, the component's method with the given name will be used.

If `stores` is not an array, it will be wrapped in an array automatically.

Registers the listener on `componentDidMount` and unregisters it on `componentWillUnmount`.

Example:

```js
React.createClass({
  mixins: [
    connectVia([aStore, bStore], 'update')
  ],
  update: function (aVal, bVal) { // invoked whenever either of the stores changes
    return {
      a: aVal,
      b: bVal.get(this.props.qux), // `this` works as usual
      c: aVal.get(bVal.get('foo')) // this.state.c depends on both stores
    };
  },
  // ...
});
```

# License

The MIT/Expat license. For more information, see http://foss-haas.mit-license.org/ or the accompanying [LICENSE](https://github.com/foss-haas/fynx/blob/master/LICENSE) file.
