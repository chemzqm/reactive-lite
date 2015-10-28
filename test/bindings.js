/*global describe, it, beforeEach, afterEach*/
var assert = require('assert')
var emitter = require('emitter')
var Reactive = require('..')

describe('#bindings', function () {

  var el
  var model
  beforeEach(function () {
    el = document.createElement('div')
    model = {
      first: 'tobi',
      last: 'texi',
      money: 333,
      age: 22,
      formatMoney: function (money) {
        return '$' + money
      }
    }
    emitter(model)
    document.body.appendChild(el)
  })

  afterEach(function () {
    model = null
  })

  function appendCheckBox(value) {
    var input = document.createElement('input')
    input.type = 'checkbox'
    input.name = 'active'
    if (value) {
      input.value = value
    }
    el.appendChild(input)
    return input
  }

  it('should works with data-format', function () {
    el.setAttribute('data-format', 'formatMoney')
    el.textContent = 'like {money}'
    var reactive = Reactive(el, model)
    assert.equal(el.textContent, 'like $' + model.money)
    model.money = 456
    model.emit('change money')
    assert.equal(el.textContent, 'like $' + model.money)
    reactive.remove()
    model.money = 777
    model.emit('change money')
    assert(el.textContent !== 'like $' + model.money)
  })

  it('should set window context to data-format', function () {
    el.setAttribute('data-format', 'formatMoney')
    el.textContent = '{money}'
    var fired
    model.formatMoney = function (money) {
      fired = true
      assert(this === window)
      return '$' + money
    }
    var r = new Reactive(el, model)
    assert(fired === true)
    r.remove()
  })

  it('should works with data-render', function () {
    el.setAttribute('data-render', 'render')
    var reactive = new Reactive(el, model, {
      delegate: {
        render: function (model, el) {
          el.textContent = model.first + model.last
        }
      }
    })
    assert.equal(el.textContent, model.first + model.last)
    model.first = 'texi'
    model.emit('change first')
    assert.equal(el.textContent, model.first + model.last)
    model.last = 'tobi'
    model.emit('change last')
    assert.equal(el.textContent, model.first + model.last)
    reactive.remove()
    model.first = 'bbb'
    model.emit('change first')
    assert(el.textContent !== model.first + model.last)
  })

  it('should set context with model when data-render function on model', function () {
    el.setAttribute('data-render', 'render')
    model.render = function (m, node) {
      assert(this === model)
      assert(m === model)
      assert(el === node)
      node.textContent = m.first + m.last
    }
    var reactive = new Reactive(el, model)
    assert.equal(el.textContent, model.first + model.last)
    reactive.remove()
  })

  it('should works with buildin attrs', function () {
    el.setAttribute('data-id', 'uid-{id}')
    var model = {id: 233}
    emitter(model)
    var reactive = new Reactive(el, model)
    assert.equal(el.getAttribute('id'), 'uid-' + model.id)
    model.id = 345
    model.emit('change id')
    assert.equal(el.getAttribute('id'), 'uid-' + model.id)
    reactive.remove()
    model.id = 444
    model.emit('change id')
    assert(el.getAttribute('id') !== 'uid-' + model.id)
  })

  it('should works with events', function () {
    el.setAttribute('on-click', 'onClick')
    model.onClick = function () {
      this.age++
      this.emit('change age')
    }
    var reactive = new Reactive(el, model)
    var age = model.age
    el.click()
    assert.equal(model.age, age + 1)
    el.click()
    assert.equal(model.age, age + 2)
    reactive.remove()
    el.click()
    assert.equal(model.age, age + 2)
  })

  it('should works with single checkbox', function () {
    var input = appendCheckBox()
    input.setAttribute('data-checked', 'actived')
    var reactive = new Reactive(el, model)
    assert.equal(input.checked, false)
    model.actived = true
    model.emit('change actived')
    assert.equal(input.checked, true)
    reactive.remove()
    model.actived = false
    model.emit('change actived')
    assert.equal(input.checked, true)
  })

  it('should works with single checkbox with empty data-checked', function () {
    var input = appendCheckBox()
    input.setAttribute('data-checked', '')
    var reactive = new Reactive(el, model)
    assert.equal(input.checked, false)
    model.active = true
    model.emit('change active')
    assert.equal(input.checked, true)
    reactive.remove()
    model.active = false
    model.emit('change active')
    assert.equal(input.checked, true)
  })


  it('should works checkboxes with data-checked', function () {
    var pig = appendCheckBox('pig')
    pig.setAttribute('data-checked', 'pets')
    var dog = appendCheckBox('dog')
    dog.setAttribute('data-checked', 'pets')
    var bird = appendCheckBox('bird')
    bird.setAttribute('data-checked', 'pets')
    var reactive = new Reactive(el, model)
    assert(pig.checked || dog.checked || bird.checked === false)
    model.pets = ['pig', 'dog']
    model.emit('change pets')
    assert(pig.checked)
    assert(dog.checked)
    reactive.remove()
    model.pets = []
    model.emit('change pets')
    assert(pig.checked)
    assert(dog.checked)
  })

  it('should works with data-selected on options', function () {
    var select = document.createElement('select')
    el.appendChild(select)
    function createOption(value) {
      var option = document.createElement('option')
      option.name = 'country'
      option.value = value
      option.setAttribute('data-selected', 'country')
      select.appendChild(option)
      return option
    }
    createOption('')
    var options = {}
    var countries = ['china', 'india', 'america', 'canda']
    countries.forEach(function (name) {
      options[name] = createOption(name)
    })

    var reactive = new Reactive(el, model)
    countries.forEach(function (name) {
      var option = options[name]
      assert.equal(option.selected, false)
    })
    model.country = 'china'
    model.emit('change country')
    assert.equal(options['china'].selected, true)
    reactive.remove()
    model.country = 'india'
    model.emit('change country')
    assert.equal(options['china'].selected, true)
  })
})
