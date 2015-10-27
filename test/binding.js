/*global describe, it, beforeEach, afterEach*/
var Reactive = require('..')
var Binding = require('../lib/binding')
var assert = require('assert')
var emitter = require('emitter')

describe('#binding', function () {
  var el
  var model
  beforeEach(function () {
    el = document.createElement('div')
    document.body.appendChild(el)
    model = {
      id: 9527,
      first: 'tobi',
      last: 'texi'
    }
    emitter(model)
  })

  afterEach(function () {
    model = null
    document.body.removeChild(el)
  })

  it('should init', function () {
    var reactive = new Reactive(el, {})
    var binding = new Binding(reactive)
    assert.equal(binding.bindings.length, 0)
  })

  it('should works with interpolation', function () {
    var reactive = new Reactive(el, model)
    var binding = new Binding(reactive)
    binding.interpolation('{first} {last}')
    binding.active(el)
    assert.equal(el.textContent, model.first + ' ' + model.last)
  })

  it('should add binding', function () {
    model.render = function (model, el) {
      el.textContent =  'hi, ' + model.first + model.last
    }
    var reactive = new Reactive(el, model)
    var binding = new Binding(reactive)
    binding.add('data-render', 'render')
    binding.active(el)
    assert.equal(el.textContent, 'hi, ' + model.first + model.last)
  })

  it('should active all bindings', function () {
    var reactive = new Reactive(el, model)
    var binding = new Binding(reactive)
    binding.interpolation('{first} {last}')
    binding.add('data-id', 'uid-{id}')
    binding.active(el)
    assert.equal(el.textContent, model.first + ' ' + model.last)
    assert.equal(el.getAttribute('id'), 'uid-' + model.id)
    model.first = 'bear'
    model.emit('change first')
    assert.equal(el.textContent, model.first + ' ' + model.last)
  })

  it('should bind reactive with single prop', function () {
    var reactive = new Reactive(el, model)
    var binding = new Binding(reactive)
    var fired = false
    binding.bindReactive('first', function () {
      fired = true
    })
    model.first = 'bear'
    model.emit('change first')
    assert(fired === true)
  })

  it('should bind reactive with array of props', function () {
    var reactive = new Reactive(el, model)
    var binding = new Binding(reactive)
    var count = 0
    binding.bindReactive(['first', 'last'], function () {
      count++
    })
    model.first = 'bear'
    model.emit('change first')
    model.emit('change first')
    model.last = 'tobi'
    model.emit('change last')
    assert(count === 3)
  })

  it('should bind property with function', function () {
    var reactive = new Reactive(el, model)
    var binding = new Binding(reactive)
    var count = 0
    binding.bind('first', function (node, m) {
      assert.equal(node, el)
      assert.equal(m, model)
      count++
    })
    binding.active(el)
    assert(count === 1)
    model.emit('change first')
    assert(count === 2)
  })

  it('should bind multiply properties with function', function () {
    var reactive = new Reactive(el, model)
    var binding = new Binding(reactive)
    var count = 0
    binding.bind(['first', 'last'], function (node, m) {
      assert.equal(node, el)
      assert.equal(m, model)
      count++
    })
    binding.active(el)
    assert(count === 1)
    model.emit('change first')
    assert(count === 2)
    model.emit('change last')
    assert(count === 3)
  })

  it('should check the binding name exists', function () {
    var exist = Binding.hasBinding('data-xyz')
    assert(exist === false)
    exist = Binding.hasBinding('on-tap')
    assert(exist === true)
  })

  it('should remove binding', function () {
    var reactive = new Reactive(el, model)
    var binding = new Binding(reactive)
    binding.remove()
    assert.equal(binding.bindings, null)
    assert.equal(binding._reactive, undefined)
  })
})

