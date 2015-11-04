var util = require('./util')
var domify = require('domify')
var Binding = require('./binding')
var bindings = require('./bindings')
var Emitter = require('emitter')
var filters = require('./filter')

/**
 * Reactive
 *
 * @param {Element|String} el element or template string
 * @param {Object} model model with change event emitted
 * @param {Object} option [Optional] object with `delegate` `bindings` `filters` etc
 * @api public
 */
function Reactive(el, model, option) {
  if(!(this instanceof Reactive)) return new Reactive(el, model, option)
  if (typeof el === 'string') el = domify(el)
  option = option || {}
  this.bindings = util.assign({}, bindings)
  // custom bindings first
  util.assign(this.bindings, option.bindings || {})
  this.filters = util.assign({}, filters)
  // custom filters first
  util.assign(this.filters, option.filters || {})
  this.binding_names = Object.keys(this.bindings)
  this.delegate = option.delegate || {}
  this.model = model
  this.el = el
  var config = option.config
  if (option.nobind) return
  if (config == null) {
    // this.checkModel(model)
    config = this.config = this.generateConfig()
    this._bindConfig(config)
  } else {
    this._bindConfig(config)
  }
}

Emitter(Reactive.prototype)

/**
 * Remove element and unbind events
 *
 * @api public
 */
Reactive.prototype.remove = function () {
  if (this._removed) return
  if (this.el.parentNode) this.el.parentNode.removeChild(this.el)
  this._removed = true
  this.emit('remove')
  // The model may still using, not destroy it
  this.model = null
  this.off()
}

/**
 * Use generated binding config
 *
 * @param {Array} config
 * @api private
 */
Reactive.prototype._bindConfig = function (config) {
  var root = this.el
  var reactive = this
  config.forEach(function (o) {
    var el = util.findElement(root, o.indexes)
    var binding = new Binding(reactive, el, o.bindings)
    binding.active(el)
    reactive.on('remove', function () {
      binding.remove()
    })
  })
}

/**
 * Parse binding object for no
 *
 * @param {Element} node
 * @return {Binding}
 * @api public
 */
Reactive.prototype.parseBinding = function (node, single) {
  var binding
  if (node.nodeType === 3) {
    binding = new Binding(this, node)
    binding.interpolation(node.textContent)
  } else if (node.nodeType === 1) {
    var attributes = node.attributes
    binding = new Binding(this, node)
    for (var i = 0, l = attributes.length; i < l; i++) {
      var name = attributes[i].name
      var val = attributes[i].value
      if (~this.binding_names.indexOf(name)) {
        binding.add(name, val)
      }
    }
    if (single) {
      binding.interpolation(node.textContent)
    }
  }
  // empty binding
  if (binding && binding.bindings.length === 0) {
    binding.remove()
    binding = null
  }
  return binding
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
  var delegate = this.delegate
  var fn = delegate[name]
  if (!fn || typeof fn !== 'function') throw new Error('can\'t find delegate function for[' + name + ']')
  return fn
}

/**
 * Generate config array
 *
 * @return {Array}
 * @api public
 */
Reactive.prototype.generateConfig = function () {
  var reactive = this
  var config = []
  util.iterate(this.el, function (node, indexes) {
    var single = util.isSingle(node)
    var binding = reactive.parseBinding(node, single)
    if (binding) {
      config.push({
        indexes: indexes,
        bindings: binding.bindings
      })
      binding.remove()
    }
  }.bind(this), [])
  return config
}

/**
 * Generate config array by the same arguments as Reactive constructor
 *
 * @param {Element} el
 * @param {Object} model
 * @param {Object} opt
 * @return {Array}
 * @api public
 */
Reactive.generateConfig = function (el, model, opt) {
  if (typeof el === 'string') el = domify(el)
  opt = opt || {}
  opt.nobind = true
  var reactive =  Reactive(el, model, opt)
  return reactive.generateConfig()
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
  var names = Object.keys(bindings)
  if (~names.indexOf(name)) throw new Error('Global binding name [' + name+ '] already in use')
  bindings[name] = fn
}

/**
 * Create global custom filter with `name` and `function`
 * eg:
 *  Reactive.createFilter('integer', function (str) {
 *   if (!str) return 0
 *   var res = parseInt(str, 10)
 *   return isNaN(res) ? 0 : res
 * })
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */
Reactive.createFilter = function (name, fn) {
  if (filters[name]) throw new Error('Global filter name [' + name + '] already in use')
  filters[name] = fn
}

// use with caution
Reactive.filters = filters
Reactive.bindings = bindings

module.exports = Reactive
