/**
 * Avoid of null and undefined in output
 *
 * @param {String} html
 * @return {String}
 * @api public
 */
exports.nonull = function (str) {
  if (str == null) return ''
  return String(str)
}

/**
 * Stringify value.
 *
 * @param {Number} indent
 */

exports.json = function (value, indent) {
  return typeof value === 'string'
      ? value
      : JSON.stringify(value, null, Number(indent) || 2)
}

/**
 * 'abc' => 'Abc'
 */

exports.capitalize = function (value) {
  if (!value && value !== 0) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * 'abc' => 'ABC'
 */

exports.uppercase = function (value) {
  return (value || value === 0)
    ? value.toString().toUpperCase()
    : ''
}

/**
 * 'AbC' => 'abc'
 */

exports.lowercase = function (value) {
  return (value || value === 0)
    ? value.toString().toLowerCase()
    : ''
}

/**
 * 12345 => $12,345.00
 *
 * @param {String} sign
 */

var digitsRE = /(\d{3})(?=\d)/g
exports.currency = function (value, decimal) {
  value = parseFloat(value)
  if (!isFinite(value) || (!value && value !== 0)) return ''
  var stringified = Math.abs(value).toFixed(2)
  var _int = stringified.slice(0, -3)
  var i = _int.length % 3
  var head = i > 0
    ? (_int.slice(0, i) + (_int.length > 3 ? ',' : ''))
    : ''
  var _float = decimal ? stringified.slice(-3) : ''
  var sign = value < 0 ? '-' : ''
  return sign + head +
    _int.slice(i).replace(digitsRE, '$1,') +
    _float
}

/**
 * Reverse string
 *
 * @param {string} str
 * @return {String}
 * @api public
 */
exports.reverse = function (str) {
  if (!str && str !== 0) return ''
  return String(str).split(/\s*/).reverse().join('')
}
