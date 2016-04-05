# State-Reactor

A global State holder with functional reactions.

1. UI uses global state to display data.
2. An event on UI triggers a reaction.
3. A reaction, a pure function, uses previous state and UI data to create a new state.
4. The `state.on('update')` fires letting you update the UI with new state.

**State => UI Display => UI Event + Data => Reaction => State**

Reactions are the important part. They look like this:

```javascript
var reactions = {
  appendNumber: function (done, state) {
    // Use just the previous state
    var numbers = state.get().numbers
    numbers.push(Math.random())
    done({numbers: numbers})
  },
  newHeader: function (done, state, inputText) {
    // Use some data passed from the UI via state.trigger
    done({header: inputText})
  }
}
```

Now you can trigger it in your UI! `state.trigger('appendNumber')` or `state.trigger('newheader', input.value)`

# API

## `var state = State([initialState], [reactions])`

Initialize the state-reactor with a initial state and named reaction functions.

* `initialState` is an object with the global state data.
* `reactions` is an object with named reaction functions.

## `var currentState = state.get()`

Get the current state.

## `state.on('update', doSomething)`

Watch for state updates. Useful to update your UI when the data changes:

```javascript
state.on('update', function (oldState) {
  // Use oldState if you want to compare changes
  if (oldState.view !== state.get().view) {
    return changeRoute()
  }
  // Otherwise update UI
  yo.update(container, render(state))
})
```

## `state.trigger('reactionName', [data])`

Trigger a reaction function immediately. Optionally pass data to use in reaction. Will call the named reaction you passed to the state-reactor on initialization.

Trigger can also take a function instead of a reaction name (see anonymous reactions below).

## `state.onEvent('reactionName', [data])`

Returns a `state.trigger('reactionName, [data])` function to call. Useful when you want to delay the call of the trigger until the event happens (e.g. `onclick`)

onEvent can also take a function instead of a reaction name (see anonymous reactions below).

# Reaction Functions

A reaction function is a pure function that takes the old state and optional UI data to update the state. Use the callback when state updates are complete.

The state will be updated with `xtend`: `xtend(oldState, reactionResult)`. Reaction result will take priority. Any reaction that returns a partial state works, you do not need to return the whole state.

```javascript
var reactions = {
  goHome: {view: 'home'}, // Directly pass new object to update state
  appendNumber: function (done, state) {
    // Use the previous state
    var numbers = state.get().numbers
    numbers.push(Math.random())
    done({numbers: numbers})
  },
  newHeader: function (done, state, inputText) {
    // Use some data passed from the UI via state.trigger
    done({header: inputText})
  }
}
```

To update state with a reaction you trigger it: `state.trigger('goHome')`.

## Anonymous Reactions

You can also have anonymous reactions. These are not passed to the `State` on initialization. This is helpful if you want to have your functions within a UI component:

```javascript
var appendNumber = function (done, state) {
  var numbers = state.get().numbers
  numbers.push(Math.random())
  done({numbers: numbers})
}

yo`<button onclick=${state.onEvent(appendNumber)}>Append Number</button>`
```

# Basic Example with Yo-Yo

This example show how you can use state-reactor with yo-yo. See a complete yo-yo example in `example.js`.

```javascript
var State = require('state-reactor')

var initialState = {
  text: 'Hello World'
}

var reactions = {
  replaceSpaces: function (done, state) {
    done({text: state.get().text.split(' ').join('_')})
  }
}

var state = State(initialState, reactions)
// Use your state in UI
var appContainer = render(state)

state.on('update', function (oldState) {
  // Update your UI 
  yo.update(appContainer, render(state))
})
document.body.appendChild(appContainer)

function render (state) {
  var text = state.get().text
  return yo`
    <div>
      <h1>${text}</h1>
      <button onclick=${state.onEvent('replaceSpaces')}>Replace Spaces</button>
    </div>`
}
```