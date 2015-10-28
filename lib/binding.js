var bindings = require('./bindings')
var util = require('./util')

function Binding(reactive) {
  this._reactive = reactive
  this.bindings = []
  reactive.once('remove', this.remove.bind(this))
  this.format = false
}

/**
 * Add text interpolation binding
 *
 * @param {String} textContent el textContent
 * @api public
 */
Binding.prototype.interpolation = function (textContent) {
  if (this.format) return;
  var config = util.parseRenderConfig(textContent)
  var bindings = config.bindings
  var func = function (el) {
    var model = this._reactive.model
    var render = function () {
      // much better performance than innerHTML
      el.textContent = config.fn(model, util.es)
    }
    this.bindReactive(bindings, render)
    render()
  }
  this.bindings.push(func)
}

/**
 * Add binding by element attribute
 *
 * @param {String} attr attribute name
 * @param {String} value attribute value
 * @api public
 */
Binding.prototype.add = function (attr, value) {
  if (attr === 'data-format') this.format = true
  var fn = bindings[attr]
  // no binding should be ok
  if (!fn) return
  // custom bindings don't return function
  var func = fn.call(this, value)
  if (func) {
    this.bindings.push(func)
  }
}

/**
 * Bind all bindings to the element
 *
 * @param {Element} el
 * @api public
 */
Binding.prototype.active = function (el) {
  var self = this
  if (this.bindings.length === 0) return this.remove()
  this.bindings.forEach(function (fn) {
    fn.call(self, el)
  })
}

/**
 * Bind eventlistener to model attribute[s]
 *
 * @param {String|Array} binding model attribute[s]
 * @param {Function} fn listener
 * @api private
 */
Binding.prototype.bindReactive = function (binding, fn) {
  var reactive = this._reactive
  if (typeof binding === 'string') {
    reactive.sub(binding, fn)
  } else {
    binding.forEach(function (name) {
      reactive.sub(name, fn)
    })
  }
}

Binding.prototype.remove = function () {
  this.bindings = null
  delete this._reactive
}

/**
 * Bind properties with function
 * function is called with element and model
 *
 * @param {String|Array} bindings bind properties
 * @param {Function} fn callback function
 * @api public
 */
Binding.prototype.bind = function (bindings, fn) {
  var func = function (el) {
    var self = this
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
 * Get context indicated by `delegate`
 *
 * @param {Boolean} delegate
 * @return {Object}
 * @api public
 */
Binding.prototype.getContext = function (delegate) {
  var reactive = this._reactive
  if (delegate) return reactive.delegate
  return reactive.model
}
/**
 * Check if binding defined
 *
 * @param {String} attr attribute name
 * @return {Boolean}
 * @api public
 */
Binding.hasBinding = function (attr) {
  var names = Object.keys(bindings)
  return !!~names.indexOf(attr)
}


module.exports = Binding
