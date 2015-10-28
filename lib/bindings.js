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
/*
 * events supported
 */
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

/**
 * Create `data-format` binding with value
 *
 * @param {String} value property value
 * @api public
 */
exports['data-format'] = function (value) {
  var format = this._reactive.getDelegate(value).fn
  // wrong!!!
  var text = this.el.textContent
  var config = util.parseFormatConfig(text)
  var bindings = config.bindings
  var fn = function (model) {
    return config.fn(model, format)
  }
  return function (el) {
    // called by binding
    var model = this._reactive.model
    var render = function () {
      // much better performance than innerHTML
      el.textContent = fn(model)
    }
    this.bindReactive(bindings, render)
    render()
  }
}

/**
 * Create data-render binding with property value
 *
 * @param {String} value
 * @api public
 */
exports['data-render'] = function (value) {
  var config = this._reactive.getDelegate(value)
  var isModel = config.model
  var bindings = util.parseBindings(config.fn, isModel)
  var fn = config.fn
  return function (el) {
    var model = this._reactive.model
    var context = this.getContext(isModel)
    var render = function () {
      fn.call(context, model, el)
    }
    this.bindReactive(bindings, render)
    render()
  }
}

/**
 * Create attribute interpolation bindings
 *
 */
attrs.forEach(function (attr) {
  // attribute bindings
  exports['data-' + attr] = function (value) {
    var config = util.parseInterpolationConfig(value)
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

/**
 * Create event bindings
 *
 */
events.forEach(function (name) {
  exports['on-' + name] = function (value) {
    var config = this._reactive.getDelegate(value)
    var isModel = config.model
    var fn = config.fn
    return function (el) {
      var model = this._reactive.model
      // correct context
      var context = this.getContext(isModel)
      var handler = function (e) {
        fn.call(context, e, model, el)
      }
      if (name === 'tap') {
        name = 'touchstart'
        handler = tap(handler)
      }
      event.bind(el, name, handler)
      this._reactive.on('remove', function () {
        event.unbind(el, name, handler)
      })
    }
  }
})

/**
 * Create checked&selected binding
 *
 * @api public
 */
var arr = ['checked', 'selected']
arr.forEach(function (name) {
  exports['data-' + name] = function (val) {
    return function (el) {
      var attr = val || el.getAttribute('name')
      var value = el.getAttribute('value')
      var model = this._reactive.model
      var fn = function () {
        var v = model[attr]
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
