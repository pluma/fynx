Flox: Not quite Flux.

# Synopsis

**Flox** is a framework/architecture for [React](http://facebook.github.io/react) loosely based on the [Flux architecture](http://facebook.github.io/flux) and inspired by [Reflux](https://www.npmjs.org/package/reflux) and [Fluxxor](http://fluxxor.com).

[![license - MIT](http://b.repl.ca/v1/license-MIT-blue.png)](http://foss-haas.mit-license.org) [![Dependencies](https://david-dm.org/foss-haas/flox.png?theme=shields.io)](https://david-dm.org/foss-haas/flox)

[![NPM status](https://nodei.co/npm/flox.png?compact=true)](https://npmjs.org/package/flox)

# Install

## With NPM

```sh
npm install flox
```

## From source

```sh
git clone https://github.com/foss-haas/flox.git
cd flox
npm install
npm run dist
```

# Usage

## Obligatory ASCII diagram

```
  ╔═════════╗       ╔════════╗     ╔══════════════════╗
  ║ Actions ╟──────>║ Stores ╟────>║ Controller Views ║
  ╚════╤════╝       ╚════════╝     ╚═════╤═══╤════════╝
    ^  │  ^                              │   │
    │  │  └──────────────────────────────┘   │
    │  v                                     v
  ╔═╧════════╗    ┌────────────┐    ╔═════════════════╗
  ║ Services ╟───>│ Server API │    ║ View Components ║
  ╚══════════╝    └────────────┘    ╚═════════════════╝
```

## Definitions

**Actions** are listenable functions that emit whatever data is passed to them. They provide the core building block of all interactions between *Controller Views* or *Services* and the *Stores*.

**Stores** are listenable functions that contain the application state and emit their contents whenever they are written to. In Flox, those contents are generally immutable, so modifying them requires updating the store that contains them.

**Controller Views** are components that listen to *Stores* and/or invoke *Actions*. According to the philosophy of React these should usually be the outer most components in an application. They pass the (immutable) data from *Stores* as props to the underlying **View Components**, the regular self-contained React components. They may also invoke *Actions* as the result of user interaction with the components.

**Services** listen to *Actions* and connect them with each other. They are the only part of the application that communicates directly with the *Server API*. In practice, a service may simply be a function that is registered with an action as a listener and invokes a different action.

The **Server API** is the code that directly communicates with the remote server or persistence layer of the application. Its implementation should be entirely orthogonal to the rest of the application. For example, a thin wrapper around `XMLHttpRequest` that takes arguments and a callback or returns a promise.

## Example: Login view

We're going to assume the Server API is an object that provides a single method with the following signature that returns a promise which resolves to the user data or is rejected with a descriptive error message that can be presented to the user:

`api.login(username:String, password:String):Promise`

The application needs at least the following actions:

* `attemptLogin` for when a user attempts a login.
* `loginComplete` for when the server has acknowledged a login.
* `loginFailed` for when the server has denied a login attempt.

They don't need to do anything special, so we can just use the bulk creation method to create all three of them:

```js
var actions = Flox.createActions([
  'attemptLogin',
  'loginComplete',
  'loginFailed'
]);
```

The application also needs a store for the user data. We're going to assume that the user data will always be a simple mapping of keys and values (i.e. a plain object) that requires no special processing:

```js
var immutable = require('immutable');
var userStore = Flox.createStore(immutable.Map.empty());
actions.loginComplete.listen(function (userData) {
  userStore(userData);
});
```

There is only one service, which needs to react to the `attemptLogin` action and then invokes either `loginComplete` or `loginFailed` depending on the result of `api.login`:

```js
actions.attemptLogin.listen(function (credentials) {
  api.login(credentials.username, credentials.password)
  .then(
    function (userData) { // promise resolved
      actions.loginComplete(userData);
    },
    function (errorMessage) { // promise rejected
      actions.loginFailed(errorMessage);
    }
  );
  // or simply: .then(actions.loginComplete, actions.loginFailed);
});
```

If that service looks simple that's because it is. The server API does the heavy lifting of communicating with the server, so we're only left with a little bit of glue.

Finally, the controller view itself:

```js
var Login = React.createComponent({
  mixins: [
    Flox.connect(userStore, 'user'),
    Flox.listenTo(actions.loginFailed, 'handleLoginFailed')
  ],
  getInitialState() {
    return {username: '', password: '', error: null};
  },
  handleLoginFailed(errorMessage) {
    this.setState({error: errorMessage});
  },
  handleFormSubmit() {
    evt.preventDefault();
    actions.attemptLogin(this.state.username, this.state.password);
  },
  handleUsernameChange(evt) {
    this.setState({username: evt.target.value});
  },
  handlePasswordChange(evt) {
    this.setState({password: evt.target.value});
  },
  render() {
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

### Pragmatism beats purity

As you may have noticed, we're listening to `loginFailed` directly in our controller view. If we followed the initial definitions religiously we would have had to introduce a `loginErrorStore` to connect the controller view with the action.

You may find it useful to create additional abstractions like the `loginErrorStore` in your real-world applications, but unless your login logic is going to become relatively complex, the benefits of the additional degrees of conceptual purity likely would not outweigh their costs.

Flox tries to be as unopinionated as it can while remaining useful. The architecture recommended by this document is intended as a guideline, not a law. You may deviate from it as much as you like.

## But what about waitFor?

Flux has `waitFor`, Flox does not. Because Flux's dispatcher is entirely replaced by Flox's services and you're encouraged to create as many different actions as your application needs, you'll rarely run into situations where stores actually depend on each other in a way that can't be solved with a few event listeners.

If you run into a real-world scenario you can't solve with additional actions or services, feel free to [report an issue on GitHub](https://github.com/foss-haas/flox/issues) or [discuss it on Gitter](https://gitter.im/foss-haas/flox). Otherwise, just stick to the Flox mantra: *If in doubt, use more duct tape!*

# API

## createAction([spec]):action

Creates an action optionally extended with the given `spec`.

Returns a function that will pass its argument to all of its listeners.

If `spec` has a method `beforeEmit`, values will be pre-processed by passing them to that method first and using its return value.

If `spec` has a method `shouldEmit`, the action will only call its listeners if the result of passing the (pre-processed) value to that method is truthy.

### action.listen(listener, [context]):Function

Registers a listener with the action. The listener will be invoked whenever the action emits a value.

The listener will be bound to the given `context`.

Returns a function that will remove the listener from the action when called.

### action.unlisten(listener, [context])

Removes a listener from the action. This has the same effect as calling the function returned by `action.listen`. If the listener was registered with a context, the same context must be used.

## createActions(specs):Object

Creates actions for the given `specs`. Convenience wrapper around `createAction` for bulk creation of actions.

If `specs` is an array of strings, returns an object mapping the strings to actions.

If `specs` is an object, returns an object mapping the object's keys to the result of calling `createAction` with the object's values.

## createStore(emptyValue, [prepare]):store

Creates a store for immutable data initialized with the given `emptyValue`.

Returns a function with the following behaviour:
* when called without arguments, returns an immutable cursor for the store's content.
* when called with `null`, resets the store's value to `emptyValue`.
* when called with any other defined value, sets the store's value to the result of passing that value to `immutable.fromJS`.

If `prepare` is a function, values other than `null` and `undefined` passed to the store will be preprocessed using that function.

Whenever the store's value changes, an immutable cursor for the store's content will be passed to its listeners.

### store.listen(listener, [context]):Function

Registers a change listener with the store. The listener will be invoked with an immutable cursor for the store's new content whenever it is written to.

The listener will be bound to the given `context`.

Returns a function that will remove the listener from the store when called.

### store.unlisten(listener, [context])

Removes a change listener from the store. This has the same effect as calling the function returned by `store.listen`. If the listener was registered with a context, the same context must be used.

### store.isEmpty():Boolean

Returns `true` if the store's current value is equivalent to its `emptyValue` or `false` otherwise.

## createRawStore(emptyValue, [prepare]):rawStore

Creates a store initialized with the given `emptyValue`.

Behaves like `createStore` with the following differences:
* values are not passed to `immutable.fromJS`.
* always returns the raw (prepared) value where a regular store would return an immutable cursor.

Raw stores can be useful if you want to store data that can't be meaningfully represented by `immutable`'s data structures.

## listenTo(listenable, listener):Mixin

Creates a React mixin that registers the given listener function with the given `listenable` store or action (or anything that has methods `listen(fn, ctx)` and `unlisten(fn, ctx)`). The listener will be invoked with its context set to the React component.

If `listener` is a string, the component's method with the given name will be used.

Registers the listener on `componentDidMount` and unregisters it on `componentWillUnmount`.

## connect(store, name):Mixin

Creates a React mixin that updates the component's state by setting `name` to the store's value whenever the store's value changes.

Automatically adds the store's current value to the component's initial state.

Registers the listener on `componentDidMount` and unregisters it on `componentWillUnmount`.

# License

The MIT/Expat license. For more information, see http://foss-haas.mit-license.org/ or the accompanying [LICENSE](https://github.com/foss-haas/flox/blob/master/LICENSE) file.