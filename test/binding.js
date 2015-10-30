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
    if (el.parentNode) {
      document.body.removeChild(el)
    }
  })

  describe('new binding', function () {
    it('should init', function () {
      var reactive = new Reactive(el, model)
      var binding = new Binding(reactive)
      assert.equal(binding.bindings.length, 0)
    })
  })

  describe('.interpolation', function () {
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

    it('should react function bindings', function () {
      model.fullname = function () {
        return this.first + ',' + this.last
      }
      var reactive = new Reactive(el, model)
      var binding = new Binding(reactive)
      binding.interpolation('{fullname()}')
      binding.active(el)
      assert.equal(el.textContent, model.fullname())
      model.first = 'vally'
      model.emit('change first')
      assert.equal(el.textContent, model.fullname())
    })
  })

  describe('.add', function () {
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
  })

  describe('.active', function () {
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

    it('should works for none buildin `data-attr`', function () {
      el.setAttribute('data-xyz', 'tty')
      var reactive = new Reactive(el, model)
      var binding = new Binding(reactive)
      binding.add('data-xyz', 'tty')
      binding.active(el)
      assert.equal(el.getAttribute('data-xyz'), 'tty')
      assert(el.getAttribute('xyz') == null)
    })

  })

  describe('.bindReactive', function () {
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
  })

  describe('.bind', function () {
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
  })

  describe('.hasBinding', function () {
    it('should true', function () {
      var exist = Binding.hasBinding('on-tap')
      assert(exist === true)
    })

    it('should false', function () {
      var exist = Binding.hasBinding('data-xyz')
      assert(exist === false)
    })
  })

  describe('.getContext', function () {
    it('should return model', function () {
      var delegate = {}
      var reactive = new Reactive(el, model, {
        delegate: delegate
      })
      var binding = new Binding(reactive)
      var context = binding.getContext(true)
      assert.equal(context, model)
    })

    it('should return delegate', function () {
      var delegate = {}
      var reactive = new Reactive(el, model, {
        delegate: delegate
      })
      var binding = new Binding(reactive)
      var context = binding.getContext()
      assert.equal(context, delegate)
    })
  })

  describe('.parseFunctionBindings', function () {
    it('should parse function bindings', function () {
      model.fullname = function () {
        return this.first + ' ' + this.last
      }
      var reactive = new Reactive(el, model)
      var binding = new Binding(reactive)
      var res = binding.parseFunctionBindings(['fullname'])
      assert.deepEqual(res, ['first', 'last'])
    })

    it('should throw if function not found', function () {
      model.fullname = null
      var err
      try {
        var reactive = new Reactive(el, model)
        var binding = new Binding(reactive)
        binding.parseFunctionBindings(['fullname'])
      } catch (e) {
        err = e
      }
      assert(!!err.message)
    })

    it('should throw if function is not function', function () {
      model.fullname = 'first'
      var err
      try {
        var reactive = new Reactive(el, model)
        var binding = new Binding(reactive)
        binding.parseFunctionBindings(['fullname'])
      } catch (e) {
        err = e
      }
      assert(!!err.message)
    })

    it('should parse function bindings with unique array', function () {
      model.fullname = function () {
        return this.first + ' ' + this.last
      }
      model.full = function () {
        return this.first + ' ' + this.last
      }
      var reactive = new Reactive(el, model)
      var binding = new Binding(reactive)
      var res = binding.parseFunctionBindings(['fullname', 'full'])
      assert.deepEqual(res, ['first', 'last'])
    })

  })

  describe('.remove', function () {
    it('should remove binding', function () {
      var reactive = new Reactive(el, model)
      var binding = new Binding(reactive)
      binding.remove()
      assert.equal(binding.bindings, null)
      assert.equal(binding._reactive, undefined)
    })
  })
})

