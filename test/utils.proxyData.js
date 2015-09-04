var test = require('tape');
var proxyData = require('../').proxyData;

var data;
function setup() {
  data = {
    title: 'TITLE',
    text1: 'hoho',
    text2: 'brrr'
  }
}


var metadata = {
  text1: {
    controller: function () {
      return {
        render: function render(content) {
          return content;
        }
      }
    },
    selector: '#text1'
  },
  text2: {
    controller: function () {
      return {
        render: function render(content) {
          return 'modified-' + content;
        }
      }
    },
    selector: '[data-id=text2]'
  }
};

test('should merge b into a without overriding', function (t) {
  t.plan(3);
  setup();
  var obj = proxyData(data, metadata);
  t.notEqual(obj, data);
  t.equal(obj.text1, 'hoho');
  t.equal(obj.text2, 'modified-brrr');
})


