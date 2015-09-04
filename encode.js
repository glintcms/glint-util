var encode = require('ent/encode');

module.exports = function (obj) {
  if (typeof obj != 'object') return obj;
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var val = obj[key];
      if (typeof val == 'string') {
        obj[key] = encode(val, {named: true});
      }
    }
  }
  return obj;
}
