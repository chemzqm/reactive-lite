var bindings = require('./bindings')
var util = require('./util')

function Binding(reactive) {
  this._reactive = reactive
  this.bindings = []
  reactive.once('remove', this.remove.bind(this))
}

/**
 * Add text interpolation binding
 *
 * @param {String} textContent el textContent
 * @api public
 */
Binding.prototype.interpolation = function (textContent) {
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
  var fn = bindings[attr]
  // custom bindings
  if (!fn) return
  this.bindings.push(fn.call(this, value))
}

/**
 * Bind all bindings to the element
 *
 * @param {Element} el
 * @api public
 */
Binding.prototype.active = function (el) {
  var self = this
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



/**
 * Convinient method for getting model value
 *
 * @param {String} name model attribute
 * @return {Mixed} attribute value
 * @api public
 */
Binding.prototype.value = function (name) {
  var model = this._reactive.model
  return model[name]
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
      fn.call(self, el, model)
    }
    this.bindReactive(bindings, render)
    render()
  }
  this.bindings.push(func)
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
  return ~names.indexOf(attr)
}


module.exports = Binding
