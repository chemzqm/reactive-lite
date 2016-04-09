## Binding

  Binding is used for create reusable function for element render with model properties, there are some build in bindings available, including

  * [attribute interpolation](./interpolation.html#attr-interpolation)
  * [data-render](./interpolation.html#data-render)
  * [data-html](./interpolation.html#data-html)
  * [data-checked & data-selected](./checked.html)

<h3 id="own-binding">Define your own binding is simple</h3>

Assume you want to create a binding to disable an element by user age, do it like this:

``` html
<div data-check="age">Only displayed when age > 18</div>
```

``` js
var user = new User(...)
var reactive = new Reactive(el, user, {
  bindings: {
    "data-check": function (prop) {
      this.bind(prop, function (model, el) {
        if(model[prop] >= 18) {
           el.style.display = 'block'
        } else {
           el.style.display = 'none'
        }
      })
    }
  }
})
```

`this.bind` could accept two arguments, first one is the property to react with (could also be array of properties),
the second argument is the function that would be called when reactive instance init or the model emit a change event with the property in first argument.

Notice that the function `data-check` referred to is reusable, by using the passed arguments, it's not tied to specific model or element.

---

If you're using [chemzqm/model](https://github.com/chemzqm/model), you can make use `$stat` property to check if model id dirty, for example:

``` html
<button data-dirty>Save</button>
```

``` js
var user = new User(...)
var reactive = new Reactive(el, user, {
  bindings: {
    "data-dirty": function () {
      //'change $stat' emitted on model status change
      this.bind('$stat', function (model, el) {
        el.disabled = !!model.changed()
      })
    }
  }
})
```

---

You can use `bindAll` method to react all properties change, for example:

``` html
<div id="log" data-change></div>
```

``` js
var user = new User(...)
var reactive = new Reactive(el, user, {
  bindings: {
    "data-change": function () {
      //'change' emitted on model whenever property change
      this.bindAll(function (prop, value, model, el) {
        var div = document.createElement('div')
        div.textContent = 'Prop ' + prop + ' changed to ' + value
        el.appendChild(div)
      })
    }
  }
})
```

<h3 id="own-filter">Define you own filter</h3>

Like `delegate` and `binding`, filters all passed through the third argument when constructing reactive instance,
if you need a `numberFormat` that transform input value to number, you can write code like this:

``` js
var reactive = new Reactive(el, user, {
  filters: {
    numberFormat: function (val) {
      if (!val) return 0
      val = parseInt(val, 10)
      if (isNaN(val)) return 0
      return val.toString()
    }
  }
})
```
``` html
<div>{weight | numberFormat}</div>
```
_space(s) aside `|` are optional, just for nice looking_

You can pass arguments to your filter ,like:

``` html
<div> {attribute | myformat 2 null true 'tobi'}</div>
```

The arguments are seperated by space(one or more), you should only use primary values on filter args,  no dynamic resolve is supported.

  *Next: [events handler](./events.html)*
