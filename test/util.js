/*global describe, it*/
var assert = require('assert')
var util = require('../lib/util')

describe('#util', function () {

  it('should parse array', function () {
    function test() {
      var arr = util.toArray(arguments)
      assert(Array.isArray(arr))
      assert(arr.length === arguments.length)
      for (var i = arguments.length - 1; i >= 0; i--) {
        assert.equal(arr[i], arguments[i])
      }
    }
    test(1, 2, 3)
    test(1, 2)
    test(1)
  })

  it('should parse bindings', function () {
    var fn = function (m) {
      var id = m.$uid
      var fullname = m.first + m.last
      id + fullname
      return m.first + m.last + m._id
    }
    var arr = util.parseBindings(fn)
    assert.deepEqual(arr, ['$uid', 'first', 'last', '_id'])
  })

  it('should parse bindings with this', function () {
    var fn = function (m) {
      this.first + this._last + this.$middle
      m.sex
    }
    var arr = util.parseBindings(fn, this)
    assert.deepEqual(arr, ['first', '_last', '$middle', 'sex'])
  })

  it('should parse bindings without this', function () {
    var fn = function (m) {
      this.first + this._last + this.$middle
      m.sex
    }
    var arr = util.parseBindings(fn, false)
    assert.deepEqual(arr, ['sex'])
  })

  it('should ignore buildin method when parse bindings', function () {
    var fn = function () {
      this.on('create')
      this.off()
      this.emit('remove')
    }
    var arr = util.parseBindings(fn)
    assert.equal(arr.length, 0)
  })

  it('should return empty array if not find bindings', function () {
    var fn = function () {}
    var arr = util.parseBindings(fn)
    assert.equal(arr.length, 0)
  })

  it('should parse simple render config', function () {
    function es(s) { return s }
    var str = '{first} {second}'
    var config = util.parseInterpolationConfig(str)
    assert.deepEqual(config.bindings, ['first', 'second'])
    var model = {first: 'a', second: 1}
    assert.equal(config.fn(model, es), 'a 1')
  })

  it('should not escape interpolation with `!` prepend', function () {
    var str = '{first} {!second}'
    var config = util.parseInterpolationConfig(str)
    assert.deepEqual(config.bindings, ['first', 'second'])
    var model = {first: '<a>', second: '<b>'}
    var res = config.fn(model, util.es)
    assert.equal(res, '&lt;a&gt; <b>')
  })

  it('should parse interpolation with function', function () {
    var str = '{fullname()}'
    var config = util.parseInterpolationConfig(str)
    assert.deepEqual(config.bindings, [])
    var model = { first: 'tobi', last: 'taxi', fullname: function() {
      return this.first + this.last
    }}
    var res = config.fn(model, util.es)
    assert.equal(res, 'tobitaxi')
  })

  it('should parse properties with _ $', function () {
    var str = '{_a} {$b}'
    var model = {_a: '1', $b: '2'}
    var config = util.parseInterpolationConfig(str)
    assert.deepEqual(config.bindings, ['_a', '$b'])
    var res = config.fn(model, util.es)
    assert.deepEqual(res, '1 2')
  })

  it('should check interpolation', function () {
    var s = '<span>{}</span>'
    assert(util.hasInterpolation(s))
    s = s.replace(/\{/g, '')
    assert(util.hasInterpolation(s) === false)
  })

  it('should parse the binding attribute', function () {
    var config = util.parseFormatConfig(' {first} middle {last} ')
    var f = function (word) { return word.split(/\s*/).reverse().join('') }
    var str = config.fn({first: 'abc', last: 'def'}, f)
    assert.deepEqual(config.bindings, ['first', 'last'])
    assert.equal(str, ' cba middle fed ')
  })

  it('should walk through all the node', function () {
    var i = 0
    function create() {
      i = i + 1
      var node = document.createElement('div')
      var l = Math.floor(Math.random()*6)
      for (var j = 0; j < l; j++) {
        if (i === 50) break;
        node.appendChild(create())
      }
      return node
    }
    var root = create()
    var count = 0
    util.walk(root, function (el, next) {
      i--
      next()
    }, function () {
      count++
    })
    assert(i === 0)
    assert(count === 1)
  })

  it('should not walk through the only text node', function () {
    var el = document.createElement('div')
    el.textContent = ' {first} '
    var count = 0
    util.walk(el, function (node, next, single) {
      count = count + 1
      assert(single === true)
      assert(el === node)
      next()
    })
    assert.equal(count, 1)
  })

  it('should walk through text node if other element exist', function () {
    var el = document.createElement('div')
    el.textContent = ' {first} '
    el.appendChild(document.createElement('div'))
    var count = 0
    util.walk(el, function (node, next, single) {
      count = count + 1
      if (node === el) {
        assert(single === false)
      }
      next()
    })
    assert.equal(count, 3)
  })

  it('should check the function exist or not', function () {
    var o = { format: function () { } }
    assert(util.isFunction(o, 'format'))
    o.format = 'abc'
    assert.equal(util.isFunction(o, 'format'), false)
    o = {}
    assert.equal(util.isFunction(o, 'format'), false)
  })
})
