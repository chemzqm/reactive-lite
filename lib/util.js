var unique = require('array-unique')
var funcRe = /\([^\s]*\)$/

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

/**
 * Check if node has no element child
 *
 * @param {Element} node
 * @return {Boolean}
 * @api public
 */
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
 * Parse bindings from function, function calls ignored
 *
 * @param {Function} fn
 * @param {Boolean} includeThis
 * @return {Array}
 * @api private
 */
exports.parseBindings = function (fn, firstParam, includeThis) {
  var res = []
  var str = fn.toString()
  var arr
  if (firstParam) {
    var ms = str.match(/\(([A-Za-z0-9_$]+?)(?:[\s,)])/)
    var param = ms && ms.length ? ms[1] : null
    if (param) {
      var re = new RegExp('\\b' + param + '\\.([\\w_$]+)(?!\\s*\\()', 'g')
      while ((arr = re.exec(str)) !== null) {
        res.push(arr[1])
      }
    }
  }
  if (includeThis) {
    re = new RegExp('\\bthis\\.([\\w_$]+)(?!\\s*\\()', 'g')
    while ((arr = re.exec(str)) !== null) {
      res.push(arr[1])
    }
  }
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
  // function names
  var fns = []
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
      res = res + ' + fn(model.' + name + ') + "'
      // if nested, only bind the root property
      if (~name.indexOf('.')) name = name.replace(/\.[^\s]+$/,'')
      // function call
      if (funcRe.test(name)) {
        fns.push(name.replace(funcRe, ''))
      } else {
        bindings.push(name)
      }
      name = ''
    } else if (inside) {
      name = name + c
    } else {
      res = res + c
    }
  }
  res = res + '"'
  var fn = new Function('model', 'fn', ' return ' + res)
  return {
    bindings: unique(bindings),
    fns: unique(fns),
    fn: fn
  }
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
    bindings: unique(props),
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

/**
 * Avoid of null and undefined in output
 *
 * @param {String} html
 * @return {String}
 * @api public
 */
exports.toString = function (html) {
  if (html == null) return ''
  return String(html)
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

