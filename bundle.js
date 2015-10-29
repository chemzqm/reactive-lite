/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Reactive = __webpack_require__(1)
	var Model = __webpack_require__(11)
	
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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2)


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(3)
	var domify = __webpack_require__(5)
	var Binding = __webpack_require__(6)
	var bindings = __webpack_require__(7)
	var Emitter = __webpack_require__(10)
	
	/**
	 * Reactive
	 *
	 * @param {Element|String} el element or template string
	 * @param {Object} model model with change event emitted
	 * @param {Object} delegate [Optional] object with named functions
	 * @param {Object} config [Optional] object with reactive config
	 * @api public
	 */
	function Reactive(el, model, delegate, config) {
	  if(!(this instanceof Reactive)) return new Reactive(el, model, delegate, config)
	  if (typeof el === 'string') el = domify(el)
	  this.delegate = delegate || {}
	  this.model = model
	  this.el = el
	  if (!config) {
	    this._bind(model, el)
	  }
	}
	
	Emitter(Reactive.prototype)
	
	/**
	 * Remove element and unbind events
	 *
	 * @api public
	 */
	Reactive.prototype.remove = function () {
	  this.el.parentNode.removeChild(this.el)
	  this.emit('remove')
	  // The model may still using, not destroy it
	  this.model = null
	  this.off()
	}
	
	Reactive.prototype._bind = function (model, root) {
	  var reactive = this
	  util.walk(root, function (el, next) {
	    var els = util.toElementArray(el.childNodes)
	    var attributes = el.attributes
	    var binding = new Binding(reactive)
	    if (els.length === 0 && util.hasInterpolation(el.textContent)) {
	      binding.interpolation(el.textContent)
	    }
	    for (var i = 0, l = attributes.length; i < l; i++) {
	      var name = attributes[i].name
	      var val = attributes[i].value
	      if (/^(data-|on-)/.test(name)) {
	        binding.add(name, val)
	      }
	    }
	    if (binding.bindings.length) {
	      binding.active(el)
	    } else {
	      binding.remove()
	    }
	    next()
	  })
	}
	
	/**
	 * Subscribe to prop change on model
	 *
	 * @param {String} prop
	 * @param {Function} fn
	 * @api public
	 */
	Reactive.prototype.sub = function (prop, fn) {
	  var model = this.model
	  model.on('change ' + prop, fn)
	  this.on('remove', function () {
	    model.off('change ' + prop, fn)
	  })
	}
	
	/**
	 * Create custom bindings with attribute name and function witch is call with
	 * property value eg:
	 * Reactive.createBinding('data-sum', function (value) {
	 *    var props = value.split(',')
	 *    this.bind(props, function (el, model) {
	 *      var val = props.reduce(function(pre, name) {
	 *        return pre + model[name]
	 *      }, 0)
	 *      el.textContent = val
	 *   })
	 * })
	 *
	 *
	 * @param {String} name attribute name
	 * @param {Function} fn
	 * @api public
	 */
	Reactive.createBinding = function (name, fn) {
	  if (bindings[name]) throw new Error('binding [' + name + '] already in use')
	  bindings[name] = fn
	}
	
	module.exports = Reactive


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var unique = __webpack_require__(4)
	var buildinRe = exports.buildinRe = /^(emit|on|off)$/
	
	exports.walk = function walk(el, process, done) {
	  var end = done || function(){};
	  var nodes = toElementArray(el.childNodes);
	
	  function next(stop){
	    if (stop || nodes.length === 0) {
	      return end();
	    }
	    walk(nodes.shift(), process, next);
	  }
	
	  process(el, next);
	}
	
	var toElementArray = exports.toElementArray = function (list) {
	  var arr = []
	  var el
	  for (var i = 0, l = list.length; i < l; i++) {
	    el = list[i]
	    if (el.nodeType === 1) {
	      arr.push(el)
	    }
	  }
	  return arr
	}
	
	/**
	 * Node list to array, for better performance
	 *
	 * @param {Collection} list Node collection
	 * @return {Array}
	 * @api public
	 */
	exports.toArray = function (list) {
	  var arr = new Array(list.length)
	  for (var i = 0, l = arr.length; i < l; i++) {
	    arr.push(list[i])
	  }
	  return arr
	}
	
	/**
	 * Parse bindings from function
	 *
	 * @param {Function} fn
	 * @return {Array}
	 * @api private
	 */
	exports.parseBindings = function (fn) {
	  var res = []
	  var str = fn.toString()
	  var arr
	  var re = new RegExp('\\bthis\\.([\\w_$]+)', 'g')
	  while ((arr = re.exec(str)) !== null) {
	    res.push(arr[1])
	  }
	  res = res.filter(function (str) {
	    return !buildinRe.test(str)
	  })
	  return unique(res)
	}
	
	/**
	 * Get delegate function by function name
	 *
	 * @param {String} name
	 * @param {Object} reactive
	 * @return {Function}
	 * @api public
	 */
	exports.getDelegateFn = function (name, reactive) {
	  var model = reactive.model
	  var fn = model[name]
	  if (fn && typeof fn === 'function') return fn
	  var delegate = reactive.delegate
	  fn = delegate[name]
	  if (fn && typeof fn === 'function') return fn
	  throw new Error('can\'t find delegate function for[' + name + ']')
	}
	
	
	/**
	 * Parse str to get the bindings and render function
	 * eg: {first} {last} => {
	 *  bindings: ['first', 'last'],
	 *  fn: function(model) { return model.first + '' + model.last}
	 * }
	 *
	 * @param {string} str textContent
	 * @return {object} bindings and render function
	 * @api public
	 */
	exports.parseInterpolationConfig = function (str) {
	  var bindings = []
	  var res = '"'
	  var inside = false
	  var name = ''
	  for (var i = 0; i < str.length; i++) {
	    var c = str[i]
	    if (c === '{') {
	      inside = true
	      res = res + '"'
	    } else if (c === '}') {
	      inside = false
	      res = res + ' + es(model.' + name + ') + "'
	      // might be nested
	      bindings.push(name.replace(/\.[^\s]+$/,''))
	      name = ''
	    } else if (inside) {
	      name = name + c
	    } else {
	      res = res + c
	    }
	  }
	  res = res + '"'
	  var fn = new Function('model', 'es', ' return ' + res)
	  return {
	    bindings: bindings,
	    fn: fn
	  }
	}
	
	/**
	 * Check if `str` has interpolation.
	 *
	 * @param {String} str
	 * @return {Boolean}
	 * @api private
	 */
	
	exports.hasInterpolation = function(str) {
	  return ~str.indexOf('{')
	}
	
	/**
	 * Escape html string, for safety
	 *
	 * @param {String} html
	 * @return {String}
	 * @api public
	 */
	exports.es = function (html) {
	  if (html == null) return ''
	  return String(html)
	    .replace(/&/g, '&amp;')
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;')
	    .replace(/'/g, '&#39;')
	    .replace(/"/g, '&quot;');
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	/*!
	 * array-unique <https://github.com/jonschlinkert/array-unique>
	 *
	 * Copyright (c) 2014-2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */
	
	'use strict';
	
	module.exports = function unique(arr) {
	  if (!Array.isArray(arr)) {
	    throw new TypeError('array-unique expects an array.');
	  }
	
	  var len = arr.length;
	  var i = -1;
	
	  while (i++ < len) {
	    var j = i + 1;
	
	    for (; j < arr.length; ++j) {
	      if (arr[i] === arr[j]) {
	        arr.splice(j--, 1);
	      }
	    }
	  }
	  return arr;
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	
	/**
	 * Expose `parse`.
	 */
	
	module.exports = parse;
	
	/**
	 * Tests for browser support.
	 */
	
	var innerHTMLBug = false;
	var bugTestDiv;
	if (typeof document !== 'undefined') {
	  bugTestDiv = document.createElement('div');
	  // Setup
	  bugTestDiv.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
	  // Make sure that link elements get serialized correctly by innerHTML
	  // This requires a wrapper element in IE
	  innerHTMLBug = !bugTestDiv.getElementsByTagName('link').length;
	  bugTestDiv = undefined;
	}
	
	/**
	 * Wrap map from jquery.
	 */
	
	var map = {
	  legend: [1, '<fieldset>', '</fieldset>'],
	  tr: [2, '<table><tbody>', '</tbody></table>'],
	  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
	  // for script/link/style tags to work in IE6-8, you have to wrap
	  // in a div with a non-whitespace character in front, ha!
	  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
	};
	
	map.td =
	map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];
	
	map.option =
	map.optgroup = [1, '<select multiple="multiple">', '</select>'];
	
	map.thead =
	map.tbody =
	map.colgroup =
	map.caption =
	map.tfoot = [1, '<table>', '</table>'];
	
	map.polyline =
	map.ellipse =
	map.polygon =
	map.circle =
	map.text =
	map.line =
	map.path =
	map.rect =
	map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];
	
	/**
	 * Parse `html` and return a DOM Node instance, which could be a TextNode,
	 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
	 * instance, depending on the contents of the `html` string.
	 *
	 * @param {String} html - HTML string to "domify"
	 * @param {Document} doc - The `document` instance to create the Node for
	 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
	 * @api private
	 */
	
	function parse(html, doc) {
	  if ('string' != typeof html) throw new TypeError('String expected');
	
	  // default to the global `document` object
	  if (!doc) doc = document;
	
	  // tag name
	  var m = /<([\w:]+)/.exec(html);
	  if (!m) return doc.createTextNode(html);
	
	  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace
	
	  var tag = m[1];
	
	  // body support
	  if (tag == 'body') {
	    var el = doc.createElement('html');
	    el.innerHTML = html;
	    return el.removeChild(el.lastChild);
	  }
	
	  // wrap map
	  var wrap = map[tag] || map._default;
	  var depth = wrap[0];
	  var prefix = wrap[1];
	  var suffix = wrap[2];
	  var el = doc.createElement('div');
	  el.innerHTML = prefix + html + suffix;
	  while (depth--) el = el.lastChild;
	
	  // one element
	  if (el.firstChild == el.lastChild) {
	    return el.removeChild(el.firstChild);
	  }
	
	  // several elements
	  var fragment = doc.createDocumentFragment();
	  while (el.firstChild) {
	    fragment.appendChild(el.removeChild(el.firstChild));
	  }
	
	  return fragment;
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var bindings = __webpack_require__(7)
	var util = __webpack_require__(3)
	
	function Binding(reactive) {
	  this._reactive = reactive
	  this.bindings = []
	  reactive.once('remove', this.remove.bind(this))
	}
	
	/**
	 * Add text interpolation binding
	 *
	 * @param {String} textContent el textContent
	 * @api public
	 */
	Binding.prototype.interpolation = function (textContent) {
	  var config = util.parseInterpolationConfig(textContent)
	  var bindings = config.bindings
	  var func = function (el) {
	    var model = this._reactive.model
	    var render = function () {
	      // much better performance than innerHTML
	      el.textContent = config.fn(model, util.es)
	    }
	    this.bindReactive(bindings, render)
	    render()
	  }
	  this.bindings.push(func)
	}
	
	/**
	 * Add binding by element attribute
	 *
	 * @param {String} attr attribute name
	 * @param {String} value attribute value
	 * @api public
	 */
	Binding.prototype.add = function (attr, value) {
	  var fn = bindings[attr]
	  // custom bindings
	  if (!fn) return
	  this.bindings.push(fn.call(this, value))
	}
	
	/**
	 * Bind all bindings to the element
	 *
	 * @param {Element} el
	 * @api public
	 */
	Binding.prototype.active = function (el) {
	  var self = this
	  this.bindings.forEach(function (fn) {
	    fn.call(self, el)
	  })
	}
	
	/**
	 * Bind eventlistener to model attribute[s]
	 *
	 * @param {String|Array} binding model attribute[s]
	 * @param {Function} fn listener
	 * @api private
	 */
	Binding.prototype.bindReactive = function (binding, fn) {
	  var reactive = this._reactive
	  if (typeof binding === 'string') {
	    reactive.sub(binding, fn)
	  } else {
	    binding.forEach(function (name) {
	      reactive.sub(name, fn)
	    })
	  }
	}
	
	
	
	/**
	 * Convinient method for getting model value
	 *
	 * @param {String} name model attribute
	 * @return {Mixed} attribute value
	 * @api public
	 */
	Binding.prototype.value = function (name) {
	  var model = this._reactive.model
	  return model[name]
	}
	
	Binding.prototype.remove = function () {
	  this.bindings = null
	  delete this._reactive
	}
	
	/**
	 * Bind properties with function
	 * function is called with element and model
	 *
	 * @param {String|Array} bindings bind properties
	 * @param {Function} fn callback function
	 * @api public
	 */
	Binding.prototype.bind = function (bindings, fn) {
	  var func = function (el) {
	    var self = this
	    var model = this._reactive.model
	    var render = function () {
	      fn.call(self, el, model)
	    }
	    this.bindReactive(bindings, render)
	    render()
	  }
	  this.bindings.push(func)
	}
	
	/**
	 * Check if binding defined
	 *
	 * @param {String} attr attribute name
	 * @return {Boolean}
	 * @api public
	 */
	Binding.hasBinding = function (attr) {
	  var names = Object.keys(bindings)
	  return ~names.indexOf(attr)
	}
	
	
	module.exports = Binding


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var tap = __webpack_require__(8)
	var util = __webpack_require__(3)
	var event = __webpack_require__(9)
	
	/**
	 * Attributes supported.
	 */
	var attrs = [
	  'id',
	  'src',
	  'rel',
	  'cols',
	  'rows',
	  'name',
	  'href',
	  'title',
	  'class',
	  'style',
	  'width',
	  'value',
	  'height',
	  'tabindex',
	  'placeholder'
	]
	
	var events = [
	  'change',
	  'tap',
	  'click',
	  'dblclick',
	  'mousedown',
	  'mouseup',
	  'mousemove',
	  'mouseenter',
	  'mouseleave',
	  'scroll',
	  'blur',
	  'focus',
	  'input',
	  'submit',
	  'keydown',
	  'keypress',
	  'keyup'
	]
	
	exports['data-format'] = function (value) {
	  var fn = util.getDelegateFn(value, this._reactive)
	  var bindings = util.parseBindings(fn)
	  return function (el) {
	    // called by binding
	    var model = this._reactive.model
	    var render = function () {
	      // much better performance than innerHTML
	      el.textContent = fn.call(model)
	    }
	    this.bindReactive(bindings, render)
	    render()
	  }
	}
	
	exports['data-render'] = function (value) {
	  var fn = util.getDelegateFn(value, this._reactive)
	  var bindings = util.parseBindings(fn)
	  return function (el) {
	    var model = this._reactive.model
	    var render = function () {
	      fn.call(model, el)
	    }
	    this.bindReactive(bindings, render)
	    render()
	  }
	}
	
	attrs.forEach(function (attr) {
	  // attribute bindings
	  exports['data-' + attr] = function (value) {
	    var config = util.parseInterpolationConfig(value)
	    var bindings = config.bindings
	    var func = config.fn
	    return function (el) {
	      var model = this._reactive.model
	      var fn = function () {
	        var str = func(model, util.es)
	        el.setAttribute(attr, str)
	      }
	      this.bindReactive(bindings, fn)
	      fn()
	    }
	  }
	})
	
	events.forEach(function (name) {
	  exports['on-' + name] = function (value) {
	    var fn = util.getDelegateFn(value, this._reactive)
	    return function (el) {
	      var model = this._reactive.model
	      var handler
	      if (name === 'tap') {
	        name = 'touchstart'
	        handler = tap(fn.bind(model))
	      } else {
	        handler = fn.bind(model)
	      }
	      event.bind(el, name, handler)
	      this._reactive.on('remove', function () {
	        event.unbind(el, name, handler)
	      })
	    }
	  }
	})
	
	var arr = ['checked', 'selected']
	arr.forEach(function (name) {
	  exports['data-' + name] = function (value) {
	    return function (el) {
	      var attr = value || el.getAttribute('name')
	      var model = this._reactive.model
	      var v = model[attr]
	      var fn = function () {
	        var value = el.getAttribute('value')
	        // single checkbox
	        if (value == null) {
	          if (v) {
	            el.setAttribute(name, '')
	          } else {
	            el.removeAttribute(name)
	          }
	          return
	        }
	        if (v == null) return el.removeAttribute(name)
	        // checkbox
	        if (Array.isArray(v) && ~v.indexOf(value)) {
	          el.setAttribute(name, '')
	        // radio
	        } else if (v.toString() === value) {
	          el.setAttribute(name, '')
	        } else {
	          el.removeAttribute(name)
	        }
	      }
	      this.bindReactive(attr, fn)
	      fn()
	    }
	  }
	})


/***/ },
/* 8 */
/***/ function(module, exports) {

	var cancelEvents = [
	  'touchcancel',
	  'touchstart',
	]
	
	var endEvents = [
	  'touchend',
	]
	
	module.exports = Tap
	
	// default tap timeout in ms
	Tap.timeout = 200
	
	function Tap(callback, options) {
	  options = options || {}
	  // if the user holds his/her finger down for more than 200ms,
	  // then it's not really considered a tap.
	  // however, you can make this configurable.
	  var timeout = options.timeout || Tap.timeout
	
	  // to keep track of the original listener
	  listener.handler = callback
	
	  return listener
	
	  // el.addEventListener('touchstart', listener)
	  function listener(e1) {
	    // tap should only happen with a single finger
	    if (!e1.touches || e1.touches.length > 1) return
	
	    var el = this;
	
	    var timeout_id = setTimeout(cleanup, timeout)
	
	    cancelEvents.forEach(function (event) {
	      document.addEventListener(event, cleanup)
	    })
	    el.addEventListener('touchmove', cleanup);
	
	    endEvents.forEach(function (event) {
	      document.addEventListener(event, done)
	    })
	
	    function done(e2) {
	      // since touchstart is added on the same tick
	      // and because of bubbling,
	      // it'll execute this on the same touchstart.
	      // this filters out the same touchstart event.
	      if (e1 === e2) return
	
	      cleanup()
	
	      // already handled
	      if (e2.defaultPrevented) return
	
	      // overwrite these functions so that they all to both start and events.
	      var preventDefault = e1.preventDefault
	      var stopPropagation = e1.stopPropagation
	
	      e2.stopPropagation = function () {
	        stopPropagation.call(e1)
	        stopPropagation.call(e2)
	      }
	
	      e2.preventDefault = function () {
	        preventDefault.call(e1)
	        preventDefault.call(e2)
	      }
	
	      // calls the handler with the `end` event,
	      // but i don't think it matters.
	      callback.call(el, e2)
	    }
	
	    // cleanup end events
	    // to cancel the tap, just run this early
	    function cleanup(e2) {
	      // if it's the same event as the origin,
	      // then don't actually cleanup.
	      // hit issues with this - don't remember
	      if (e1 === e2) return
	
	      clearTimeout(timeout_id)
	
	      cancelEvents.forEach(function (event) {
	        document.removeEventListener(event, cleanup)
	      })
	      el.removeEventListener('touchmove', cleanup);
	
	      endEvents.forEach(function (event) {
	        document.removeEventListener(event, done)
	      })
	    }
	  }
	}


/***/ },
/* 9 */
/***/ function(module, exports) {

	var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
	    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
	    prefix = bind !== 'addEventListener' ? 'on' : '';
	
	/**
	 * Bind `el` event `type` to `fn`.
	 *
	 * @param {Element} el
	 * @param {String} type
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @return {Function}
	 * @api public
	 */
	
	exports.bind = function(el, type, fn, capture){
	  el[bind](prefix + type, fn, capture || false);
	  return fn;
	};
	
	/**
	 * Unbind `el` event `type`'s callback `fn`.
	 *
	 * @param {Element} el
	 * @param {String} type
	 * @param {Function} fn
	 * @param {Boolean} capture
	 * @return {Function}
	 * @api public
	 */
	
	exports.unbind = function(el, type, fn, capture){
	  el[unbind](prefix + type, fn, capture || false);
	  return fn;
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	
	/**
	 * Expose `Emitter`.
	 */
	
	module.exports = Emitter;
	
	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */
	
	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};
	
	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};
	
	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }
	
	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};
	
	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	
	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }
	
	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;
	
	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }
	
	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};
	
	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */
	
	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks['$' + event];
	
	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */
	
	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};
	
	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */
	
	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */
	
	var Emitter = __webpack_require__(10);
	var proto = __webpack_require__(12);
	var statics = __webpack_require__(13);
	
	/**
	 * Expose `createModel`.
	 */
	
	module.exports = createModel;
	
	/**
	 * Create a new model constructor with the given `name`.
	 *
	 * @param {String} name
	 * @return {Function}
	 * @api public
	 */
	
	function createModel(name) {
	  if ('string' != typeof name) throw new TypeError('model name required');
	
	  /**
	   * Initialize a new model with the given `attrs`.
	   *
	   * @param {Object} attrs
	   * @api public
	   */
	
	  function model(attrs) {
	    if (!(this instanceof model)) return new model(attrs);
	    attrs = attrs || {};
	    this._callbacks = {};
	    this.attrs = attrs;
	    this.dirty = attrs;
	    this.model.emit('construct', this, attrs);
	  }
	
	  // mixin emitter
	
	  Emitter(model);
	
	  // statics
	
	  model.modelName = name;
	  model.attrs = {};
	  model.validators = [];
	  for (var key in statics) model[key] = statics[key];
	
	  // prototype
	
	  model.prototype = {};
	  model.prototype.model = model;
	  for (key in proto) model.prototype[key] = proto[key];
	
	  return model;
	}
	


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */
	
	var Emitter = __webpack_require__(10);
	
	var noop = function(){};
	
	/**
	 * Mixin emitter.
	 */
	
	Emitter(exports);
	
	/**
	 * Register an error `msg` on `attr`.
	 *
	 * @param {String} attr
	 * @param {String} msg
	 * @return {Object} self
	 * @api public
	 */
	
	exports.error = function(attr, msg){
	  this.errors.push({
	    attr: attr,
	    message: msg
	  });
	  return this;
	};
	
	
	/**
	 * Get / set the primary key.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api public
	 */
	
	exports.primary = function(val){
	  var key = this.model.primaryKey;
	  if (0 === arguments.length) return this[key]();
	  this.attrs[key] = val;
	  return;
	};
	
	/**
	 * Validate the model and return a boolean.
	 *
	 * Example:
	 *
	 *    user.isValid()
	 *    // => false
	 *
	 *    user.errors
	 *    // => [{ attr: ..., message: ... }]
	 *
	 * @return {Boolean}
	 * @api public
	 */
	
	exports.isValid = function(){
	  return 0 === this.validate().length;
	};
	
	/**
	 * Return `false` or an object
	 * containing the "dirty" attributes.
	 *
	 * Optionally check for a specific `attr`.
	 *
	 * @param {String} [attr]
	 * @return {Object|Boolean}
	 * @api public
	 */
	
	exports.changed = function(attr){
	  var dirty = this.dirty;
	  if (Object.keys(dirty).length) {
	    if (attr) return !! dirty[attr];
	    return dirty;
	  }
	  return false;
	};
	
	/**
	 * remove dirty marks
	 *
	 * @api public
	 */
	exports.clean = function(){
	  this.dirty = {};
	}
	
	/**
	 * Perform validations.
	 *
	 * @api private
	 */
	
	exports.validate = function(){
	  var self = this;
	  var fns = this.model.validators;
	  this.errors = [];
	  fns.forEach(function(fn){ fn(self) });
	  return this.errors;
	};
	
	/**
	 * Set multiple `attrs`.
	 *
	 * @param {Object} attrs
	 * @return {Object} self
	 * @api public
	 */
	
	exports.set = function(attrs){
	  for (var key in attrs) {
	    this[key] = attrs[key];
	  }
	  return this;
	};
	
	
	/**
	 * Return the JSON representation of the model.
	 *
	 * @return {Object}
	 * @api public
	 */
	
	exports.toJSON = function(){
	  return this.attrs;
	};
	
	/**
	 * Check if `attr` is present (not `null` or `undefined`).
	 *
	 * @param {String} attr
	 * @return {Boolean}
	 * @api public
	 */
	
	exports.has = function(attr){
	  return null != this.attrs[attr];
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	/**
	 * Module dependencies.
	 */
	
	var noop = function(){};
	
	
	/**
	 * Add validation `fn()`.
	 *
	 * @param {Function} fn
	 * @return {Function} self
	 * @api public
	 */
	
	exports.validate = function(fn){
	  this.validators.push(fn);
	  return this;
	};
	
	
	/**
	 * Define attr with the given `name` and `options`.
	 *
	 * @param {String} name
	 * @param {Object} options
	 * @return {Function} self
	 * @api public
	 */
	
	exports.attr = function(name, options){
	  options = options || {};
	  this.attrs[name] = options;
	
	  if ('id' === name || '_id' === name ||options.pk === true) {
	    this.attrs[name].primaryKey = true;
	    this.primaryKey = name;
	  }
	  //development mistake
	  if(this.prototype[name] != null) throw new Error('property ' + name + ' already defined');
	  //use es5-shim to avoid it on IE <9
	  if(typeof Object.defineProperty !== 'function') throw new Error('Object.defineProperty is not supported');
	  Object.defineProperty(this.prototype, name, {
	    set: function (val) {
	      var prev = this.attrs[name];
	      if (prev == val) return;
	      this.dirty[name] = val;
	      this.attrs[name] = val;
	      this.model.emit('change', this, name, val, prev);
	      this.model.emit('change ' + name, this, val, prev);
	      this.emit('change', name, val, prev);
	      this.emit('change ' + name, val, prev);
	    },
	    get: function () {
	      return this.attrs[name];
	    }
	  })
	
	  return this;
	};
	
	exports.method = function (name, fn) {
	  this.prototype[name] = fn;
	  return this;
	}
	
	exports.use = function (fn) {
	  fn(this);
	  return this;
	}


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map
