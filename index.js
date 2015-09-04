/**
 * Module dependencies.
 */
var debug = require('debug')('glint:utils');

/**
 * requires modules. works on server and client,
 * even if the component didn't declare the dependency,
 * as long as the dependency was declared in the global component.json.
 * @param  {String} path Path to the required module.
 * @return {Object}      The required module.
 */
exports.require = function (path) {
  return exports.isBrowser ?
    exports.global.require(path) :
    require(path);
};

var _globalObj;
/**
 * Add Glint Object to the global object.
 * In the browser: window.Glint
 * In node.js: global.Glint
 * @return {[type]} [description]
 */
exports.global = (function () {
  if (_globalObj) return _globalObj;
  if (typeof window != 'undefined') _globalObj = window;
  if (typeof global != 'undefined') _globalObj = global;
  if (!_globalObj) _globalObj = this;
  return _globalObj;
}());

var isBrowser = exports.isBrowser = (function () {
  return (typeof window != 'undefined');
}());


/**
 * Let a inherit from b.
 * @param  {Function} a    Constructor Function a.
 * @param  {Function} b    Constructor Function b.
 */
exports.inherit = function (a, b) {
  var fn = function () {
  };
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
  // provide "proto" property that links to b
  a.prototype.proto = b.prototype;
};

/**
 * Extend object a with all the properties of b.
 *
 *     var a = { foo: 'bar' }
 *       , b = { bar: 'baz' };
 *
 *     utils.extend(a, b);
 *     // => a == { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a with merged properties from b
 */

exports.merge =
  exports.extend = function (a, b) {
    a = a || {};
    if (b) {
      for (var key in b) {
        a[key] = b[key];
      }
    }
    return a;
  };

/**
 * Extend object a with the missing properties of b.
 * Existing properties of a will not be overwritten.
 *
 *     var a = { foo: 'bar' }
 *       , b = { foo: 'BAR', bar: 'baz' };
 *
 *     utils.defaults(a, b);
 *     // => a == { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a with default properties from b
 */

exports.defaults = function (a, b) {
  a = a || {};
  if (b) {
    for (var key in b) {
      if (a[key] === void 0) a[key] = b[key];
    }
  }
  return a;
};


/* TODO move to Server,  Cache controller*/
/**
 * Proxies the data object with the corresponding proxy function provided in the map object.
 * The data object is cloned into a new Object that's modified and returned.
 *
 * Usage: this function can be called to proxy certain property values of a template locals object.
 *
 * How it works: For every key in the data object, the map object is searched with the same key.
 * The map value function is then called with the key as argument.
 *
 * Example:
 *
 * var data = {
 *  title: "Glint No Management Content System, GNMCS",
 *  text1: "edit me!",
 *  text2: "textarea editable, cool"
 * }
 *
 *
 * var blocks = {
 *   text1: {
 *     controller: require('glint-block-text'),
 *     selector: '[data-id=text1]'
 *   },
 *   text2: {
 *     controller: require('glint-block-template'),
 *     selector: '[data-id=text2]'
 *   }
 * };
 *
 * var locals = proxyData(data, blocks);
 * res.render('index', locals);
 *
 * @param {Object} data
 * @param {Object} blocks
 * @returns {Object} the modified data object
 */
exports.proxyData = function (data, blocks) {
  // clone data object
  var obj;
  try {
    obj = JSON.parse(JSON.stringify(data));
  } catch (e) {
    debug('could not parse data', data, e);
    return data;
  }
  // proxy object values
  Object.keys(obj).forEach(function (key) {
    var val = obj[key];
    var mv = blocks[key];
    // check if the controller shall be instantiated
    if (!mv || !mv.controller) return;
    if (mv.browser) return;
    // prepare controller options
    mv.controllerOptions = mv.controllerOptions || {};
    mv.controllerOptions.id = mv.controllerOptions.id || key;
    // instantiate the controller and call the render proxy function with the value from the data object.
    obj[key] = mv.controller(mv.controllerOptions).render(val);

  });
  return obj;
};

