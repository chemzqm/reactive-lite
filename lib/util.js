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

/**
 * Node list to array, for better performance
 *
 * @param {Collection} list Node collection
 * @return {Array}
 * @api public
 */
exports.toArray = function (list) {
  var arr = new Array(list.length)
  for (var i = 0, l = arr.length; i < l; i++) {
    arr[i] = list[i]
  }
  return arr
}

/**
 * Parse bindings from function
 *
 * @param {Function} fn
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
exports.parseRenderConfig = function (str) {
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
      bindings.push(name.replace(/\.[^\s]+$/,''))
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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
}
