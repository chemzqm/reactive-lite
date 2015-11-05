<h3 id="text-interpolation">Define text interpolation</h3>

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

You can use function in interpolation, like:
``` html
<div id="user">fullname is {fullname()} {first} </div>
```
If you have `fullname` function in the model:
``` js
user.fullname = function() {
  return this.first + ',' + this.last
}
```
The function result will be rendered and the textContent would react the change of `first` and `last` attributes.

[](#data-html)
**Notice** that for performance, text interpolation use `el.textContent` for rendering, you can use `data-html` to render html, like:

``` html
<div data-html="description"></div>
```

The `description` value of model would be set to `el.innerHTML`.

If the output html is not just the attribute, you can use [data-render](#data-render) for that, which gives you freedom to control `model` and binding `element`.

You can also make the binding reusable by [create a binding](./binding.html#own-binding)

<h3 id="how-works">How does the interpolation works?</h3>

It just generate functions for each interpolation, for the interpolation `{first}` ,the function would be:
``` js
function (model) {
  return model.first
}
```

For function `fulllname`, the function is:
``` js
function (model) {
  return model.fullname()
}
```
The only thing have to do is prefix the attribute with `model.`

For the interpolation with filter like `first | uppercase`, just wrap the result like:
``` js
function (model, filter) {
  return filter.uppercase(model.first)
}
```

Parsing the reactive attributes from function is also quite simple, just find the function and `toString()`, by
using a regex `/\bthis\.([\w_$]+)\b(?!([\w$_]|\s*\())`, it can get all the attributes used by `this.attribute`.

For the attribute used by the form `this.['attribute']`, reactive would not be noticed.


<h3 id="attr-interpolation">Define attribute interpolation</h3>

Define attribute interpolation is the same like text interpolation, except that the real attribute would be set
without `data-` prefix, eg:
``` html
<a data-href="https:/github.com/{name}/{repo}">link</a>
```

would be changed to something like:
``` html
<a href="https:/github.com/chemzqm/model">link</a>
```
The reason for the attribute transform is that interpolation on attribute in some browser would be consider invalid and
tripped the browser (eg: `style` attribute on ie)

If there is no interpolation, the attribute would also be transformed with `data-` prefix tripped

[Here](https://github.com/chemzqm/reactive-lite/blob/master/lib/bindings.js#L9-L23) is the available `data-attribute` list.

<h3 id="filter">Use filter to format interpolation</h3>

You can use filter(s) to format the output in interpolation, eg:
``` html
<div id="user"> {first | uppercase}</div>
```
the textContent would be uppercase (like: 'TOBI') correspondingly

Another quite useful filter is `nonull, if you don't want `undefined` or `null` to render on your page, you can:
``` html
<div id="user"> {first | nonull}</div>
```
If `first` is undefined, the result would be an empty string.

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

<h3 id="data-render">Use data-render for render other component</h3>

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
is preserved to delegate it self.

Without using of closure, the delegate function could be reused for higher level component (like list).

  *Next: [Custom binding and filter](./binding.html)*