exports.renderBlocks = function (blocks, data) {

  var obj = {};

  if (data) {
    // clone data object
    try {
      obj = JSON.parse(JSON.stringify(data));
    } catch (e) {
      debug('could not parse data', data, e);
      if (typeof obj == 'object') {
        obj = data;
      }
    }
  }

  // proxy object values
  Object.keys(blocks).forEach(function (key) {
    var mv = blocks[key];
    var val = obj[key];
    // check if the controller shall be instantiated
    if (!mv || !mv.controller) return;
    // fill with empty string if it shall be rendered in the browser
    if (mv.browser) {
      obj[key] = '';
      return;
    }
    // prepare controller options
    mv.controllerOptions = mv.controllerOptions || {};
    mv.controllerOptions.id = mv.controllerOptions.id || key;
    // instantiate the controller and call the render proxy function with the value from the data object.
    obj[key] = mv.controller(mv.controllerOptions).render(val);

  });
  return obj;
};

exports.instantiateControllers = function (blocks) {
  var controllers = {};
  Object.keys(blocks).forEach(function (key) {
    var mv = blocks[key];
    // check if the controller shall be instantiated
    if (!mv || !mv.controller) return;

    // prepare controller options
    mv.controllerOptions = mv.controllerOptions || {};
    mv.controllerOptions.id = mv.controllerOptions.id || key;
    if (isBrowser) mv.controllerOptions.el = document.querySelector(mv.selector);
    // instantiate the controller and call the render proxy function with the value from the data object.
    controllers[key] = mv.controller(mv.controllerOptions);
  });
  return controllers;
};

/**
 * Get all nodes that match the selector and return them in an `Array`.
 *
 * @param  {Node} node          DOM Node
 * @param  {String} selector    css selector
 * @return {Array}              NodeList as Array
 */
exports.getNodes = function (node, selector) {
  var nodes = node.querySelectorAll(selector);
  var nodesArray = Array.prototype.slice.call(nodes);
  return nodesArray;
};

/**
 * Get the nodes that match the `selector` and are child nodes of the `node`,
 * but only the nodes that don't have parents that match the `selector` and are children of `node`.
 *
 * Test: http://jsfiddle.net/intesso/uAZ3y/
 *
 * @param  {Node} node          DOM Node
 * @param  {String} selector    css selector
 * @return {Array}              NodeList as Array
 */
exports.getFirstLevelNodes = function (node, selector) {
  var nodes = exports.getNodes(node, selector);
  // test that they don't have parents with the same selector that are as well children of the same starting `node`.
  return nodes.filter(function (n) {
    var p = n.parentNode;
    var parent = false;
    // test that none of the parents are part of the nodes
    while (p) {
      parent = nodes.some(function (s) {
        return p.isSameNode(s);
      });
      if (parent) return false;
      p = p.parentNode;
    }
    return true;
  });
};

exports.getId = function (path) {
  var id = path || ((exports.isBrowser) ? window.location.pathname : '');
  id = id.replace(/^\//g, ''); // remove leading slash
  id = id.replace(/\/$/g, ''); // remove ending  slash
  id = id.replace(/\//g, '-'); // replace slashes with dashes
  if (id.length == 0) id = '.' // default id
  debug("getId", path, id, exports.isBrowser);
  return id;
};

exports.callElementsFunction = function (elements, functionName, args, fn) {
  if (args && 'function' == typeof args) fn = args, args = undefined;
  for (var property in elements) {
    if (elements.hasOwnProperty(property)) {
      var element = elements[property];
      var arg = (args) ? args[property] : undefined;
      var result = element[functionName](arg);
      if (fn) fn(element, result);
    }
  }
  return elements;
};

exports.each = function(obj, name, args, fn) {
  if (!fn && args && 'function' == typeof args) fn = args, args = undefined;
  Object.keys(obj).forEach(function(key) {
    var value = obj[key];
    var arg = (args) ? args[key] : undefined;
    var result = value[name](arg);
    if (fn) fn(value, result);
  });
  return obj;
};

exports.toArray = function (obj) {
  var arr = [];
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      arr.push(obj[i]);
    }
  }
  return arr;
};

