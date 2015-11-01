/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Meta info, accessible in the global scope unless you use AMD option.
 */

require.loader = 'component';

/**
 * Internal helper object, contains a sorting function for semantiv versioning
 */
require.helper = {};
require.helper.semVerSort = function(a, b) {
  var aArray = a.version.split('.');
  var bArray = b.version.split('.');
  for (var i=0; i<aArray.length; ++i) {
    var aInt = parseInt(aArray[i], 10);
    var bInt = parseInt(bArray[i], 10);
    if (aInt === bInt) {
      var aLex = aArray[i].substr((""+aInt).length);
      var bLex = bArray[i].substr((""+bInt).length);
      if (aLex === '' && bLex !== '') return 1;
      if (aLex !== '' && bLex === '') return -1;
      if (aLex !== '' && bLex !== '') return aLex > bLex ? 1 : -1;
      continue;
    } else if (aInt > bInt) {
      return 1;
    } else {
      return -1;
    }
  }
  return 0;
}

/**
 * Find and require a module which name starts with the provided name.
 * If multiple modules exists, the highest semver is used. 
 * This function can only be used for remote dependencies.

 * @param {String} name - module name: `user~repo`
 * @param {Boolean} returnPath - returns the canonical require path if true, 
 *                               otherwise it returns the epxorted module
 */
require.latest = function (name, returnPath) {
  function showError(name) {
    throw new Error('failed to find latest module of "' + name + '"');
  }
  // only remotes with semvers, ignore local files conataining a '/'
  var versionRegexp = /(.*)~(.*)@v?(\d+\.\d+\.\d+[^\/]*)$/;
  var remoteRegexp = /(.*)~(.*)/;
  if (!remoteRegexp.test(name)) showError(name);
  var moduleNames = Object.keys(require.modules);
  var semVerCandidates = [];
  var otherCandidates = []; // for instance: name of the git branch
  for (var i=0; i<moduleNames.length; i++) {
    var moduleName = moduleNames[i];
    if (new RegExp(name + '@').test(moduleName)) {
        var version = moduleName.substr(name.length+1);
        var semVerMatch = versionRegexp.exec(moduleName);
        if (semVerMatch != null) {
          semVerCandidates.push({version: version, name: moduleName});
        } else {
          otherCandidates.push({version: version, name: moduleName});
        } 
    }
  }
  if (semVerCandidates.concat(otherCandidates).length === 0) {
    showError(name);
  }
  if (semVerCandidates.length > 0) {
    var module = semVerCandidates.sort(require.helper.semVerSort).pop().name;
    if (returnPath === true) {
      return module;
    }
    return require(module);
  }
  // if the build contains more than one branch of the same module
  // you should not use this funciton
  var module = otherCandidates.sort(function(a, b) {return a.name > b.name})[0].name;
  if (returnPath === true) {
    return module;
  }
  return require(module);
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("affix", function (exports, module) {
function offset(el) {
  if (el.getBoundingClientRect) {
      return el.getBoundingClientRect();
  }
  else {
    var x = 0, y = 0;
    do {
        x += el.offsetLeft - el.scrollLeft;
        y += el.offsetTop - el.scrollTop;
    } 
    while (el = el.offsetParent);

    return { "left": x, "top": y }
  }
}

function scrollTop(){
  if (window.pageYOffset) return window.pageYOffset;
  return document.documentElement.clientHeight
    ? document.documentElement.scrollTop
    : document.body.scrollTop;
}

function affix(el, opt) {
  if (!(this instanceof affix)) return new affix(el, opt);
  this.el = el;
  opt = opt || {};
  var p = offset(el);
  var top = p.top + document.body.scrollTop;
  this.left = p.left;
  this.bottom = opt.bottom || 0;
  this.start = opt.top ? top - opt.top : 0;
  this.top = opt.top || top;
  this.position = el.style.position;
  var check = this.checkPosition.bind(this);
  this.right = document.body.clientWidth - this.el.getBoundingClientRect().right
  window.addEventListener('scroll', check);
  setTimeout(check, 0);
}

affix.prototype.checkPosition = function () {
  var top = scrollTop();
  var h = this.el.clientHeight;
  var b = document.body.clientHeight - window.scrollY - h - this.top;
  if (b < this.bottom) {
    this.el.style.right = this.right + 'px';
    this.el.style.position = 'fixed';
    top = this.top - (this.bottom - b);
    this.el.style.top = top + 'px';
  }
  else if (top > this.start) {
    this.el.style.position = 'fixed';
    this.el.style.right = this.right + 'px';
    this.el.style.top = this.top + 'px';
  } else {
    this.el.style.position = this.position;
    this.el.style.right = '0px'
  }
}

module.exports = affix;

});

!(function () {
function elementInViewport(el) {
  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  while(el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return (
    top >= window.pageYOffset &&
    left >= window.pageXOffset &&
    (top + height) <= (window.pageYOffset + window.innerHeight) &&
    (left + width) <= (window.pageXOffset + window.innerWidth)
  );
}
var sideLinks = [].slice.call(document.querySelectorAll('#sidebar li> a'))
function highlight() {
  if (!/interpolation\.html/.test(location.pathname)) return
  var links = document.querySelectorAll('h3')
  var arr = [].slice.call(links)
  arr = arr.filter(function (el) {
    var id = el.getAttribute('id')
    return /(filter|text-interpolation|data-render)$/.test(id)
  })
  for (var i = 0, l = arr.length; i < l; i++) {
    var node = arr[i]
    if (elementInViewport(node)) {
      var el = sideLinks[i]
      sideLinks.forEach(function(l) {
        if (l === el) {
          l.classList.add('active')
        } else {
          l.classList.remove('active')
        }
      })
      break;
    }
  }
}
window.addEventListener('scroll', highlight);
var affix = require('affix');
var el = document.getElementById('sidebar');
affix(el, {
  top: 50,
  bottom: 200
});
})()
