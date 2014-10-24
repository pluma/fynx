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