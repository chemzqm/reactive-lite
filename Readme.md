# Reactive-lite

[![NPM version](https://img.shields.io/npm/v/reactive-lite.svg?style=flat-square)](https://www.npmjs.com/package/reactive-lite)
[![Dependency Status](https://img.shields.io/david/chemzqm/reactive-lite.svg?style=flat-square)](https://david-dm.org/chemzqm/reactive-lite)
[![Build Status](https://img.shields.io/travis/chemzqm/reactive-lite/master.svg?style=flat-square)](http://travis-ci.org/chemzqm/reactive-lite)
[![Coverage Status](https://img.shields.io/coveralls/chemzqm/reactive-lite/master.svg?style=flat-square)](https://coveralls.io/github/chemzqm/reactive-lite?branch=master)

[Demo](http://chemzqm.github.io/reactive-lite/demo.html)

[Web site](http://chemzqm.github.io/reactive-lite/)

Reactive-lite is an opinionated reactive template engine, it works with simple event model which should auto emit change event on value set.  [the explaination](http://chemzqm.github.io/reactive-lite/interpolation#how-works)

[model-component](https://github.com/chemzqm/model) is a minimal event model, it's a peerDependency of reactive-lite by now.

## Features

* Flexible binding fashion, including `text-interpolation`, `attr-interpolation` and `render function`.
* Support reusable binding functions and filter functions for different reactive instances.
* Support config resue between different reactive instances. (makes rendering list components
  extremely fast, eg: [exgrid](https://github.com/chemzqm/exgrid))
* Support change model on the fly.
* Easily works with checkbox(es) and select element
* Performance concerned, use `textContent` for text interpolation (use
  `data-html` for render html attribute)

## Install

    npm i reactive-lite

## Basic

* **interpolation** `<span>{first} {last}</span>`
* **render** `<div data-render="checkActive" >Show on active</div>`
* **attr-interpolation** `<a data-href="http://github.com/{uid}">{name}</a>`
* **event binding** `<button on-click="onBtnClick">click me</button>`
* **checked/selected stat** `<input type="checkbox" name="active" data-checked="active"/>`

`render functions` and `event handler functions` comes from delegate object.

## Usage

``` js
var reactive = require('reactive-lite')
var el = document.getElementById('user')
var Model = require('model-component')
var User = Model('User')
  .attr('first')
  .attr('last')
  .attr('age')

var user = new User({first: 'tobi', last: 'john', age: 22})

reactive(el, model)
document.body.appendChild(reactive.el)
```
## API

### Reactive(el, model, [option])

* `el` could be element or html template string
* `model` contains attributes for binding to the element, and emit `change [name]` event for reactive
* `option` is optional object contains config
* `option.delegate` js object contains event handler and render function(s)
* `option.filters`  js object contains filters functions
* `option.bindings` js object contains bindings functions
* `option.config` the config attribute from other reactive instance,
  supply this option to prevent `el`(element) parsed twice.

### .bind(model)

Bind to a new model, elements would get reacted and event handlers would bind to new
model.

### .remove()

Unbind all events and remove `reactive.el`

The [Web site](http://chemzqm.github.io/reactive-lite/) contains full documentation

## Check out demo

```
git clone git@github.com:chemzqm/reactive-lite.git
cd reactive-lite && npm install
gulp
open http://localhost:3000/example/index.html
```

## Test
```
npm install
make test
```

## MIT license
Copyright (c) 2015 chemzqm@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
