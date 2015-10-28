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
 * @param {Object} option [Optional] object with `delegate` `bindings` etc
 * @api public
 */
function Reactive(el, model, option) {
  if(!(this instanceof Reactive)) return new Reactive(el, model, option)
  if (typeof el === 'string') el = domify(el)
  option = option || {}
  this.delegate = option.delegate || {}
  this.model = model
  this.bindings = option.bindings || {}
  this.el = el
  var config = option.config
  if (!config) {
    this.checkModel(model)
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

/**
 * Check if model contains `on` `off` as function
 *
 * @param {Object} model
 * @api public
 */
Reactive.prototype.checkModel = function (model) {
  var fields = ['on', 'off']
  fields.forEach(function (field) {
    if (!util.isFunction(model, field)) {
      throw new Error(field + ' is not a function on model')
    }
  })
}

Reactive.prototype._bind = function (model, root) {
  var reactive = this
  util.walk(root, function (node, next) {
    var single = node.childNodes.length === 0
    var binding
    // text node
    if (node.nodeType === 3) {
      binding = new Binding(reactive, node)
      binding.interpolation(node.textContent)
      binding.active(node)
    } else if (node.nodeType === 1) {
      var attributes = node.attributes
      var text = node.textContent
      binding = new Binding(reactive, node)
      for (var i = 0, l = attributes.length; i < l; i++) {
        var name = attributes[i].name
        var val = attributes[i].value
        if (/^(data-|on-)/.test(name)) {
          binding.add(name, val)
        }
      }
      if (single && util.hasInterpolation(text) && !node.hasAttribute('data-format')) {
        binding.interpolation(text)
      }
      binding.active(node)
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
  if (fn && typeof fn === 'function') return {fn: fn, model: true}
  var delegate = this.delegate
  fn = delegate[name]
  if (fn && typeof fn === 'function') return {fn: fn, model: false}
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
  // silent
  if (bindings[name]) return
  bindings[name] = fn
}

module.exports = Reactive
