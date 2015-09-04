var test = require('tape');
var defaults = require('../').defaults;
var merge = require('../').merge;

var a, b;

function setup() {
  a = {
    x: 1, y: 2, fn: function () {
      return 4
    }
  };
  b = {
    y: 102, z: 103, fn: function () {
      return 104
    }
  };
}


test('should merge b into a without overriding', function (t) {
  t.plan(5);
  setup();
  var obj = defaults(a, b);
  t.equal(obj, a);
  t.equal(a.x, 1);
  t.equal(a.y, 2);
  t.equal(a.fn(), 4);
  t.equal(a.z, 103);
})


test('should merge b into a with overriding', function (t) {
  t.plan(5);
  setup();
  var obj = merge(a, b);
  t.equal(obj, a);
  t.equal(a.x, 1);
  t.equal(a.y, 102);
  t.equal(a.fn(), 104);
  t.equal(a.z, 103);
})

