# Reactive-lite

[![Build Status](https://secure.travis-ci.org/chemzqm/reactive-lite.png)](http://travis-ci.org/chemzqm/reactive-lite)

Simplified reactive component,, bind model like this:

* **interpolate** <span>{first} {last}</span>
* **format** `<div data-format="formatMoney"></div>` with function like:
``` js
function() { return '$' + this.money }
```
the function is reusable.

* **render** `<div data-render="checkActive" >Show on active</div>` with function like
``` js
function(el) { el.style.display = this.active?'block': 'none'}
```

* **attr-interpolation** `<a data-href="http://github.com/{uid}">{name}</a>`
* **event binding** `<button on-click="onBtnClick">click me</button>`
* **checked/selected stat** `<input type="checkbox" name="active" data-checked="active"/>`

**NOTICE**:
* To make reactive-lite works, use `this.prop` in your format and render functions, the context(`this` reference) is `model`.
* Text node is ignored for bindings, just for performance, **never** do this:
``` html
<div><span>Name is</span> {name}</div>
```
Text interpolate **must** always be wrapped with independent element.
* Interpolate and format result is rendered with textContent, just for performance.

TODO: test

## Install

    npm i reactive-lite

## Usage

``` js
var reactive = require('reactive-lite')
var template = require('./template.html')
var domify = require('domify')

reactive(domify(template), model)
document.body.appendChild(reactive.el)
```
## API

### Reactive(el, model, [delegate])

* `el` could be element or html template string
* `model` contains attributes for binding to the element, should emit `change [name]` event to notify reactive instance
* `delegate` is optional object contains event handler and/or format and render function, reactive would try to find format and render on the model first

### .remove()

Unbind all events and remove `reactive.el`

## Advance usage

## Events

* `change`
* `click`
* `tap`
* `dblclick`
* `mousedown`
* `mousaup`
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

## MIT license
Copyright (c) 2015 chemzqm@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
