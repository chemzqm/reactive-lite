var moment = require('moment')
var Counter = require('component-counter')
var Reactive = require('..')
var Model = require('model')
var attrs = {
  'isActive': true,
  'balance': 3038,
  'company': 'NEUROCELL',
  'picture': 'http://placehold.it/32x32',
  'age': 33,
  'first': 'Rollins',
  'last': 'Curtis',
  'email': 'rollinscurtis@delphide.com',
  'phone': '+1 (868) 450-3366',
  'address': '986 Williams Place, Gulf, Maryland, 1806',
  'about': '<strong>Excepteur cillum</strong> do irure labore nisi irure consequat excepteur ipsum quis nisi irure consectetur dolore. Aliquip nisi veniam nostrud officia et tempor aliquip eiusmod proident veniam sint anim consectetur. Mollit aliqua officia voluptate ea in adipisicing veniam commodo ut proident labore. Deserunt dolore culpa ut ut magna ipsum sint pariatur consectetur ullamco occaecat laborum magna tempor.\r\n',
  'registered': '2015-02-08T09:03:42',
  'latitude': -52.140292,
  'longitude': -48.808837,
  'tags': [ 'est', 'dolore', 'ea', 'non', 'exercitation', 'id', 'est'
  ],
  'timestamp': new Date()
}
var User = Model('User')
Object.keys(attrs).forEach(function (k) {
  User.attr(k)
})
var user = new User(attrs)
user.showTags = function () {
  return this.tags.join(',')
}
var delegate = {
  update: function (e, model, node) {
    var attr = node.getAttribute('name')
    var val = node.value
    if (attr in model) {
      model[attr] = val
    }
  },
  renderCounter: function (model, node) {
    if (!this.counter) {
      var counter = this.counter = new Counter
      node.appendChild(counter.el)
      counter.digits(5)
      counter.update(model.balance)
    } else {
      this.counter.update(model.balance)
    }
  }
}
var bindings = {
  moment: function (attr) {
    this.bind(attr, function (model, node) {
      var format = node.getAttribute('format')
      node.textContent = moment(model[attr]).format(format)
    })
  }
}

var filters = {
  integer: function (val) {
    if (!val) return 0
    return parseInt(val, 10)
  }
}
var el = document.getElementById('user')
Reactive(el, user, {
  delegate: delegate,
  bindings: bindings,
  filters: filters
})

