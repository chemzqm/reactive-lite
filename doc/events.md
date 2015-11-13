## Events

You can alias an event handler with `on-*event*` syntax in your html

``` html
<button on-click="onclick">submit</button>
```

The handler should be defined in the delegate object, which is passed in the third (`option`) argument when constructing reactive

``` js
var reactive = new Reactive(el, user, {
  delegate: {
    onclick: function(e, model, el) {
      // do somthing with model and element
      assert(model === user)
    }
  }
})
```
`model` is passed as second argument, so you can define your delegate some where else (instead of using closure), the
content (this reference) is preserved to the delegate object to make it self contained, which also means easy to test with.

### Supported events

  * `change`
  * `touchstart`
  * `touchend`
  * `click`
  * `dblclick`
  * `mousedown`
  * `mouseup`
  * `mousemove`
  * `mouseenter`
  * `mouseleave`
  * `scroll`
  * `blur`
  * `focus`
  * `input`
  * `submit`
  * `keydown`
  * `keypress`
  * `keyup`

_Reactive would unbind the related event handlers when it's destroied by `.remove()`_


  *Next: [checked and selected](./checked.html)*
