![Fynx](https://foss-haas.github.io/fynx/fynx.png)

**Fynx** (formerly known as Flox) is an architecture library for [React](http://facebook.github.io/react) loosely based on the [Flux architecture](http://facebook.github.io/flux) and inspired by [Reflux](https://www.npmjs.com/package/reflux) and [Fluxxor](http://fluxxor.com).

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/foss-haas/fynx)

[![license - MIT](https://img.shields.io/npm/l/fynx.svg)](http://foss-haas.mit-license.org) [![Dependencies](https://img.shields.io/david/foss-haas/fynx.svg)](https://david-dm.org/foss-haas/fynx)

[![NPM status](https://nodei.co/npm/fynx.png?compact=true)](https://www.npmjs.com/package/fynx)

[![Build status](https://img.shields.io/travis/foss-haas/fynx.svg)](https://travis-ci.org/foss-haas/fynx) [![Coverage status](https://img.shields.io/coveralls/foss-haas/fynx.svg)](https://coveralls.io/r/foss-haas/fynx?branch=master)

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

## createAction

Creates an action. Returns a function that will pass its argument to all of its listeners in sequence and return the result.

For a full documentation of this function, see [the documentation of `axn`](https://github.com/pluma/axn#axnspecfunction).

**Arguments**

* **spec**: *any* (optional)

  The `axn` spec for this action.

## createActions

Creates an object providing multiple actions. Convenience wrapper around `createAction` for bulk creation of actions.

**Arguments**

* **specs**: *Array<string>*

  An array of action names to create on the returned object.

  If `specs` is an object instead, an action will be created for each property with the action name corresponding to the property name and the property value being used as the `axn` spec for the action.

## createAsyncAction([spec]):asyncAction

Creates an asynchronous action. Returns a function that will pass its argument to all of its listeners in sequence and return a cancellable promise.

Note that `React.renderToString` is always synchronous so you should not rely on asynchronous actions being executed in your components during server-side rendering.

For a full documentation of this function, see [the documentation of `axn.async`](https://github.com/pluma/axn#axnasyncspecfunction).

**Arguments**

* **spec**: *any* (optional)

  The `axn` spec for this asynchronous action.

## createAsyncActions

Creates an object providing multiple asynchronous actions. Convenience wrapper around `createAsyncAction` for bulk creation of asynchronous actions.

**Arguments**

* **specs**: *Array<string>*

  An array of action names to create on the returned object.

  If `specs` is an object instead, an asynchronous action will be created for each property with the action name corresponding to the property name and the property value being used as the `axn` spec for the action.

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

### store.listen

Registers a change listener with the store. The listener will be invoked with the store's new content whenever it is written to.

The listener will be bound to the given `context`.

Returns a function that will remove the listener from the store when called.

**Arguments**

* **listener**: *function*

  *TODO*

* **context**: *any* (optional)

  *TODO*

### store.unlisten

Removes a change listener from the store. This has the same effect as calling the function returned by `store.listen`. If the listener was registered with a context, the same context must be used.

**Arguments**

* **listener**: *function*

  *TODO*

* **context**: *any* (optional)

  *TODO*

### store.isEmpty

Returns `true` if the store's current value is equivalent to its `emptyValue` or `false` otherwise. This function takes no arguments.

### store.isEmpty.listen

Like `store.listen`, but receives a boolean value indicating whether the store is empty (i.e. the result of calling `store.isEmpty()`) instead of the store's new content.

**Arguments**

* **listener**: *function*

  *TODO*

* **context**: *any* (optional)

  *TODO*

### store.isEmpty

Removes a change listener from `store.isEmpty`. This has the same effect as calling the function returned by `store.isEmpty.listen`. If the listener was registered with a context, the same context must be used.

**Arguments**

* **listener**: *function*

  *TODO*

* **context**: *any* (optional)

  *TODO*

## createImmutableStore

Creates a store for immutable data. The store behaves identically to a raw store except it automatically converts its value using `immutable.fromJS` and emptiness checks are always performed using `immutable.is`.

**Arguments**

* **emptyValue**: *any* (Default: `null`)

  The store's initial value, e.g. `immutable.Map()` for an empty map.

* **prepare**: *function* (optional)

  If provided, values other than `null` will be passed through this function before being passed on to `immutable.fromJS`.

## createCursorStore

Creates an immutable cursor store. The store behaves identically to an immutable store except it passes immutable cursors wherever the immutable store would pass an immutable value. Changes to the cursor will result in the changes being propagated to the store as well.

**Arguments**

* **emptyValue**: *any* (Default: `null`)

  *TODO*

* **prepare**: *function* (optional)

  *TODO*

## createKeyedStore

*TODO*

**Arguments**

* **emptyValue**: *any* (optional)

  *TODO*

* **prepare**: *function* (optional)

  *TODO*

* **isEmpty**: *function* (optional)

  *TODO*

## createKeyedStore.of

*TODO*

**Arguments**

* **createStore**: *function*

  *TODO*

* **emptyValue**: *any* (optional)

  *TODO*

* **prepare**: *function* (optional)

  *TODO*

* **isEmpty**: *function* (optional)

  *TODO*

# License

The MIT/Expat license. For more information, see http://foss-haas.mit-license.org/ or the accompanying [LICENSE](https://github.com/foss-haas/fynx/blob/master/LICENSE) file.
