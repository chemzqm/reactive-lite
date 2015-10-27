var tap = require('tap-event')
var util = require('./util.js')
var event = require('event')

/**
 * Attributes supported.
 */
var attrs = [
  'id',
  'src',
  'rel',
  'cols',
  'rows',
  'name',
  'href',
  'title',
  'class',
  'style',
  'width',
  'value',
  'height',
  'tabindex',
  'placeholder'
]

var events = [
  'change',
  'tap',
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'mousemove',
  'mouseenter',
  'mouseleave',
  'scroll',
  'blur',
  'focus',
  'input',
  'submit',
  'keydown',
  'keypress',
  'keyup'
]

exports['data-format'] = function (value) {
  var fn = util.getDelegateFn(value, this._reactive)
  var bindings = util.parseBindings(fn)
  return function (el) {
    // called by binding
    var model = this._reactive.model
    var render = function () {
      // much better performance than innerHTML
      el.textContent = fn.call(model)
    }
    this.bindReactive(bindings, render)
    render()
  }
}

exports['data-render'] = function (value) {
  var fn = util.getDelegateFn(value, this._reactive)
  var bindings = util.parseBindings(fn)
  return function (el) {
    var model = this._reactive.model
    var render = function () {
      fn.call(model, el)
    }
    this.bindReactive(bindings, render)
    render()
  }
}

attrs.forEach(function (attr) {
  // attribute bindings
  exports['data-' + attr] = function (value) {
    var config = util.parseRenderConfig(value)
    var bindings = config.bindings
    var func = config.fn
    return function (el) {
      var model = this._reactive.model
      var fn = function () {
        var str = func(model, util.es)
        el.setAttribute(attr, str)
      }
      this.bindReactive(bindings, fn)
      fn()
    }
  }
})

events.forEach(function (name) {
  exports['on-' + name] = function (value) {
    var fn = util.getDelegateFn(value, this._reactive)
    return function (el) {
      var model = this._reactive.model
      var handler
      if (name === 'tap') {
        name = 'touchstart'
        handler = tap(fn.bind(model))
      } else {
        handler = fn.bind(model)
      }
      event.bind(el, name, handler)
      this._reactive.on('remove', function () {
        event.unbind(el, name, handler)
      })
    }
  }
})

var arr = ['checked', 'selected']
arr.forEach(function (name) {
  exports['data-' + name] = function (value) {
    return function (el) {
      var attr = value || el.getAttribute('name')
      var model = this._reactive.model
      var v = model[attr]
      var fn = function () {
        var value = el.getAttribute('value')
        // single checkbox
        if (value == null) {
          if (v) {
            el.setAttribute(name, '')
          } else {
            el.removeAttribute(name)
          }
          return
        }
        if (v == null) return el.removeAttribute(name)
        // checkbox
        if (Array.isArray(v) && ~v.indexOf(value)) {
          el.setAttribute(name, '')
        // radio
        } else if (v.toString() === value) {
          el.setAttribute(name, '')
        } else {
          el.removeAttribute(name)
        }
      }
      this.bindReactive(attr, fn)
      fn()
    }
  }
})
