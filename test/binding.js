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
      last: 'texi',
      active: false
    }
    emitter(model)
  })

  afterEach(function () {
    model = null
    document.body.removeChild(el)
  })

  it('should init', function () {
    var reactive = new Reactive(el, model)
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

  it('should render empty string if property is null or undefined', function () {
    var reactive = new Reactive(el, model)
    var binding = new Binding(reactive)
    model.middle = null
    binding.interpolation('{first}{middle}{top}')
    binding.active(el)
    assert.equal(el.textContent, model.first)
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

  it('should use custom bindings first', function () {
    var fired
    var ck = document.createElement('input')
    ck.type = 'checkbox'
    ck.setAttribute('data-checked', 'active')
    el.appendChild(ck)
    Reactive(el, model, {
      bindings: {
        'data-checked': function (prop) {
          this.bind(prop, function (m, el) {
            assert.equal(m, model)
            assert.equal(ck, el)
            fired = true
            if (model[prop]) {
              el.checked = true
            } else {
              el.checked = false
            }
          })
        }
      }
    })
    model.active = true
    model.emit('change active')
    assert(ck.checked === true)
    assert(fired)
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

  it('shoud set attribute correctlly if no interpolate for `data-attr`', function () {
    var node = document.createElement('a')
    var reactive = new Reactive(node, model)
    var binding = new Binding(reactive)
    var s = 'http://localhost:3000?a=1&b=2'
    binding.add('data-href', s)
    binding.active(node)
    assert.equal(node.getAttribute('href'), s)
  })

  it('should works if `data-attr` attribute not have binding', function () {
    el.setAttribute('data-xyz', 'tty')
    var reactive = new Reactive(el, model)
    var binding = new Binding(reactive)
    binding.add('data-xyz', 'tty')
    binding.active(el)
    assert.equal(el.getAttribute('data-xyz'), 'tty')
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
    binding.bind('first', function (m, node) {
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
    binding.bind(['first', 'last'], function (m, node) {
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

  it('should prevent text-interpolation when element has data-format', function () {
    model.formatId = function (id) {
      return id.toString().split('').reverse().join('')
    }
    el.textContent = '{id}'
    el.setAttribute('data-format', 'formatId')
    var reactive = new Reactive(el, model)
    var binding = new Binding(reactive)
    binding.interpolation('{id}')
    assert(binding.bindings.length === 1)
  })


  it('should check the binding name exists', function () {
    var exist = Binding.hasBinding('data-xyz')
    assert(exist === false)
    exist = Binding.hasBinding('on-tap')
    assert(exist === true)
  })

  it('shoud get context', function () {
    var delegate = {}
    var reactive = new Reactive(el, model, {
      delegate: delegate
    })
    var binding = new Binding(reactive)
    var context = binding.getContext(true)
    assert.equal(context, model)
    context = binding.getContext()
    assert.equal(context, delegate)
  })

  it('should remove binding', function () {
    var reactive = new Reactive(el, model)
    var binding = new Binding(reactive)
    binding.remove()
    assert.equal(binding.bindings, null)
    assert.equal(binding._reactive, undefined)
  })
})

