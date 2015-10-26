var util = require('./util')
var domify = require('domify')
var binding = require('./binding')
var Emitter = require('emitter')

function Reactive(el, model, delegate, config) {
  if(!(this instanceof Reactive)) return new Reactive(el, model, delegate, config)
  delegate = delegate || {}
  if (typeof el === 'string') el = domify(el)
  this.model = model
  this.el = el
  if (!config) {
    this._bind(model, el, delegate)
  }
}

Emitter(Reactive.prototype)

Reactive.prototype.remove = function () {
  this.el.parentNode.removeChild(this.el)
  this.emit('remove')
  this.off()
}

Reactive.prototype._bind = function (model, root, delegate) {
  util.walk(root, function (el, next) {
    var els = util.toElementArray(el.childNodes)
    var attributes = el.attributes
    var func
    if (els.length === 0 && util.hasInterpolation(el.textContent)) {
      binding.bindHtml(this, el)
    }
    for (var i = 0, l = attributes.length; i < l; i++) {
      var name = attributes[i].name
      var val = attributes[i].value
      if (name === 'data-format') {
        func = util.getDelegateFn(val, model, delegate)
        binding.bindFormatter(this, func, el)
      } else if (name === 'data-render') {
        func = util.getDelegateFn(val, model, delegate)
        binding.bindRender(this, func, el)
      } else if (name === 'data-checked') {
        binding.bindOptionalAttribute(this, el, val, 'checked')
      } else if (name === 'data-selected') {
        binding.bindOptionalAttribute(this, el, val, 'selected')
      } else if (/^on-/.test(name)) {
        func = util.getDelegateFn(val, model, delegate)
        binding.bindEventListener(this, name.replace(/^on-/, ''), func, el)
      } else if (util.hasInterpolation(val)) {
        binding.bindAttribute(this, name, val, el)
      }
    }
    next()
  }.bind(this))
}

module.exports = Reactive
