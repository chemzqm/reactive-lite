/*global describe, it, beforeEach, afterEach*/
var Reactive = require('..')
var emitter = require('emitter')
var assert = require('assert')
var domify = require('domify')

describe('#Reactive', function () {

  var el
  var model
  beforeEach(function () {
    el = document.createElement('div')
    document.body.appendChild(el)
    model = {first: 'tobi', age: 33 ,active: true}
    emitter(model)
  })

  afterEach(function () {
    if (el.parentNode) {
      document.body.removeChild(el)
    }
    model = null
  })

  describe('Reactive', function () {
    it('should init with string template', function () {
      var r = new Reactive('<div>{first}</div>', model)
      assert(r.model === model)
      assert(r.el != null)
    })

    it('should init with new keyword', function () {
      var r = new Reactive(el, model)
      assert(r.model === model)
      assert.equal(r.el, el)
    })

    it('should init without new keyword', function () {
      var r = Reactive(el, model)
      assert(r.model === model)
      assert.equal(r.el, el)
    })
  })

  describe('process node', function () {
    it('should interpolate single node', function () {
      el.textContent = '{first}'
      var r = new Reactive(el, model)
      assert.equal(el.textContent, model.first)
      r.remove()
    })

    it('should interpolate text node with silbing element', function () {
      el.textContent = '{first}'
      el.appendChild(document.createElement('div'))
      var r = new Reactive(el, model)
      assert.equal(el.firstChild.textContent, model.first)
      r.remove()
    })

    it('should ignore comment node', function () {
      var node = domify('<!--<div>{first}</div>-->')
      el.appendChild(node)
      var text = el.textContent
      var r = new Reactive(el, model)
      assert.equal(el.textContent, text)
      r.remove()
    })

    it('should ignore comment node with sibling', function () {
      var node = domify('<!--<div>{first}</div>-->')
      el.appendChild(node)
      var div = document.createElement('div')
      div.textContent = '{first}'
      el.appendChild(div)
      var r = new Reactive(el, model)
      assert.equal(el.firstChild.textContent, '<div>{first}</div>')
      assert.equal(el.childNodes[1].textContent, model.first)
      r.remove()
    })
  })

  describe('.sub', function () {
    it('should subscribe changes on sub()', function () {
      var count = 0
      var fn = function () {
        count++
      }
      var r = new Reactive(el, model)
      r.sub('first', fn)
      model.emit('change first')
      assert.equal(count, 1)
      model.emit('change last')
      assert.equal(count, 1)
      model.emit('change first')
      assert.equal(count, 2)
      r.remove()
    })

    it('should unsub changes when removed', function () {
      var count = 0
      var fn = function () {
        count++
      }
      var r = new Reactive(el, model)
      r.sub('first', fn)
      model.emit('change first')
      assert.equal(count, 1)
      r.remove()
      model.emit('change first')
      assert.equal(count, 1)
      model.emit('change first')
      assert.equal(count, 1)
    })
  })

  describe('.getDelegate', function () {

    it('should get function from delegate', function () {
      var delegate = {}
      var func = delegate.format = function (first) {
        return 'hi, ' + first
      }
      var r = new Reactive(el, model, { delegate: delegate })
      var fn = r.getDelegate('format')
      assert.equal(fn, func)
    })

    it('should throw when not find delegate function', function () {
      var err
      try {
        var delegate = {}
        var r = new Reactive(el, model, { delegate: delegate })
        r.getDelegate('format')
      } catch (e) {
        err = e
      }
      assert(/delegate/.test(err.message))
    })
  })

  describe('.checkModel', function () {
    it('should throw', function () {
      var r = new Reactive(el, {})
      var err
      try {
        r.checkModel({})
      } catch(e) {
        err = e
      }
      assert(!!err)
    })

    it('should not throw', function () {
      var r = new Reactive(el, {})
      var err
      try {
        r.checkModel(model)
      } catch(e) {
        err = e
      }
      assert(!err)
    })
  })

  describe('.remove', function () {
    it('should remove node', function () {
      var count = 0
      var r = new Reactive(el, model)
      r.on('remove', function () {
        count++
      })
      r.remove()
      assert.equal(count, 1)
      assert(el.parentNode == null)
    })

    it('should should not throw when called more than once', function () {
      var count = 0
      var r = new Reactive(el, model)
      r.on('remove', function () {
        count++
      })
      r.remove()
      r.remove()
      assert.equal(count, 1)
      assert(el.parentNode == null)
    })

    it('should should not throw when element removed before remove call', function () {
      var count = 0
      var r = new Reactive(el, model)
      r.on('remove', function () {
        count++
      })
      el.parentNode.removeChild(el)
      r.remove()
      assert.equal(count, 1)
      assert(el.parentNode == null)
    })

    it('should not publish event after remove', function () {
      var count = 0
      var r = new Reactive(el, model)
      r.on('remove', function () {
        count++
      })
      r.remove()
      r.emit('remove')
      r.emit('remove')
      assert.equal(count, 1)
    })
  })

  describe('Reactive.createBinding', function () {
    it('should create binding', function () {
      Reactive.createBinding('data-usable', function (prop) {
        this.bind(prop, function (model, el) {
          if (model[prop] < 18) {
            el.setAttribute('disabled', '')
          } else {
            el.removeAttribute('disabled')
          }
        })
      })
      var btn = document.createElement('button')
      btn.value = 'click'
      btn.setAttribute('data-usable', 'age')
      el.appendChild(btn)
      var r = new Reactive(el, model)
      assert.equal(btn.disabled, false)
      model.age = 15
      model.emit('change age')
      assert.equal(btn.disabled, true)
      model.age = 19
      model.emit('change age')
      assert.equal(btn.disabled, false)
      r.remove()
      delete Reactive.bindings['data-usable']
    })

    it('should throw when global binding name in use', function () {
      var err
      try {
        Reactive.createBinding('data-href', function () {
        })
      } catch (e) {
        err = e
      }
      assert(!!err.message)
    })
  })

  describe('Reactive.createFilter', function () {
    it('shoud create filter', function () {
      Reactive.createFilter('integer', function (str) {
        if (!str) return 0
        var res = parseInt(str, 10)
        return isNaN(res) ? 0 : res
      })
      assert(!!Reactive.filters['integer'])
      delete Reactive.filters['integer']
    })

    it('should throw when global filter already defined', function () {
      var err
      try {
        Reactive.createFilter('nonull', function () {
        })
      } catch (e) {
        err =e
      }
      assert(!!err.message)
    })
  })
})
