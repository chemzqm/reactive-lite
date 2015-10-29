var Reactive = require('..')
var Model = require('model')

var el = document.getElementById('user')

var User = Model('User')
          .attr('id')
          .attr('first')
          .attr('last')
          .attr('active')
          .attr('country')
          .attr('money')
          .attr('pets')

var user = new User({
  id: '123',
  first: 'tobi',
  last: 'noob',
  active: true,
  country: 'China',
  money: 122224,
  pets: ['pig', 'dog']
})

var view = {
  formatMoney: function () {
    return '$' + this.money
  },
  toggleStat: function (e) {
    this.active = !this.active
  },
  checkStat: function (el) {
    if (this.active) {
      el.style.display = 'block'
    } else {
      el.style.display = 'none'
    }
  },
  addMoney: function (e) {
    e.preventDefault()
    this.money = this.money + 100
  },
  changeName: function (e) {
    var v = e.target.value
    this.first = v
  }
}

var reactive = new Reactive(el, user, view)
document.body.appendChild(reactive.el)
