var bindings = require('./bindings')
var util = require('./util')

/**
 * Create binding instance with reactive and el
 *
 * @param {Reactive} reactive
 * @param {Element} el
 * @api public
 */
function Binding(reactive, el) {
  this._reactive = reactive
  this.bindings = []
  this.el = el
  reactive.once('remove', this.remove.bind(this))
}

/**
 * Add text interpolation binding
 *
 * @param {String} textContent el textContent
 * @api public
 */
Binding.prototype.interpolation = function (textContent) {
  var config = util.parseInterpolationConfig(textContent)
  var props = config.bindings
  var func = function (el) {
    var model = this._reactive.model
    var render = function () {
      // much better performance than innerHTML
      el.textContent = config.fn(model, util.toString)
    }
    this.bindReactive(props, render)
    render()
  }
  this.bindings.push(func)
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
  if (!fn) fn = bindings[attr]
  // no binding should be ok
  if (!fn) return
  // custom bindings don't return function
  var func = fn.call(this, value)
  if (func) this.bindings.push(func)
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
 * Get context indicated by `isModel`
 *
 * @param {Boolean} delegate
 * @return {Object}
 * @api public
 */
Binding.prototype.getContext = function (isModel) {
  var reactive = this._reactive
  if (isModel) return reactive.model
  return reactive.delegate
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
