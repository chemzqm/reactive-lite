### [Define text interpolation](#text-interpolation)

A basic exmaple:

``` html
<div id="user"> {first} {last}</div>
```
``` js
var model = require('model-component')
var Reactive = require('reactive-lite')
var User = model('User')
        .attr('first')
        .attr('last')

var user = new User({
    first: 'tobi',
    last: 'blaz'
  })
var el = document.getElementById('user')
var reactive = new Reactive(el, model)
```

[model](https://github.com/chemzqm/model) is a small library to make object emit events whenever an attribute is set.

After `reactive` instance init, the element content would change instantly, and whenever you set `first` or
`last` attribute on model like `user.first = 'john'`, the reactive would be noticed and change the view correspondingly.

You can have interpolation in text-node with silbings, like:

``` html
<div id="user"><span>First name is</span> {first} </div>
```

The reactivity only happens on text-node.

[](#data-html)
**Notice** that for performance, text interpolation use `el.textContent` for rendering, you can use `data-html` to render html, like:

``` html
<div data-html="description"></div>
```

The `description` value of model would be set to `el.innerHTML`

### [Define attribute interpolation](#attr-interpolation)

Define attribute interpolation is the same like text interpolation, except that the real attribute would be set
without `data-` prefix, eg:
``` html
<a data-href="https:/github.com/{name}/{repo}">link</a>
```

would be changed to something like:
``` html
<a href="https:/github.com/chemzqm/model">link</a>
```
[Here](https://github.com/chemzqm/reactive-lite/blob/master/lib/bindings.js#L9-L23) is the available `data-attribute` list.

The reason for the attribute transform is that interpolation on attribute in some browser would be consider invalid and
tripped the browser (eg: `style` attribute on ie)

If there is no interpolation, the attribute would also be transformed with `data-` prefix tripped

### [Use filter to format interpolation](#filter)

You can make use filter(s) to format the output in interpolation, eg:
``` html
<div id="user"> {first | uppercase}</div>
```
the textContent would be uppercase (like: 'TOBI') correspondingly

Filters can be chained, eg:
``` html
<div id="user"> {first | uppercase | reverse}</div>
```
the result would be uppercase and then reversed.

Filter can have extra arguments, eg:

``` html
<div id="user"> {first | json 2}</div>
```
`2` would be passed as number type and second arguments to json filter which defined like this:

``` js
exports.json = function (value, indent) {
  return typeof value === 'string'
      ? value
      : JSON.stringify(value, null, Number(indent) || 2)
}
```


Filters can also be used for attribute interpolation

The buildin filter list can be found [here](https://github.com/chemzqm/reactive-lite/blob/master/lib/filter.js)

Want to build your own filter?  See [Define your own filter](./binding.html#own-filter)

### [Use data-render for render other component](#data-render)

Assume that you have a nice looking count component, for count display:
``` html
<div data-render="renderCount"></div>
```
``` js
var model = new Model('Count').attr('total')
var count = new model({total: 100})
var Count = require('awesome-count')

var reactive = new Reactive(el, count, {
  delegate: {
    renderCount: function (model, el) {
      var component = new Count(model.total)
      el.appendChild(component.el)
    }
  }
})
```

The delegate config is used for holding the functions for `data-render` and `on-*event*` defined event handlers.
The data-render handler would accept corresponding `model` and `element` as arguments, and the context (this reference)
is preserved to delegate it self.  Without using of closure, the delegate function could be reused for higher level
component (like list).

  *Next: [Custom binding and filter](./binding.html)*

