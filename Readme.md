# Reactive-lite

[![Build Status](https://secure.travis-ci.org/chemzqm/reactive-lite.png)](http://travis-ci.org/chemzqm/reactive-lite)
[![Coverage Status](https://coveralls.io/repos/chemzqm/reactive-lite/badge.svg?branch=master&service=github)](https://coveralls.io/github/chemzqm/reactive-lite?branch=master)
[![DOC](https://inch-ci.org/github/chemzqm/reactive-lite.svg?branch=master)](https://inch-ci.org/github/chemzqm/reactive-lite.svg?branch=master)

[Demo](http://chemzqm.github.io/reactive-lite/demo.html)

[Web site](http://chemzqm.github.io/reactive-lite/)

You may have to install `model-component` (a minimal event model) by:

    npm install model-component

to make it works, [the explaination](http://chemzqm.github.io/reactive-lite/interpolation#how-works)

## Features

* Flexible binding fashion, including text-interpolation, and render for different usage
* Bind attribute (especially `src` `href` `style`) and event handler easily
* Custom binding and filter API for gobal usage or single reactive instance
* Performance concerned, use `textContent` for text interpolation
* Reusable binding for list of reactive works much faster
* Easily works with checkbox(es) and select element
* support correct [tap-event](https://github.com/chemzqm/tap-event)

## Install

    npm i reactive-lite

## Basic

* **interpolation** `<span>{first} {last}</span>`
* **render** `<div data-render="checkActive" >Show on active</div>` with function like
* **attr-interpolation** `<a data-href="http://github.com/{uid}">{name}</a>`
* **event binding** `<button on-click="onBtnClick">click me</button>` with function like
* **checked/selected stat** `<input type="checkbox" name="active" data-checked="active"/>`

## Usage

``` js
var reactive = require('reactive-lite')
var el = document.getElementById('user')
var Model = require('model')
var User = Model('User')
  .attr('first')
  .attr('last')
  .attr('age')

var user = new User({first: 'tobi', last: 'john', age: 22})

reactive(el, model)
document.body.appendChild(reactive.el)
```
## API

### Reactive(el, model, option)

* `el` could be element or html template string
* `model` contains attributes for binding to the element, and emit `change [name]` event for reactive
* `option` is optional object contains config
* `option.delegate` contains event handler and render function(s)
* `option.filters`  contains filters for this reactive instance
* `option.bindings` contains bindings for this reactive instance

Binding function are searched on `model` first, if not, search delegate instead, throw error if not found

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
