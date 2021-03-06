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
  'touchstart',
  'touchend',
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
 * Create data-render binding with property value
 *
 * @param {String} value
 * @api public
 */
exports['data-render'] = function (value) {
  var fn = this._reactive.getDelegate(value)
  var bindings = util.parseBindings(fn, true)
  bindings = this.filterBindings(bindings)
  return function (el) {
    var model = this._reactive.model
    var context = this._reactive.delegate
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
    var hasInterpolation = util.hasInterpolation(value)
    var config = util.parseInterpolationConfig(value)
    var bindings = config.bindings
    bindings = this.filterBindings(bindings)
    var func = config.fn
    var filters = this._reactive.filters
    return function (el) {
      var model = this._reactive.model
      var fn = function () {
        if (!hasInterpolation) {
          el.setAttribute(attr, value)
        } else {
          // no escape for attribute
          var str = func(model, filters)
          el.setAttribute(attr, str)
        }
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
    var fn = this._reactive.getDelegate(value)
    return function (el) {
      var model = this._reactive.model
      var context = this._reactive.delegate
      var handler = function (e) {
        fn.call(context, e, model, el)
      }
      event.bind(el, name, handler)
      this._reactive.events.push({
        el: el,
        name: name,
        handler: handler
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

exports['data-html'] = function (value) {
  return function (el) {
    var model = this._reactive.model
    var fn = function () {
      var v = model[value]
      el.innerHTML = v == null ? '' : v
    }
    this.bindReactive(value, fn)
    fn()
  }
}
