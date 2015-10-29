/*global describe, it, beforeEach, afterEach*/
var assert = require('assert')
var emitter = require('emitter')
var Reactive = require('..')
// var simulateTouch = require('simulate-touch')

function fire (element, event) {
  var e = new UIEvent(event, {
      bubbles: true,
      cancelable: false,
      detail: 1
  })
  e.touches = [{pageX: 0, pageY: 0}]
  element.dispatchEvent(e);
}

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

  describe('data-format', function () {

    it('should reactive', function () {
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

    it('should set window context', function () {
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

    it('should render empty string with null values', function () {
      el.setAttribute('data-format', 'formatMoney')
      el.textContent = '{money} {count}'
      model.money = null
      model.formatMoney = function (money) {
        return '$' + money
      }
      var r = new Reactive(el, model)
      assert.equal(el.textContent, '$ $')
      r.remove()
    })
  })

  describe('data-render', function () {

    it('should reactive', function () {
      el.setAttribute('data-render', 'render')
      var reactive = new Reactive(el, model, {
        delegate: {
          render: function (model, el) {
            el.innerHTML = model.first + model.last
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
    })

    it('should set correct context for model', function () {
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

    it('should set correct context for delegate', function () {
      el.setAttribute('data-render', 'render')
      var view = {}
      view.render = function (m, node) {
        assert(this === view)
        assert(m === model)
        assert(el === node)
        node.textContent = m.first + m.last
      }
      var reactive = new Reactive(el, model, {
        delegate: view
      })
      assert.equal(el.textContent, model.first + model.last)
      reactive.remove()
    })
  })

  describe('data-* attributes', function () {

    it('should reactive', function () {
      el.setAttribute('data-id', 'uid-{id}')
      var model = {id: '233'}
      emitter(model)
      Reactive(el, model)
      assert.equal(el.getAttribute('id'), 'uid-' + model.id)
      model.id = '345'
      model.emit('change id')
      assert.equal(el.getAttribute('id'), 'uid-' + model.id)
    })

    it('should not escape', function () {
      el.setAttribute('data-id', 'uid-{id}')
      var model = {id: '<233>'}
      emitter(model)
      Reactive(el, model)
      assert.equal(el.getAttribute('id'), 'uid-' + model.id)
    })

    it('should works with no interpolation', function () {
      var url = 'http://localhost:3000/'
      el.setAttribute('data-href', url)
      Reactive(el, emitter({}))
      assert.equal(el.getAttribute('href'), url)
    })

    it('should treat null values as empty string', function () {
      var url = 'http://localhost:3000/?x={x}&y={y}&z={z}'
      el.setAttribute('data-href', url)
      Reactive(el, emitter({}))
      assert.equal(el.getAttribute('href'), url.replace(/\{\w*\}/g, ''))
    })
  })

  describe('on-* events', function () {

    it('should fire events', function () {
      el.setAttribute('on-click', 'onClick')
      model.onClick = function () {
        this.age++
        this.emit('change age')
      }
      Reactive(el, model)
      var age = model.age
      el.click()
      assert.equal(model.age, age + 1)
      el.click()
      assert.equal(model.age, age + 2)
    })

    it('should remove event listener on remove', function () {
      el.setAttribute('on-click', 'onClick')
      model.onClick = function () {
        this.age++
        this.emit('change age')
      }
      var age = model.age
      var reactive = new Reactive(el, model)
      reactive.remove()
      el.click()
      assert.equal(model.age, age)
    })

    it('should works with tap event', function (done) {
      el.setAttribute('on-tap', 'onTap')
      var fired
      model.onTap = function () {
        this.age++
        fired = true
        this.emit('change age')
      }
      var reactive = new Reactive(el, model)
      var age = model.age
      fire(el, 'touchstart')
      setTimeout(function () {
        fire(el, 'touchend')
        assert(fired === true)
        assert(model.age - 1 === age)
        reactive.remove()

        done()
      }, 10)
    })
  })

  describe('data-checked', function () {

    it('should works with single checkbox', function () {
      var input = appendCheckBox()
      input.setAttribute('data-checked', 'actived')
      var reactive = new Reactive(el, model)
      assert.equal(input.checked, false)
      model.actived = true
      model.emit('change actived')
      assert.equal(input.checked, true)
      reactive.remove()
    })

    it('should remove binding on remove', function () {
      model.actived = true
      var input = appendCheckBox()
      input.setAttribute('data-checked', 'actived')
      var reactive = new Reactive(el, model)
      reactive.remove()
      model.actived = false
      model.emit('change actived')
      assert.equal(input.checked, true)
    })

    it('should works with checkbox with property from checkbox name', function () {
      var input = appendCheckBox()
      input.setAttribute('data-checked', '')
      var reactive = new Reactive(el, model)
      assert.equal(input.checked, false)
      model.active = true
      model.emit('change active')
      assert.equal(input.checked, true)
      reactive.remove()
    })

    it('should works with checkboxes', function () {
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
  })

  describe('data-selected', function () {

    var countries = ['china', 'india', 'america', 'canda']

    function createOption(select, value) {
      var option = document.createElement('option')
      option.name = 'country'
      option.value = value
      option.setAttribute('data-selected', 'country')
      select.appendChild(option)
      return option
    }

    function createCountrySelect() {
      var select = document.createElement('select')
      el.appendChild(select)
      createOption(select, '')
      var options = {}
      countries.forEach(function (name) {
        options[name] = createOption(select, name)
      })
      return select
    }

    function getOption(select, name) {
      return select.querySelector('[value="' +name+ '"]')
    }

    it('should reactive', function () {
      var select = createCountrySelect()
      model.country = 'canda'
      var reactive = new Reactive(el, model)
      countries.forEach(function (name) {
        if (name !== 'canda') {
          assert.equal(getOption(select, name).selected, false)
        } else {
          assert.equal(getOption(select, name).selected, true)
        }
      })
      model.country = 'china'
      model.emit('change country')
      assert.equal(getOption(select, 'china').selected, true)
      reactive.remove()
    })

    it('should works with multiple select', function () {
      var select = createCountrySelect()
      select.setAttribute('multiple', '')
      model.country = ['china', 'canda']
      var reactive = new Reactive(el, model)
      assert.equal(getOption(select, 'china').selected, true)
      assert.equal(getOption(select, 'canda').selected, true)
      reactive.remove()
    })

    it('should remove binding on remove', function () {
      var select = createCountrySelect()
      var reactive = new Reactive(el, model)
      reactive.remove()
      model.country = 'china'
      model.emit('change country')
      assert.equal(getOption(select, 'china').selected, false)
    })
  })

  describe('data-html', function () {
    it('should reactive', function () {
      var content = model.content = '<span>see you again</span>'
      var inner = document.createElement('div')
      inner.setAttribute('data-html', 'content')
      el.appendChild(inner)
      var r = new Reactive(el, model)
      assert.equal(inner.innerHTML, content)
      content = model.content = '<span>listen to me</span>'
      model.emit('change content')
      assert.equal(inner.innerHTML, content)
      r.remove()
    })

    it('should remove binding on remove', function () {
      var content = model.content = '<span>see you again</span>'
      var inner = document.createElement('div')
      inner.setAttribute('data-html', 'content')
      el.appendChild(inner)
      var r = new Reactive(el, model)
      r.remove()
      model.content = '<span>listen to me</span>'
      model.emit('change content')
      assert.equal(inner.innerHTML, content)
    })

    it('should use empty string for null values', function () {
      delete model.content
      el.setAttribute('data-html', 'content')
      var r = new Reactive(el, model)
      assert.equal(el.innerHTML, '')
      var content = model.content = '<span>here</span>'
      model.emit('change content')
      assert.equal(el.innerHTML, content)
      model.content = null
      model.emit('change content')
      assert.equal(el.innerHTML, '')
      r.remove()
    })
  })
})
