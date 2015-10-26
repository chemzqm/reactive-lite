/*global describe, it, beforeEach, afterEach*/
var assert = require('assert')
var radio = require('..')

describe('radio component', function () {
  var el
  var ul
  var firstEl
  beforeEach(function () {
    ul = document.createElement('ul')
    document.body.appendChild(ul)
    var li
    for (var i = 0; i < 5; i++) {
      li = document.createElement('li')
      ul.appendChild(li)
    }
    el = li
    firstEl = ul.firstChild
  })

  afterEach(function (done) {
    document.body.removeChild(ul)
    el = null
    setTimeout(done, 200)
  })

  it('should radio default className', function () {
    firstEl.className = 'active'
    radio(el)
    assert.equal(el.className, 'active')
    assert.equal(firstEl.className, '')
  })

  it('should radio user defined className', function () {
    firstEl.className = 'custom'
    radio(el, 'custom')
    assert.equal(el.className, 'custom')
    assert.equal(firstEl.className, '')
  })
})
