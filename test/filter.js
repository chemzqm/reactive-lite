/*global describe, it*/
var assert = require('assert')
var filter = require('../lib/filter')

describe('#filter', function () {

  describe('nonull', function () {
    it('shoud not change str', function () {
      var s = 'tobi nomber one'
      var res = filter.nonull(s)
      assert.equal(s, res)
    })

    it('should be empty string', function () {
      var s = null
      var res = filter.nonull(s)
      assert.equal(res, '')
    })
  })

  describe('json', function () {
    it('should origin string', function () {
      var s = 'tobi nomber one'
      var res = filter.json(s)
      assert.equal(res, s)
    })

    it('should json format', function () {
      var o = {a: 1, b: 2}
      var res = filter.json(o)
      assert.equal(res, JSON.stringify(o, null, 2))
    })
  })

  describe('capitalize', function () {
    it('should be empty string', function () {
      assert.equal(filter.capitalize(undefined), '')
      assert.equal(filter.capitalize(null), '')
      assert.equal(filter.capitalize(''), '')
    })

    it('should be capitalize', function () {
      assert.equal(filter.capitalize(0), '0')
      assert.equal(filter.capitalize('abc'), 'Abc')
      assert.equal(filter.capitalize('x'), 'X')
    })
  })

  describe('uppercase', function () {
    it('should be empty string', function () {
      assert.equal(filter.uppercase(undefined), '')
      assert.equal(filter.uppercase(null), '')
      assert.equal(filter.uppercase(''), '')
    })

    it('should be uppercase', function () {
      assert.equal(filter.uppercase(0), '0')
      assert.equal(filter.uppercase('abc'), 'ABC')
      assert.equal(filter.uppercase('x'), 'X')
    })
  })

  describe('lowercase', function () {
    it('should be empty string', function () {
      assert.equal(filter.lowercase(undefined), '')
      assert.equal(filter.lowercase(null), '')
      assert.equal(filter.lowercase(''), '')
    })

    it('should be lowercase', function () {
      assert.equal(filter.lowercase(0), '0')
      assert.equal(filter.lowercase('abc'), 'abc')
      assert.equal(filter.lowercase('X'), 'x')
    })
  })

  describe('currency', function () {
    it('should be empty string', function () {
      assert.equal(filter.currency(undefined), '')
      assert.equal(filter.currency(null), '')
      assert.equal(filter.currency(''), '')
    })

    it('should be currency without decimal', function () {
      assert.equal(filter.currency(0), '0')
      assert.equal(filter.currency('0'), '0')
      assert.equal(filter.currency('123'), '123')
      assert.equal(filter.currency('1245'), '1,245')
      assert.equal(filter.currency('-1245'), '-1,245')
      assert.equal(filter.currency('12222.345'), '12,222')
    })

    it('should be currency with decimal', function () {
      assert.equal(filter.currency('0', true), '0.00')
      assert.equal(filter.currency('123', true), '123.00')
      assert.equal(filter.currency('-1245', true), '-1,245.00')
      assert.equal(filter.currency('12222.345', true), '12,222.34')
    })
  })

  describe('reverse', function () {
    it('should be empty string', function () {
      assert.equal(filter.reverse(undefined), '')
      assert.equal(filter.reverse(null), '')
      assert.equal(filter.reverse(''), '')
    })

    it('should be reversed', function () {
      assert.equal(filter.reverse(0), '0')
      assert.equal(filter.reverse('abc'), 'cba')
      assert.equal(filter.reverse('x'), 'x')
    })
  })
})
