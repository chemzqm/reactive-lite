var unique = require('array-unique')
var buildinRe = exports.buildinRe = /^(emit|on|off)$/

/**
 * walk through the root with every child nodes, call `done` if provided and finished
 *
 * @param {Element} el
 * @param {Function} process
 * @param {Function} done optional callback
 * @api public
 */
exports.walk = function walk(el, process, done) {
  var end = done || function(){};
  var single = isSingle(el)
  var next
  var nodes = toArray(el.childNodes);
  if (single) nodes = []
  next = function (stop){
    if (stop || nodes.length === 0) {
      return end();
    }
    walk(nodes.shift(), process, next);
  }

  process(el, next, single);
}

/**
 * Node list to array, for better performance
 *
 * @param {Collection} list Node collection
 * @return {Array}
 * @api public
 */
var toArray = exports.toArray = function (list) {
  var arr = new Array(list.length)
  for (var i = 0, l = arr.length; i < l; i++) {
    arr[i] = list[i]
  }
  return arr
}

var isSingle = exports.isSingle = function (node) {
  var list = node.childNodes
  var single = true
  for (var i = list.length - 1; i >= 0; i--) {
    var v = list[i]
    if (v.nodeType === 1) {
      single = false
      break
    }
  }
  return single
}

/**
 * Parse bindings from function
 *
 * @param {Function} fn
 * @param {Boolean} includeThis
 * @return {Array}
 * @api private
 */
exports.parseBindings = function (fn, includeThis) {
  var res = []
  var str = fn.toString()
  var arr
  var ms = str.match(/\(([A-Za-z0-9_$]+?)(?:[\s,)])/)
  var param = ms && ms.length ? ms[1] : null
  if (!param) return res
  if (includeThis) {
    str = str.replace(/\bthis\./g, param + '.')
  }
  var re = new RegExp('\\b' + param + '\\.([\\w_$]+)', 'g')
  while ((arr = re.exec(str)) !== null) {
    res.push(arr[1])
  }
  res = res.filter(function (str) {
    return !buildinRe.test(str)
  })
  // console.log(res)
  return unique(res)
}


/**
 * Parse str to get the bindings and render function
 * eg: {first} {last} => {
 *  bindings: ['first', 'last'],
 *  fn: function(model) { return model.first + '' + model.last}
 * }
 *
 * @param {string} str textContent
 * @return {object} bindings and render function
 * @api public
 */
exports.parseInterpolationConfig = function (str) {
  var bindings = []
  var res = '"'
  var inside = false
  var name = ''
  var es = true
  for (var i = 0; i < str.length; i++) {
    var c = str[i]
    if (c === '{') {
      inside = true
      res = res + '"'
      es = str[i + 1] === '!' ? false : true
    } else if (c === '}') {
      inside = false
      if (es) {
        res = res + ' + es(model.' + name + ') + "'
      } else {
        res = res + ' + model.' + name + ' + "'
      }
      // might be nested
      if (!/\(\)$/.test(name)) {
        bindings.push(name.replace(/\.[^\s]+$/,''))
      }
      name = ''
    } else if (inside) {
      if (c === '!') continue
      name = name + c
    } else {
      res = res + c
    }
  }
  res = res + '"'
  var fn = new Function('model', 'es', ' return ' + res)
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
  return !!~str.indexOf('{')
}

/**
 * Escape html string, for safety
 *
 * @param {String} html
 * @return {String}
 * @api public
 */
exports.es = function (html) {
  if (html == null) return ''
  return String(html)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
}

/**
 * Parse text to get function for format rendering
 *
 * @param {string} text textContext for format
 * @return {Object} config object
 * @api public
 */
exports.parseFormatConfig = function (text) {
  text = '"' + text + '"'
  var props = []
  text = text.replace(/\{([\w_$]+)\}/g, function (ms, p) {
    props.push(p)
    return '" + ' + 'fn(m.' + p +' == null ? "" : m.' + p + ')' + ' + "'
  })
  var fn = new Function('m', 'fn', 'return ' + text)
  return {
    bindings: props,
    fn: fn
  }
}
/**
 * Check if field on object is a function
 *
 * @param {Object} o
 * @param {attribute} field
 * @return {Boolean}
 * @api public
 */
exports.isFunction = function (o, field) {
  var v = o[field]
  if (!v) return false
  if (typeof v !== 'function') return false
  return true
}
