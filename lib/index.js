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
  this.delegate = option.delegate || {}
  this.model = model
  this.el = el
  var config = option.config
  if (option.nobind) return
  if (config == null) {
    // this.checkModel(model)
    this._bind()
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
      throw new Error('`on` and `off` function not found on model: ' + model.toString())
    }
  })
}

/**
 * Use generated binding config
 *
 * @param {Array} config
 * @api public
 */
Reactive.prototype._bindConfig = function (config) {
  var root = this.el
  var reactive = this
  config.forEach(function (o) {
    var el = util.findElement(root, o.indexes)
    if (!el) throw new Error('No element find for indexes [' + o.indexes+ ']')
    var binding = new Binding(reactive, el, o.bindings)
    binding.active(el)
  })
}

Reactive.prototype._bind = function () {
  var reactive = this
  var root = this.el
  util.walk(root, function (node, next, single) {
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
      if (single) {
        binding.interpolation(text)
      }
      binding.active(node)
    }
    if (binding) {
      reactive.on('remove', function () {
        binding.remove()
      })
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
  var delegate = this.delegate
  var fn = delegate[name]
  if (fn && typeof fn === 'function') return fn
  throw new Error('can\'t find delegate function for[' + name + ']')
}

Reactive.generateConfig = function (el, model, delegate, bindings) {
  if (typeof el === 'string') el = domify(el)
  var config = []
  delegate = delegate || {}
  bindings = bindings || {}
  var reactive =  Reactive(el, model, {delegate: delegate, bindings: bindings, nobind: true})
  util.iterate(el, function (node, indexes) {
    var binding
    var single = util.isSingle(node)
    if (node.nodeType === 3) {
      binding = new Binding(reactive, node)
      binding.interpolation(node.textContent)
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
      if (single) {
        binding.interpolation(text)
      }
    }
    if (binding && binding.bindings.length) {
      config.push({
        indexes: indexes,
        bindings: binding.bindings
      })
      binding.remove()
    }
  }, [])
  return config
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
