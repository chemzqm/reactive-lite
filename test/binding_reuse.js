/*global describe, it, beforeEach, afterEach*/
var assert = require('assert')
var emitter = require('emitter')
var Reactive = require('..')
var Binding = require('../lib/binding')

describe('#Binding resue', function () {
  var el
  var user
  var view
  beforeEach(function () {
    el = document.createElement('div')
    document.body.appendChild(el)
    user = { id: '22', first: 'sunny', last: 'sick', money: 23231, active: true}
    view = {
      renderName: function (model, el) {
        el.textContent = model.first + model.last
      },
      onclick : function () {
        this.clicked = true
      }
    }
  })

  afterEach(function () {
    document.body.removeChild(el)
    user = null
    el = null
  })

  function createReactive() {
    var model = {id: '11', first: 'tobi', last: 'john', money: 111999, active: false}
    emitter(model)
    var r = new Reactive(el, model, {delegate: view, config: []})
    return r
  }

  function otherReactive() {
    emitter(user)
    var node = el.cloneNode(true)
    var r = new Reactive(node, user, {delegate: view, config: []})
    return r
  }

  function check(binding, isChecked) {
    var html = el.innerHTML
    var bind = binding.bindings[0]
    var r = otherReactive()
    var element = isChecked ? r.el.firstChild : r.el
    binding = new Binding(r, element)
    binding.bindings.push(bind)
    binding.active(element)
    assert.equal(el.innerHTML, html)
    return r
  }

  it('should reuse interpolation', function () {
    el.innerHTML = '{first} {last}'
    var binding = new Binding(createReactive(), el)
    binding.interpolation(el.textContent)
    var r = check(binding)
    assert.equal(r.el.textContent, user.first + ' ' + user.last)
  })

  it('should reuse render', function () {
    var binding = new Binding(createReactive(), el)
    binding.add('data-render', 'renderName')
    var r = check(binding)
    assert.equal(r.el.textContent, user.first + user.last)
  })

  it('should reuse attr-interpolation', function () {
    var binding = new Binding(createReactive(), el)
    binding.add('data-href', 'http://{id}')
    var r = check(binding)
    var href = r.el.getAttribute('href')
    assert.equal(href, 'http://' + r.model.id)
    assert(el.getAttribute('href') == null)
  })

  it('should reuse event binding', function () {
    var reactive = createReactive()
    var fired
    reactive.delegate.onclick = user.onclick = function (e, model, el) {
      assert.equal(model, user)
      assert.equal(el, r.el)
      fired = true
    }
    var binding = new Binding(reactive, el)
    binding.add('on-click', 'onclick')
    var r = check(binding)
    r.el.click()
    assert.equal(fired, true)
  })

  it('should reuse data-checked', function () {
    var ck = document.createElement('input')
    ck.type = 'checkbox'
    ck.name = 'active'
    ck.setAttribute('data-checked', 'active')
    el.appendChild(ck)
    var binding = new Binding(createReactive(), ck)
    binding.add('data-checked', 'active')
    var r = check(binding, true)
    assert.equal(ck.checked, false)
    assert.equal(r.el.firstChild.checked, true)
  })
})
