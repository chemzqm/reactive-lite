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

  it('should warn the user if model not have on off function', function () {
    if (!console) return
    var fired
    console.warn = function () { // eslint-disable-line
      fired = true
    }
    var r = Reactive(el, {})
    assert(fired === true)
    r.remove()
  })

  it('should interpolate text node', function () {
    el.textContent = '{first}'
    el.appendChild(document.createElement('div'))
    var r = new Reactive(el, model)
    assert.equal(el.firstChild.textContent, model.first)
    r.remove()
  })

  it('should not interpolate text node with data-format', function () {
    el.textContent = '{first}'
    el.setAttribute('data-format', 'format')
    model.format = function (first) {return first.split(/\s*/).reverse().join('')}
    var r = new Reactive(el, model)
    assert.equal(el.textContent, 'ibot')
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

  it('should interpolate single node', function () {
    el.textContent = '{first}'
    var r = new Reactive(el, model)
    assert.equal(el.textContent, model.first)
    r.remove()
  })

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

  it('should get delegate function from model', function () {
    var func = model.format = function (first) {
      return 'hi, ' + first
    }
    var r = new Reactive(el, model, {
      delegate: { format: function () { } }
    })
    var config = r.getDelegate('format')
    assert.equal(config.fn, func)
    assert.equal(config.model, true)
  })

  it('should get delegate function from delegate object', function () {
    var delegate = {}
    var func = delegate.format = function (first) {
      return 'hi, ' + first
    }
    var r = new Reactive(el, model, { delegate: delegate })
    var config = r.getDelegate('format')
    assert.equal(config.fn, func)
    assert.equal(config.model, false)
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
  })

  it('should not throw when binding name in use', function () {
    var err
    try {
      Reactive.createBinding('data-href', function () {
      })
    } catch (e) {
      err = e
    }
    assert(typeof err === 'undefined')
  })

  it('should throw when data-format element has child element', function () {
    model.format = function () { }
    el.setAttribute('data-format', 'format')
    el.appendChild(document.createElement('div'))
    var err
    try {
      new Reactive(el, model)
    } catch (e) {
      err = e
    }
    assert(/parse/.test(err.message))
  })

  it('should remove node and not publish event on remove', function () {
    var count = 0
    var r = new Reactive(el, model)
    r.on('remove', function () {
      count++
    })
    r.remove()
    assert.equal(count, 1)
    assert(el.parentNode == null)
    r.emit('remove')
    assert.equal(count, 1)
  })
})
