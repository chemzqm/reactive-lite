/*global describe, it*/
var assert = require('assert')
var util = require('../lib/util')

describe('#util', function () {

  describe('.toArray', function () {
    it('should generate array', function () {
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
  })

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

    it('should parse this keyword', function () {
      var fn = function (m) {
        this.first + this._last + this.$middle
        m.sex
      }
      var arr = util.parseBindings(fn, true, true)
      assert.equal(arr.length, 4)
    })

    it('should only parse this keyword', function () {
      var fn = function (m) {
        this.first + this._last + this.$middle
        m.sex
      }
      var arr = util.parseBindings(fn, false, true)
      assert.equal(arr.length, 3)
    })

    it('should not parse this keyword', function () {
      var fn = function (m) {
        this.first + this._last + this.$middle
        m.sex
      }
      var arr = util.parseBindings(fn, true, false)
      assert.deepEqual(arr, ['sex'])
    })

    it('should ignore methods', function () {
      var fn = function () {
        this.dosomething();this.go ();this.on('create')
        this.did  ('f');this.off();this.emit('remove')
      }
      var arr = util.parseBindings(fn)
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

  describe('.parseInterpolationConfig', function () {

    it('should parse simple string', function () {
      function es(s) { return s }
      var str = '{first} {second}'
      var config = util.parseInterpolationConfig(str)
      assert.deepEqual(config.bindings, ['first', 'second'])
      var model = {first: 'a', second: 1}
      assert.equal(config.fn(model, es), 'a 1')
    })

    it('should parse string with function', function () {
      var str = '{fullname()}'
      var config = util.parseInterpolationConfig(str)
      assert.deepEqual(config.bindings, [])
      var model = { first: 'tobi', last: 'taxi', fullname: function() {
        return this.first + this.last
      }}
      var res = config.fn(model, util.toString)
      assert.equal(res, 'tobitaxi')
    })

    it('should parse properties with _ $', function () {
      var str = '{_a} {$b}'
      var model = {_a: '1', $b: '2'}
      var config = util.parseInterpolationConfig(str)
      assert.deepEqual(config.bindings, ['_a', '$b'])
      var res = config.fn(model, util.toString)
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
      var res = config.fn(model, util.toString)
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
      var res = config.fn({to:{be:{no:{one:'fine'}}}}, util.toString)
      assert.equal(res, 'fine')
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

  describe('.parseFormatConfig', function () {
    it('should works with no binding', function () {
      var config = util.parseFormatConfig(' middle ')
      assert.deepEqual(config.bindings, [])
      var f = function (s) { return s}
      var str = config.fn({}, f)
      assert.equal(str, ' middle ')
    })

    it('should parse simple string', function () {
      var config = util.parseFormatConfig(' {first} middle {last}')
      assert.deepEqual(config.bindings, ['first', 'last'])
      var f = function (word) { return word.split(/\s*/).reverse().join('') }
      var str = config.fn({first: 'abc', last: 'def'}, f)
      assert.equal(str, ' cba middle fed')
    })

    it('shou ouput empty string with null property', function () {
      var config = util.parseFormatConfig(' {first} middle {last} ')
      assert.deepEqual(config.bindings, ['first', 'last'])
      var f = function (word) { return word.split(/\s*/).reverse().join('') }
      var str = config.fn({}, f)
      assert.equal(str, '  middle  ')
    })
  })

  describe('.walk', function () {
    it('should process all the node', function () {
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

    it('should not process the only text node', function () {
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

    it('should process text node if sibling element exist', function () {
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
  })

  describe('.isFunction', function () {
    it('should true', function () {
      var o = { format: function () { } }
      assert(util.isFunction(o, 'format'))
    })

    it('should false', function () {
      var o = { format: 'a' }
      assert(util.isFunction(o, 'format') === false)
      delete o.format
      assert(util.isFunction(o, 'format') === false)
    })
  })

})
