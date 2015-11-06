/*global describe, it*/
var assert = require('assert')
var util = require('../lib/util')

describe('#util', function () {

  describe('.parseBindings', function () {

    it('should parse bindings', function () {
      var fn = function (m) {
        var id = m.$uid
        var fullname = m.first + m.last
        id + fullname
        return m.first + m.last + m._id
      }
      var arr = util.parseBindings(fn, true)
      assert.deepEqual(arr, ['$uid', 'first', 'last', '_id'])
    })

    it('should only parse this keyword', function () {
      var fn = function (m) {
        this.first + this._last + this.$middle
        m.sex
      }
      var arr = util.parseBindings(fn, false)
      assert.equal(arr.length, 3)
    })

    it('should not parse this keyword', function () {
      var fn = function (m) {
        this.first + this._last + this.$middle
        m.sex
      }
      var arr = util.parseBindings(fn, true)
      assert.deepEqual(arr, ['sex'])
    })

    it('should ignore methods', function () {
      var fn = function (m) {
        this.dosomething();this.go ();this.on('create')
        this.did  ('f');this.off();this.emit('remove')
        m.$see();m._fef();m.abc ()
      }
      var arr = util.parseBindings(fn)
      arr = arr.concat(util.parseBindings(fn, true))
      assert.equal(arr.length, 0)
    })

    it('should return empty array if not find bindings', function () {
      var fn = function () {}
      var arr = util.parseBindings(fn)
      assert.equal(arr.length, 0)
    })

    it('should not throw if first param not defined', function () {
      var fn = function () {}
      // var arr = [[true, false], [true, true], [false, false], [false, true]]
      var arr = [[true, true]]
      arr.forEach(function (args) {
        var res = util.parseBindings.apply(util, [fn].concat(args))
        assert.equal(res.length, 0)
      })
    })
  })

  describe('.parseFilters', function () {

    var bindings
    var fns
    beforeEach(function () {
      bindings = []
      fns = []
    })

    it('should throw if starts with `|`', function () {
      var err
      var s = '| first'
      try {
        util.parseFilters(s)
      } catch(e) {
        err = e
      }
      assert(!!err.message)
    })

    it('should parse single filter', function () {
      var s = 'first | json'
      var res = util.parseFilters(s, bindings, fns)
      assert.deepEqual(bindings, ['first'])
      assert.deepEqual(fns, [])
      assert.equal(res, 'filter.json(model.first)')
    })

    it('should not throw when filter empty', function () {
      var s = 'first || json|'
      var res = util.parseFilters(s, bindings, fns)
      assert.deepEqual(bindings, ['first'])
      assert.deepEqual(fns, [])
      assert.equal(res, 'filter.json(model.first)')
    })

    it('should allow filter chain', function () {
      var s = 'first | uppercase | reverse'
      var res = util.parseFilters(s, bindings, fns)
      assert.deepEqual(bindings, ['first'])
      assert.deepEqual(fns, [])
      assert.equal(res, 'filter.reverse(filter.uppercase(model.first))')
    })
  })

  describe('filter arguments', function () {
    var bindings
    var fns
    beforeEach(function () {
      bindings = []
      fns = []
    })

    it('should allow number', function () {
      var s = 'first | json 2'
      var res = util.parseFilters(s, bindings, fns)
      assert.equal(res, 'filter.json(model.first, 2)')
    })

    it('should allow float number', function () {
      var s = 'first | plus 3.5'
      var res = util.parseFilters(s, bindings, fns)
      assert.equal(res, 'filter.plus(model.first, 3.5)')
    })

    it('should allow string', function () {
      var s = 'first | currency "$"'
      var res = util.parseFilters(s, bindings, fns)
      assert.equal(res, 'filter.currency(model.first, "$")')
    })

    it('should allow string with spaces', function () {
      var s = 'first | replace "blue red"'
      var res = util.parseFilters(s, bindings, fns)
      assert.equal(res, 'filter.replace(model.first, "blue red")')
    })

    it('should allow single quote string', function () {
      var s = 'first | currency \'$\''
      var res = util.parseFilters(s, bindings, fns)
      assert.equal(res, 'filter.currency(model.first, \'$\')')
    })

    it('should allow boolean', function () {
      var s = 'first | currency true false'
      var res = util.parseFilters(s, bindings, fns)
      assert.equal(res, 'filter.currency(model.first, true, false)')
    })
  })

  describe('.parseFilterNames', function () {
    it('should be empty', function () {
      var fn = function () { }
      var res = util.parseFilterNames(fn)
      assert.deepEqual(res, [])
    })

    it('should contain filters ', function () {
      var fn = function () { filter.reverse(filter.uppercase('abc'))} // eslint-disable-line
      var res = util.parseFilterNames(fn)
      assert.deepEqual(res, ['reverse', 'uppercase'])
    })
  })

  describe('.parseStringBinding', function () {
    var bindings
    var fns
    beforeEach(function () {
      bindings = []
      fns = []
    })

    it('should trim nested properties', function () {
      var s = 'first.last'
      util.parseStringBinding(s, bindings, fns)
      assert.deepEqual(bindings, ['first'])
      assert.deepEqual(fns, [])
    })

    it('should parse single property', function () {
      var s = 'first'
      util.parseStringBinding(s, bindings, fns)
      assert.deepEqual(bindings, ['first'])
      assert.deepEqual(fns, [])
    })

    it('should parse function property', function () {
      var s = 'first()'
      util.parseStringBinding(s, bindings, fns)
      assert.deepEqual(bindings, [])
      assert.deepEqual(fns, ['first'])
    })

    it('should parse nested function property', function () {
      var s = 'first.last()'
      util.parseStringBinding(s, bindings, fns)
      assert.deepEqual(bindings, ['first'])
      assert.deepEqual(fns, [])
    })
  })

  describe('.parseInterpolationConfig', function () {

    it('should output empty when binding string empty', function () {
      var str = '{ }'
      var config = util.parseInterpolationConfig(str)
      assert.equal(config.bindings.length, 0)
      assert.equal(config.fns.length, 0)
      assert.equal(config.fn({}), '')
    })

    it('should parse simple string', function () {
      var str = '{first} {second}'
      var config = util.parseInterpolationConfig(str)
      assert.deepEqual(config.bindings, ['first', 'second'])
      var model = {first: 'a', second: 1}
      assert.equal(config.fn(model), 'a 1')
    })

    it('should parse string with function', function () {
      var str = '{fullname()}'
      var config = util.parseInterpolationConfig(str)
      assert.deepEqual(config.bindings, [])
      var model = { first: 'tobi', last: 'taxi', fullname: function() {
        return this.first + this.last
      }}
      var res = config.fn(model, {})
      assert.equal(res, 'tobitaxi')
    })

    it('should parse properties with _ $', function () {
      var str = '{_a} {$b}'
      var model = {_a: '1', $b: '2'}
      var config = util.parseInterpolationConfig(str)
      assert.deepEqual(config.bindings, ['_a', '$b'])
      var res = config.fn(model, {})
      assert.deepEqual(res, '1 2')
    })

    it('should parse fns', function () {
      var str = '{fullname()}'
      var config = util.parseInterpolationConfig(str)
      var fns = config.fns
      assert(fns.length === 1)
      assert.equal(fns[0], 'fullname')
    })

    it('should parse fns with args', function () {
      var str = '{fullname(\'x\')}'
      var config = util.parseInterpolationConfig(str)
      var fns = config.fns
      assert(fns.length === 1)
      assert.equal(fns[0], 'fullname')
      var model = {
        fullname: function (s) {
          return s
        }
      }
      var res = config.fn(model, {})
      assert.equal(res, 'x')
    })

    it('should parse multiply fns', function () {
      var str = '{fullname()} {showme()}'
      var config = util.parseInterpolationConfig(str)
      var fns = config.fns
      assert(fns.length === 2)
    })

    it('should parse nested properties', function () {
      var str = '{to.be.no.one}'
      var config = util.parseInterpolationConfig(str)
      var bindings = config.bindings
      assert(bindings.length === 1)
      assert(bindings[0] === 'to')
      var res = config.fn({to:{be:{no:{one:'fine'}}}}, {})
      assert.equal(res, 'fine')
    })

    it('should allow double quote', function () {
      var str = '"name" {first}'
      var config = util.parseInterpolationConfig(str)
      var bindings = config.bindings
      assert(bindings.length === 1)
      assert(bindings[0] === 'first')
      var res = config.fn({first: 'tobi'}, {})
      assert.equal(res, '"name" tobi')
    })

    it('should allow carrige return', function () {
      var str = ' \n{first}\n '
      var config = util.parseInterpolationConfig(str)
      var bindings = config.bindings
      assert(bindings.length === 1)
      assert(bindings[0] === 'first')
      var res = config.fn({first: 'tobi'}, {})
      assert.equal(res, ' \ntobi\n ')
    })
  })

  describe('.hasInterpolation', function () {
    it('should return true', function () {
      var s = '<span>{}</span>'
      assert(util.hasInterpolation(s))
    })

    it('should return false', function () {
      var s = '<span>{}</span>'
      s = s.replace(/\{/g, '')
      assert(util.hasInterpolation(s) === false)
    })
  })

})
