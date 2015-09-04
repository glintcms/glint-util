var decode = require('ent/decode');

module.exports = function (obj) {
  if (typeof obj != 'object') return obj;
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var val = obj[key];
      if (typeof val == 'string') {
        obj[key] = decode(val, {named: true});
      }
    }
  }
  return obj;
}
