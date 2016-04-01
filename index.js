var events = require('events')
var util = require('util')
var extend = require('xtend')

module.exports = State

function State (initialState, reactions) {
  if (!(this instanceof State)) return new State(initialState, reactions)
  if (!initialState) initialState = {}
  if (!reactions) reactions = {}
  var self = this
  self.store = {}
  self.update(initialState)
  self.reactions = reactions

  events.EventEmitter.call(self)
  process.nextTick(function () { self.emit('ready') })
}

util.inherits(State, events.EventEmitter)

State.prototype.get = function () {
  return this.store // TODO: turn into immutable store
}

State.prototype.update = function (newState) {
  var oldState = this.get()
  this.store = extend(oldState, newState)
  this.emit('update', oldState)
}

State.prototype.trigger = function (name, data) {
  if (!name) throw new Error('must have reaction')
  if (typeof data === 'undefined') data = {}
  var self = this
  var newState = {}
  if (typeof name === 'function') {
    newState = name(done, self, data)
  } else {
    var reaction = self.reactions[name]
    if (typeof reaction === 'function') newState = reaction(done, self, data)
    else if (typeof reaction === 'object') newState = reaction
    else throw new Error('Reaction not found')
  }
  if (typeof newState === 'object') return self.update(newState) // ???

  function done (newState) {
    return self.update(newState)
  }
}

State.prototype.onEvent = function (name, data) {
  var self = this
  return function () { self.trigger(name, data) }
}
