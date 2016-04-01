var yo = require('yo-yo')
var State = require('./index.js')

var initialState = {
  header: 'Hello World',
  footer: 'This is footer.'
}

var reactions = {
  // A UI event triggers a "reaction"
  // Reactions can just be a plain object:
  goSomewhere: {header: 'You Got Somewhere'},
  // Otherwise Reactions are pure functions that callback with a new state
  replaceSpaces: function (done, state) {
    var header = state.get().header.split(' ').join('_')
    var footer = state.get().footer.split(' ').join('_')
    done({header: header, footer: footer})
  },
  changeHeader: function (done, state, newHeader) {
    // Optional second argument for reaction is passed from UI
    var newState = {header: newHeader}
    // You can callback with partial states.
    // New state is extended from old: extend(oldState, newState)
    done(newState)
  }
}

var state = State(initialState, reactions)
var container = render(state)

// Listen for state updates and render
state.on('update', function () {
  yo.update(container, render(state))
})
document.body.appendChild(container)

function render (state) {
  var header = state.get().header
  var footer = state.get().footer
  return yo`
    <div>
      <h1>${header}</h1>
      <div>
        <p><a href="#" onclick=${state.onEvent('goSomewhere')}>Go Somewhere</a></p>
        <p><button onclick=${state.onEvent('replaceSpaces')}>Replace Spaces</button></p>
        <input
          style="margin:10px 0;padding:5px;"
          placeholder="New Header"
          onkeydown=${function (e) {
            if (e.keyCode === 13) {
              // Trigger happens immediately.
              // Use inside of another event function.
              state.trigger('changeText', this.value)
            } }}
          value=${header}
          >
        </input>
      </div>
      <footer>${footer}</footer>
    </div>`
}
