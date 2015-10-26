var unique = require('array-unique')
var buildinRe = exports.buildinRe = /^(emit|on|off)$/

exports.walk = function walk(el, process, done) {
  var end = done || function(){};
  var nodes = toElementArray(el.childNodes);

  function next(stop){
    if (stop || nodes.length === 0) {
      return end();
    }
    walk(nodes.shift(), process, next);
  }

  process(el, next);
}

var toElementArray = exports.toElementArray = function (list) {
  var arr = []
  var el
  for (var i = 0, l = list.length; i < l; i++) {
    el = list[i]
    if (el.nodeType === 1) {
      arr.push(el)
    }
  }
  return arr
}

exports.toArray = function (list) {
  var arr = new Array(list.length)
  for (var i = 0, l = arr.length; i < l; i++) {
    arr.push(list[i])
  }
  return arr
}

/**
 * Parse bindings from function
 *
 * @param {function} fn
 * @return {Array}
 * @api private
 */
exports.parseBindings = function (fn) {
  var res = []
  var str = fn.toString()
  var arr
  var re = new RegExp('\\bthis\\.([\\w_$]+)', 'g')
  while ((arr = re.exec(str)) !== null) {
    res.push(arr[1])
  }
  res = res.filter(function (str) {
    return !buildinRe.test(str)
  })
  return unique(res)
}

/**
 * Get delegate function
 *
 * @param {String} name
 * @param {Object} model
 * @param {Object} delegate
 * @return {function}
 * @api public
 */
exports.getDelegateFn = function (name, model, delegate) {
  var fn = model[name]
  if (fn && typeof fn === 'function') return fn
  fn = delegate[name]
  if (fn && typeof fn === 'function') return fn
  throw new Error('can\'t find delegate function for[' + name + ']')
}

exports.parseRenderConfig = function (str) {
  var bindings = []
  var res = '"'
  var inside = false
  var name = ''
  for (var i = 0; i < str.length; i++) {
    var c = str[i]
    if (c === '{') {
      inside = true
      res = res + '"'
    } else if (c === '}') {
      inside = false
      res = res + ' + model.' + name + ' + "'
      // might be nested
      bindings.push(name.replace(/\.[^\s]+$/,''))
      name = ''
    } else if (inside) {
      name = name + c
    } else {
      res = res + c
    }
  }
  res = res + '"'
  var fn = new Function('model', 'return ' + res);
  return {
    bindings: bindings,
    fn: fn
  }
}

/**
 * Check if `str` has interpolation.
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

exports.hasInterpolation = function(str) {
  return ~str.indexOf('{')
}
