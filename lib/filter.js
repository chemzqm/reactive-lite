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
 * 12345 => 12,345.00
 *
 * @param {Mixed} value
 * @param {Number} precision
 */

var digitsRE = /(\d)(?=(?:\d{3})+$)/g
exports.currency = function (value, precision) {
  value = parseFloat(value)
  if (!isFinite(value) || (!value && value !== 0)) return ''
  precision = precision == null ? 2 : precision
  value = Number(value)
  value = value.toFixed(precision)
  var parts = value.split('.'),
  fnum = parts[0],
  decimal = parts[1] ? '.' + parts[1] : ''

  return fnum.replace(digitsRE, '$1,') + decimal
}

/**
 * Simple alphabet string reverse,
 * Unicode normalization and combination not considered.
 *
 *
 * @param {string} str
 * @return {String}
 * @api public
 */
exports.reverse = function (str) {
  if (!str && str !== 0) return ''
  return String(str).split(/\s*/).reverse().join('')
}
