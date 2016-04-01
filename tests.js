var test = require('tape')

var State = require('./index')

var testState = {
  lines: [
    'An old silent pond',
    'A frog jumps into the pond,',
    'splash! Silence again'
  ],
  combined: ''
}

var testReaction = {
  combineLines: function (done, state, lineNums) {
    var combined = ''
    lineNums.forEach(function (num) {
      combined += state.get().lines[num]
    })
    done({combined: combined})
  }
}

test('Basic Init State', function (t) {
  var state = State(testState, testReaction)
  t.looseEquals(state.get(), testState, 'Initial State Passes')
  t.doesNotThrow(state.onEvent('combineLines', [1]), 'Reaction Callable')
  t.end()
})

test('Ready Event', function (t) {
  var state = State(testState, testReaction)
  state.on('ready', function () {
    t.pass('Ready Fires')
    t.end()
  })
})

test('Update Event', function (t) {
  var state = State(testState, testReaction)
  var combined = state.get().lines.join('')
  state.on('update', function (oldState) {
    t.ok(oldState.combined === '', 'Update Old State')
    t.ok(state.get().combined === combined, 'Update New State')
    t.end()
  })
  state.trigger('combineLines', [0, 1, 2])
})
