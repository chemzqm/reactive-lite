var tap = require('tap-event')
var util = require('./util.js')
var events = require('event')

var event_list = [
  'change',
  'tap',
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

function bind(reactive, model, binding, fn) {
  model.on('change ' + binding, fn)
  reactive.on('remove', function () {
    model.off('change ' + binding, fn)
  })
}

exports.bindFormatter = function (reactive, fn, el) {
  var model = reactive.model
  var bindings = util.parseBindings(fn)
  var render = function () {
    el.innerHTML = fn.call(model)
  }
  bindings.forEach(function (binding) {
    bind(reactive, model, binding, render)
  })
  render()
}

exports.bindRender = function (reactive, fn, el) {
  var model = reactive.model
  var bindings = util.parseBindings(fn)
  var render = function () {
    fn.call(model, el)
  }
  bindings.forEach(function (binding) {
    bind(reactive, model, binding, render)
  })
  render()
}

exports.bindHtml = function (reactive, el) {
  var model = reactive.model
  var config = util.parseRenderConfig(el.textContent)
  var bindings = config.bindings
  var fn = function () {
    el.innerHTML = config.fn(model)
  }
  bindings.forEach(function (binding) {
    bind(reactive, model, binding, fn)
  })
  fn()
}

exports.bindAttribute = function (reactive, name, val, el) {
  var model = reactive.model
  var attr = name.replace(/^data-/, '')
  var config = util.parseRenderConfig(val)
  var bindings = config.bindings
  var fn = function () {
    var str = config.fn(model)
    el.setAttribute(attr, str)
  }
  bindings.forEach(function (binding) {
    bind(reactive, model, binding, fn)
  })
  fn()
}

exports.bindEventListener = function (reactive, name, fn, el) {
  if (!~event_list.indexOf(name)) throw new Error('reactive could not recognize event [' + name + ']')
  var model = reactive.model
  var handler
  if (name === 'tap') {
    name = 'touchstart'
    handler = tap(fn.bind(model))
    events.bind(el, name, handler)
  } else {
    handler = fn.bind(model)
    console.log(name)
    events.bind(el, name, handler)
  }
  reactive.on('remove', function () {
    events.unbind(el, name, handler)
  })
}

exports.bindOptionalAttribute = function (reactive, el, val, attribute) {
  var model = reactive.model
  var attr = val || el.getAttribute('name')
  if (typeof model[attr] === 'undefined') throw 'can\'t find [' + attr + '] on model'
  var isArray = Array.isArray(model[attr])
  var fn = function () {
    var value = el.getAttribute('value')
    if (value == null && model[attr] === true) {
      el.setAttribute(attribute, '')
    } else if (value != null&& isArray && ~model[attr].indexOf(value)) {
      el.setAttribute(attribute, '')
    } else if (value != null && model[attr] === value.toString()) {
      el.setAttribute(attribute, '')
    } else {
      el.removeAttribute(attribute)
    }
  }
  bind(reactive, model, attr, fn)
  fn()
}