/**
 * http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
 * @param  {[type]}  x [description]
 * @param  {[type]}  y [description]
 * @return {Boolean}   [description]
 */
exports.isEqual = function (x, y) {
  if (x === y) return true;
  // if both x and y are null or undefined and exactly the same

  if (!(x instanceof Object) || !(y instanceof Object)) return false;
  // if they are not strictly equal, they both need to be Objects

  if (x.constructor !== y.constructor) return false;
  // they must have the exact same prototype chain, the closest we can do is
  // test there constructor.

  for (var p in x) {
    if (!x.hasOwnProperty(p)) continue;
    // other properties were tested using x.constructor === y.constructor

    if (!y.hasOwnProperty(p)) return false;
    // allows to compare x[ p ] and y[ p ] when set to undefined

    if (x[p] === y[p]) continue;
    // if they have the same strict value or identity then they are equal

    if (typeof(x[p]) !== "object") return false;
    // Numbers, Strings, Functions, Booleans must be strictly equal

    if (!exports.isEqual(x[p], y[p])) return false;
    // Objects and Arrays must be tested recursively
  }

  for (p in y) {
    if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
    // allows x[ p ] to be set to undefined
  }
  return true;
};

/**
 * Get the Elements that match the `selector` and are child Elements of the initial Collection `$`,
 * but only the Elements that don't have parents that match the `selector` and are children of the initial Collection `$`.
 *
 * Test: http://jsfiddle.net/intesso/AM4tb/
 *
 * @param  {Object} $           jQuery or cheerio object
 * @param  {String} selector    css selector
 * @return {Object}              jQuery or cheerio collection
 */
exports.getFirstLevelElements = function ($, $el, selector) {
  var $els = $el.find(selector);
  debug('$els', $els.length, $els.html());
  // test that they don't have parents with the same selector that are as well children of the same starting `node`.
  return $els.filter(function (i) {
    var _el = $(this);
    debug('$el filter', _el);
    var found = false;
    var $parents = $(this).parents(selector).filter(function (i) {
      if (found) return false;
      var _p = $(this);
      $els.each(function (i) {
        if (exports.isEqual($(this), _p)) {
          debug("found parent element", _p);
          found = true;
          return false;
        }
      });
      return (!found);
    });
    return (!found);
  });
};

exports.xor = function (a, b) {
  return (!a != !b);
};

exports.xnor = function (a, b) {
  return (!xor(a, b));
};

exports.getData = function getData($el) {
  var data = $el.data();
  if (!data.id) throw new Error("Attribute missing: data-id", data.block);
  return data;
};

exports.parseList = function (list, types) {
  var obj = {};
  for (var name in list) {
    var value = list[name];
    try {
      value = value.replace(/\'/g, '\"');
      value = JSON.parse(value);
      if (types) {
        var test = types.some(function (type) {
          return (typeof value == type);
        });
        if (!test) value = list[name];
      }
    } catch (e) {
      value = list[name];
    }
    obj[name] = value;
  }
  return obj;
};

exports.getOptions = function getOptions(node) {
  var attributes = node.attributes;
  var options = {};
  options.$el = node;
  for (var i = 0; i < attributes.length; i++) {
    var attribute = attributes[i];
    var name = attribute.name;
    var value = attribute.value;
    if (name.indexOf('data-') == 0) {
      name = name.substring(5);
      options[name] = value;
    }
  }
  if (!options.id) throw new Error("Attribute missing: data-id", options.block);
  return options;
};


exports.loadCss = function (attributes) {
  // setting default attributes
  if (typeof attributes === "string") {
    var href = attributes;
    attributes = {
      href: href
    };
  }
  if (!attributes.rel) {
    attributes.rel = "stylesheet"
  }
  // appending the stylesheet... just plain dom manipulations
  var styleSheet = document.createElement("link");
  for (var key in attributes) {
    styleSheet.attr(key, attributes[key]);
  }
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(styleSheet);
};
