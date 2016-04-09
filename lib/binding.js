var unique = require('array-unique')
var util = require('./util')

/**
 * Create binding instance with reactive and el
 *
 * @param {Reactive} reactive
 * @param {Element} el
 * @param {Array} optional predefined bindings
 * @api public
 */
function Binding(reactive, el, bindings) {
  this._reactive = reactive
  this.bindings = bindings || []
  this.el = el
}

/**
 * Add text interpolation binding
 *
 * @param {String} textContent el textContent
 * @api public
 */
Binding.prototype.interpolation = function (textContent) {
  if (textContent.trim() === '') return
  if (!util.hasInterpolation(textContent)) return
  var config = util.parseInterpolationConfig(textContent)
  var props = config.bindings
  var filters = this._reactive.filters
  var fns = config.fns
  if (fns.length) {
    var arr = this.parseFunctionBindings(fns)
    props = unique(props.concat(arr))
  }
  props = this.filterBindings(props)
  var func = function (el) {
    var model = this._reactive.model
    var render = function () {
      // much better performance than innerHTML
      el.textContent = config.fn(model, filters)
    }
    this.bindReactive(props, render)
    render()
  }
  this.bindings.push(func)
}

/**
 * Get model bindings from function names
 *
 * @param {Array} fns function name
 * @return {Array}
 * @api private
 */
Binding.prototype.parseFunctionBindings = function (fns) {
  var res = []
  var model = this._reactive.model
  fns.forEach(function (name) {
    var fn = model[name]
    if (!fn || typeof fn !== 'function') throw new Error('Can\'t find function [' + name + '] on model')
    res = res.concat(util.parseBindings(fn))
  })
  return unique(res)
}

/**
 * Add a binding by element attribute
 *
 * @param {String} attr attribute name
 * @param {String} value attribute value
 * @api public
 */
Binding.prototype.add = function (attr, value) {
  // custom bindings first
  var fn = this._reactive.bindings[attr]
  // no binding should be ok
  if (!fn) return
  // custom bindings don't return function
  var func = fn.call(this, value)
  if (func) this.bindings.push(func)
}

/**
 * Filter binding names with model
 *
 * @param {Array} props binding names
 * @return {Array}
 * @api public
 */
Binding.prototype.filterBindings = function (props) {
  var model = this._reactive.model
  return props.filter(function (name) {
    return (name in model)
  })
}

/**
 * Bind all bindings to the element
 *
 * @param {Element} el
 * @api public
 */
Binding.prototype.active = function (el) {
  var self = this
  if (this.bindings.length === 0) return
  this.bindings.forEach(function (fn) {
    fn.call(self, el)
  })
}

/**
 * Bind eventlistener to model attribute[s]
 *
 * @param {String|Array} props model attribute[s]
 * @param {Function} fn listener
 * @api private
 */
Binding.prototype.bindReactive = function (props, fn) {
  var reactive = this._reactive
  if (typeof props === 'string') {
    reactive.sub(props, fn)
  } else {
    props.forEach(function (prop) {
      reactive.sub(prop, fn)
    })
  }
}

/**
 * Remove this binding
 *
 * @api public
 */
Binding.prototype.remove = function () {
  this.bindings = null
  delete this._reactive
  delete this.el
}

/**
 * Custom binding method: bind propertie(s) with function
 * function is called with model and element
 *
 * @param {String|Array} bindings bind properties
 * @param {Function} fn callback function
 * @api public
 */
Binding.prototype.bind = function (bindings, fn) {
  var func = function (el) {
    var self = this
    //we should not use reactive of this binding instance
    var model = this._reactive.model
    var render = function () {
      fn.call(self, model, el)
    }
    this.bindReactive(bindings, render)
    render()
  }
  this.bindings.push(func)
}

/**
 * Binding method: bind all properties change with function
 * function is called with name, value, model and element
 * it's not called at start up, so could not be used for render element
 *
 * @param {String|Array} bindings bind properties
 * @param {Function} fn callback function
 * @api public
 */
Binding.prototype.bindAll = function (fn) {
  var func = function (el) {
    var self = this
    var reactive = this._reactive
    var model = reactive.model
    var render = function (name, val) {
      fn.call(self, name, val, model, el)
    }
    reactive.subAll(render)
  }
  this.bindings.push(func)
}

module.exports = Binding
