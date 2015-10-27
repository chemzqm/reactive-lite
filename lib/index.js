var util = require('./util')
var domify = require('domify')
var Binding = require('./binding')
var bindings = require('./bindings')
var Emitter = require('emitter')

/**
 * Reactive
 *
 * @param {Element|String} el element or template string
 * @param {Object} model model with change event emitted
 * @param {Object} delegate [Optional] object with named functions
 * @param {Object} config [Optional] object with reactive config
 * @api public
 */
function Reactive(el, model, delegate, config) {
  if(!(this instanceof Reactive)) return new Reactive(el, model, delegate, config)
  if (typeof el === 'string') el = domify(el)
  this.delegate = delegate || {}
  this.model = model
  this.el = el
  if (!config) {
    this._bind(model, el)
  }
}

Emitter(Reactive.prototype)

/**
 * Remove element and unbind events
 *
 * @api public
 */
Reactive.prototype.remove = function () {
  this.el.parentNode.removeChild(this.el)
  this.emit('remove')
  // The model may still using, not destroy it
  this.model = null
  this.off()
}

Reactive.prototype._bind = function (model, root) {
  var reactive = this
  util.walk(root, function (el, next) {
    var els = util.toElementArray(el.childNodes)
    var attributes = el.attributes
    var binding = new Binding(reactive)
    for (var i = 0, l = attributes.length; i < l; i++) {
      var name = attributes[i].name
      var val = attributes[i].value
      if (/^(data-|on-)/.test(name)) {
        binding.add(name, val)
      }
    }
    if (els.length === 0 && util.hasInterpolation(el.textContent)) {
      binding.interpolation(el.textContent)
    }
    if (binding.bindings.length) {
      binding.active(el)
    } else {
      binding.remove()
    }
    next()
  })
}

/**
 * Subscribe to prop change on model
 *
 * @param {String} prop
 * @param {Function} fn
 * @api public
 */
Reactive.prototype.sub = function (prop, fn) {
  var model = this.model
  model.on('change ' + prop, fn)
  this.on('remove', function () {
    model.off('change ' + prop, fn)
  })
}
/**
 * Get delegate function by function name
 *
 * @param {String} name
 * @param {Object} reactive
 * @return {Function}
 * @api public
 */
Reactive.prototype.getDelegate = function (name) {
  var model = this.model
  var fn = model[name]
  if (fn && typeof fn === 'function') return {fn: fn, delegate: false}
  var delegate = this.delegate
  fn = delegate[name]
  if (fn && typeof fn === 'function') return {fn: fn, delegate: true}
  throw new Error('can\'t find delegate function for[' + name + ']')
}

/**
 * Create custom bindings with attribute name and function witch is call with
 * property value eg:
 * Reactive.createBinding('data-sum', function (value) {
 *    var props = value.split(',')
 *    this.bind(props, function (el, model) {
 *      var val = props.reduce(function(pre, name) {
 *        return pre + model[name]
 *      }, 0)
 *      el.textContent = val
 *   })
 * })
 *
 *
 * @param {String} name attribute name
 * @param {Function} fn
 * @api public
 */
Reactive.createBinding = function (name, fn) {
  if (bindings[name]) throw new Error('binding [' + name + '] already in use')
  bindings[name] = fn
}

module.exports = Reactive
