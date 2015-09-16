module.exports = function each(obj, name, args, fn) {
  if (!fn && args && 'function' == typeof args) fn = args, args = undefined;
  var proxy = {};
  Object.keys(obj).forEach(function (key) {
    var instance = obj[key];
    var arg = (args) ? args[key] : undefined;
    var result = instance[name](arg);
    if (fn) fn(instance, result);
    proxy[key] = result;
  });
  return proxy;
};