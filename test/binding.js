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

    it('should works with no interpolation', function () {
      var reactive = new Reactive(el, model)
      var text = el.textContent
      var binding = new Binding(reactive)
      binding.interpolation(' first ')
      binding.active(el)
      assert.equal(el.textContent, text)
    })

    it('should interpolation buildin filter', function () {
      var reactive = new Reactive(el, model)
      var binding = new Binding(reactive)
      binding.interpolation('{first | uppercase}')
      binding.active(el)
      assert.equal(el.textContent, model.first.toUpperCase())
    })

    it('should interpolation custom filter', function () {
      var reactive = new Reactive(el, model, {filters: {
        integer: function (str) {
          if (!str) return 0
          var res = parseInt(str, 10)
          return isNaN(res) ? 0 : res
        }
      }})
      model.weight = '123.456'
      var binding = new Binding(reactive)
      binding.interpolation('{weight | integer}')
      binding.active(el)
      assert.equal(el.textContent, '123')
      model.weight = '223.555'
      model.emit('change weight')
      assert.equal(el.textContent, '223')
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
      var view = {}
      view.render = function (model, el) {
        el.textContent =  'hi, ' + model.first + model.last
      }
      var reactive = new Reactive(el, model, {delegate: view})
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

  describe('.bindAll', function() {
    it('should bind all properties change with function', function () {
      var reactive = new Reactive(el, model)
      var binding = new Binding(reactive)
      var count = 0
      binding.bindAll(function (name, value, m, node) {
        if (count == 0) {
          assert.equal(name, 'first')
          assert.equal(value, 'capture')
        } else {
          assert.equal(name, 'last')
          assert.equal(value, 'cook')
        }
        assert.equal(node, el)
        assert.equal(m, model)
        count++
      })
      binding.active(el)
      assert(count === 0)
      model.first = 'capture'
      model.emit('change', 'first', 'capture')
      assert(count === 1)
      model.first = 'cook'
      model.emit('change', 'last', 'cook')
      assert(count === 2)
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

