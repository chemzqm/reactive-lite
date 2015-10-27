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
    var fn = function () {
      var id = this.$uid
      var fullname = this.first + this.last
      id + fullname
      return this.first +this.last + this._id
    }
    var arr = util.parseBindings(fn)
    assert.deepEqual(arr, ['$uid', 'first', 'last', '_id'])
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

  it('should parse simple render config', function () {
    function es(s) { return s }
    var str = '{first} {second}'
    var config = util.parseRenderConfig(str)
    assert.deepEqual(config.bindings, ['first', 'second'])
    var model = {first: 'a', second: 1}
    assert.equal(config.fn(model, es), 'a 1')
  })

  it('should not escape interpolation with `!` prepend', function () {
    var str = '{first} {!second}'
    var config = util.parseRenderConfig(str)
    assert.deepEqual(config.bindings, ['first', 'second'])
    var model = {first: '<a>', second: '<b>'}
    var res = config.fn(model, util.es)
    assert.equal(res, '&lt;a&gt; <b>')
  })

  it('should check interpolation', function () {
    var s = '<span>{}</span>'
    assert(util.hasInterpolation(s))
  })
})
