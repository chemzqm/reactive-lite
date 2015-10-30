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
  var end = done || function(){}
  var single = isSingle(el)
  var next
  var nodes = toArray(el.childNodes)
  if (single) nodes = []
  next = function (stop){
    if (stop || nodes.length === 0) {
      return end()
    }
    walk(nodes.shift(), process, next)
  }

  process(el, next, single)
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
 * @param {Boolean} firstParam or this
 * @return {Array}
 * @api private
 */
exports.parseBindings = function (fn, firstParam) {
  var res = []
  var str = fn.toString()
  var arr
  var param
  if (firstParam) {
    var ms = str.match(/\(([A-Za-z0-9_$]+?)(?:[\s,)])/)
    param = ms ? ms[1] : null
  } else {
    param = 'this'
  }
  var re = new RegExp('\\b' + param + '\\.([\\w_$]+)\\b(?!([\\w$_]|\\s*\\())', 'g')
  while ((arr = re.exec(str)) !== null) {
    res.push(arr[1])
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
      res = res + ' + '
      name = name.trim()
      if (!name) {
        res = res + '""'
      } else if (/\|/.test(name)) {
        res = res + parseFilters(name, bindings, fns)
      } else {
        res = res + 'model.' + name
        parseStringBinding(name, bindings, fns)
      }
      res = res + '+ "'
      name = ''
    } else if (inside) {
      name = name + c
    } else {
      res = res + c
    }
  }
  res = res + '"'
  var fn = new Function('model', 'filter', ' return ' + res)
  return {
    bindings: unique(bindings),
    fns: unique(fns),
    fn: fn
  }
}

/**
 * Parse filters in string, concat them into js function
 * If there is function call, push the function name into fns eg:
 * 'first | json' => 'filter.json(model.first)'
 * 'first | nonull | json' => 'filter.json(filter.nonull(model.first))'
 *
 * @param {String} str
 * @param {Array} fns
 * @return {String}
 * @api public
 */
var parseFilters = exports.parseFilters = function (str, bindings, fns) {
  var res = ''
  if (str[0] === '|') throw new Error('Interpolation can\'t starts with `|` [' + str + ']')
  var arr = str.split(/\s*\|\s*/)
  var name = arr[0]
  res = 'model.' + name
  parseStringBinding(name, bindings, fns)
  for (var i = 1; i < arr.length; i++) {
    var f = arr[i].trim()
    if (f) {
      var parts = f.match(/^([\w$_]+)(.*)$/)
      var args
      if (parts[2]) {
        args = parseArgs(parts[2].trim())
        res = 'filter.' + parts[1] + '(' + res + ', ' + args.join(', ') + ')'
      } else {
        res = 'filter.' + f + '(' + res + ')'
      }
    }
  }
  return res
}

/**
 * Parse string binding into bindings or fns
 * eg: 'first' => bindings.push('first')
 *     'first.last' => bindings.push('first')
 *     'name.first()' => bindings.push('name')
 *     'first()' => fns.push('first')
 *
 * @param {String} str
 * @api public
 */
var parseStringBinding = exports.parseStringBinding = function (str, bindings, fns) {
  // if nested, only bind the root property
  if (~str.indexOf('.')) str = str.replace(/\.[^\s]+$/,'')
  if (funcRe.test(str)) {
    fns.push(str.replace(funcRe, ''))
  } else {
    bindings.push(str)
  }
}

/**
 * Parse the filter function name from function string
 * Used for check
 *
 * @param {Function} fn
 * @return {Array}
 * @api public
 */
var filterCallRe = /\bfilter\.([^\s(]+?)\b/g
exports.parseFilterNames = function (fn) {
  var res = []
  var str = fn.toString()
  var arr
  while ((arr = filterCallRe.exec(str)) !== null) {
    res.push(arr[1])
  }
  return unique(res)
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
 * Iterate element with process function and pass generated indexes
 *
 * @param {Element} el
 * @param {Function} process
 * @param {Array} indexes
 * @api public
 */
var iterate = exports.iterate = function (el, process, indexes) {
  var single = isSingle(el)
  process(el, indexes)
  if (single) return
  for (var i = 0, l = el.childNodes.length; i < l; i++) {
    var node = el.childNodes[i]
    iterate(node, process, indexes.slice().concat([i]))
  }
}

/**
 * Find element with indexes array and root element
 *
 * @param {Element} root
 * @param {Array} indexes
 * @api public
 */
exports.findElement = function (root, indexes) {
  var res = root
  for (var i = 0; i < indexes.length; i++) {
    var index = indexes[i]
    res = res.childNodes[index]
    if (!res) return
  }
  return res
}

/**
 * Parse arguments from string eg:
 * 'a' false 3 => ['a', false, 3]
 *
 * @param {String} str
 * @return {Array}
 * @api public
 */
var parseArgs = exports.parseArgs = function(str) {
  var strings = []
  var s = str.replace(/(['"]).+?\1/g, function (str) {
    strings.push(str)
    return '$'
  })
  var arr = s.split(/\s+/)
  for (var i = 0, l = arr.length; i < l; i++) {
    var v= arr[i]
    if (v === '$') {
      arr[i] = strings.shift()
    }else {
      if (!/^(true|false|-?\d+(\.\d+)?)$/.test(v)) {
        throw new Error('Argument [' +arr[i]+ '] is not supported by filter')
      }
    }
  }
  return arr
}

/**
 * Copy properties from `from` to `to` and return `to`
 *
 * @param {Object} to
 * @param {Object} from
 * @return {Object}
 * @api public
 */
exports.assign = function (to, from) {
  Object.keys(from).forEach(function (k) {
    to[k] = from[k]
  })
  return to
}
