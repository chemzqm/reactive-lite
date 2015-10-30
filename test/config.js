/*global describe, it, beforeEach, afterEach*/
var assert = require('assert')
var util = require('../lib/util')
var Reactive = require('..')
var emitter = require('emitter')

describe('#Binding config', function () {
  describe('util.iterate', function () {
    var j = 1
    function generateTree(node, indexes) {
      var id = indexes.join(' ')
      node.setAttribute('id', id)
      if (indexes.length >= 5) return
      var n = 2 + Math.floor(Math.random() * 5)
      for (var i = 0; i < n; i++) {
        var el = document.createElement('div')
        j++
        node.appendChild(el)
        generateTree(el, indexes.slice().concat([i]))
      }
    }

    it('should iterate all nodes', function () {
      var root = document.createElement('div')
      generateTree(root, [])
      var k = 0
      util.iterate(root, function (el, indexes) {
        k++
        var id = indexes.join(' ')
        assert.equal(el.getAttribute('id'), id)
      }, [])
      assert(k === j)
    })
  })

  describe('util.findElement', function () {
    it('should find the element', function () {
      var el = document.createElement('div')
      el.appendChild(document.createElement('div'))
      el.appendChild(document.createElement('div'))
      var node = document.createElement('div')
      var input = document.createElement('input')
      node.appendChild(input)
      el.appendChild(node)
      var indexes = [2, 0]
      assert.equal(util.findElement(el, indexes), input)
    })

    it('should return undefined if not found', function () {
      var el = document.createElement('div')
      var indexes = [2, 0]
      assert(util.findElement(el, indexes) == null)
    })
  })

  describe('reactive.generateConfig', function () {
    var model
    beforeEach(function () {
      model = {
        first: 'tobi',
        last: 'texi'
      }
      emitter(model)
    })

    afterEach(function () {
      model.off()
      model = null
    })

    function assign(to, from) {
      Object.keys(from).forEach(function (k) {
        to[k] = from[k]
      })
      return to
    }

    describe('empty bindings', function () {
      it('should no binding for pure node', function () {
        var el = document.createElement('div')
        el.id = '911'
        var config = Reactive.generateConfig(el, model)
        assert.equal(config.length, 0)
      })

      it('should no binding for comment node', function () {
        var el = document.createElement('div')
        el.id = '911'
        el.innerHTML = '<!--<span>{first}</span>-->'
        var config = Reactive.generateConfig(el, model)
        assert.equal(config.length, 0)
      })

      it('should no binding for pure node and comment node', function () {
        var el = document.createElement('div')
        el.id = '911'
        el.innerHTML = '<!--<span>{first}</span>-->'
        el.appendChild(document.createElement('div'))
        var config = Reactive.generateConfig(el, model)
        assert.equal(config.length, 0)
      })
    })

    describe('generate config', function () {
      it('shoud works with template', function () {
        var template = '<span>{first}</span>'
        var config = Reactive.generateConfig(template, model)
        assert(config.length === 1)
      })

      it('should works with text node', function () {
        var el = document.createElement('div')
        el.innerHTML = '{first}'
        el.appendChild(document.createElement('div'))
        var config = Reactive.generateConfig(el, model)
        assert.equal(config.length, 1)
      })

    })

    describe('single binding', function () {
      it('should throw if element not found', function () {
        var el = document.createElement('div')
        el.innerHTML = '<span>{first}</span>'
        el.appendChild(document.createElement('div'))
        var config = Reactive.generateConfig(el, model)
        var node = el.cloneNode(false)
        var m = assign({}, model)
        var err
        try {
          Reactive(node, m, {config: config})
        } catch (e) {
          err = e
        }
        assert(!!err.message)
      })

      it('should interpolation and react with new element and model', function () {
        var el = document.createElement('div')
        el.innerHTML = '{first}'
        el.appendChild(document.createElement('div'))
        var html = el.innerHTML
        var config = Reactive.generateConfig(el, model)
        var node = el.cloneNode(true)
        var m = assign({}, model)
        emitter(m)
        m.first = 'james'
        Reactive(node, m, {config: config})
        assert.equal(el.innerHTML, html)
        assert.equal(node.firstChild.textContent, m.first)
        m.first = 'bond'
        m.emit('change first')
        assert.equal(node.firstChild.textContent, m.first)
      })

      it('should render and react with new element and model', function () {
        var view = {}
        var el = document.createElement('div')
        el.innerHTML = '<span data-render="fullname"></span>'
        el.appendChild(document.createElement('div'))
        var html = el.innerHTML
        view.fullname = function (model, el) {
          el.innerHTML = model.first + ' ' + model.last
        }
        var config = Reactive.generateConfig(el, model, view)
        var node = el.cloneNode(true)
        var m = assign({}, model)
        emitter(m)
        m.first = 'james'
        Reactive(node, m, {delegate: view, config: config})
        assert.equal(el.innerHTML, html)
        assert.equal(node.firstChild.innerHTML, m.first + ' ' + m.last)
        m.first = 'bond'
        m.emit('change first')
        assert.equal(node.firstChild.innerHTML, m.first + ' ' + m.last)
      })

      it('should attr-interpolation and react with new element and model', function () {
        var el = document.createElement('div')
        var s = 'http://localhost/?first={first}'
        el.innerHTML = '<a data-href="' + s + '"></a>'
        el.appendChild(document.createElement('div'))
        var html = el.innerHTML
        var config = Reactive.generateConfig(el, model)
        var node = el.cloneNode(true)
        var m = assign({}, model)
        emitter(m)
        m.first = 'james'
        Reactive(node, m, {config: config})
        assert.equal(el.innerHTML, html)
        assert.equal(node.firstChild.getAttribute('href'), s.replace('{first}', m.first))
        m.first = 'bond'
        m.emit('change first')
        assert.equal(node.firstChild.getAttribute('href'), s.replace('{first}', m.first))
      })

      it('should fire event with new element and model', function () {
        var el = document.createElement('div')
        el.setAttribute('on-click', 'speak')
        el.appendChild(document.createElement('div'))
        var fired
        var delegate = {
          speak: function (e, obj, element) {
            assert.equal(obj, m)
            assert.equal(element, node)
            assert.equal(this, delegate)
            fired = true
          }
        }
        var config = Reactive.generateConfig(el, model, delegate)
        var node = el.cloneNode(true)
        var m = assign({}, model)
        Reactive(node, m, {delegate: delegate, config: config})
        node.click()
        assert.equal(fired, true)
      })

      it('should check new checkbox with checked', function () {
        var el = document.createElement('div')
        var ck = document.createElement('input')
        model.active = true
        ck.type = 'checkbox'
        ck.name = 'active'
        ck.setAttribute('data-checked', 'active')
        el.appendChild(ck)
        assert.equal(ck.checked, false)
        var config = Reactive.generateConfig(el, model)
        var node = el.cloneNode(true)
        var m = assign({}, model)
        Reactive(node, m, {config: config})
        assert.equal(ck.checked, false)
        assert.equal(node.firstChild.checked, true)
      })

      it('should render html with new element', function () {
        var el = document.createElement('div')
        el.setAttribute('data-html', 'description')
        var html = el.innerHTML
        var config = Reactive.generateConfig(el, model)
        var node = el.cloneNode(true)
        var m = assign({}, model)
        emitter(m)
        m.description = '<span>A good guy</span>'
        Reactive(node, m, {config: config})
        assert.equal(node.innerHTML, m.description)
        assert.equal(el.innerHTML, html)
        m.description = '<span>A bad guy</span>'
        m.emit('change description')
        assert.equal(el.innerHTML, html)
        assert.equal(node.innerHTML, m.description)
      })

      it('should use custom binding with new element and model', function () {
        var bindings = {
          'data-visible': function (val) {
            this.bind(val, function (model, el) {
              if (model[val] > 18) {
                el.style.display = 'block'
              } else {
                el.style.display = 'none'
              }
            })
          }
        }
        var el = document.createElement('div')
        el.setAttribute('data-visible', 'age')
        var config = Reactive.generateConfig(el, model, {},bindings)
        var node = el.cloneNode(true)
        var m = assign({}, model)
        m.age = 15
        emitter(m)
        Reactive(node, m, {config: config})
        assert(node.style.display === 'none')
        m.age = 20
        m.emit('change age')
        assert(node.style.display === 'block')
      })
    })

    describe('multiple bindings', function () {
      it('should works', function () {
        var el = document.createElement('div')
        var s = 'http://localhost/?first={first}'
        el.innerHTML = '<a data-href="' + s + '">{first} {last}</a>'
        el.appendChild(document.createElement('div'))
        var html = el.innerHTML
        var config = Reactive.generateConfig(el, model)
        var node = el.cloneNode(true)
        var m = assign({}, model)
        emitter(m)
        m.first = 'james'
        Reactive(node, m, {config: config})
        assert.equal(el.innerHTML, html)
        assert.equal(node.firstChild.getAttribute('href'), s.replace('{first}', m.first))
        assert.equal(node.firstChild.innerHTML, m.first + ' ' + m.last)
        m.first = 'bond'
        m.emit('change first')
        assert.equal(node.firstChild.getAttribute('href'), s.replace('{first}', m.first))
        assert.equal(node.firstChild.innerHTML, m.first + ' ' + m.last)
      })
    })
  })
})
