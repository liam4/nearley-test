var lib = require('./lib');
var C = require('./constants');

export function makeBuiltins() {
  var variables = {};

  variables['print'] = new lib.Variable(new lib.FunctionToken(function(args) {
    console.log('{Print}', ...args.map(arg => lib.toJString(arg)));
  }));

  variables['if'] = new lib.Variable(new lib.FunctionToken(function(args) {
    if (lib.toJBoolean(args[0])) {
      lib.call(args[1], []);
    }
  }));

  variables['ifel'] = new lib.Variable(new lib.FunctionToken(function(args) {
    if (lib.toJBoolean(args[0])) {
      lib.call(args[1], []);
    } else {
      lib.call(args[2], []);
    }
  }));

  variables['obj'] = new lib.Variable(new lib.FunctionToken(function(args) {
    return new lib.ObjectToken();
  }));

  variables['array'] = new lib.Variable(new lib.FunctionToken(function(args) {
    return new lib.ArrayToken();
  }));

  variables['+'] = new lib.Variable(new lib.FunctionToken(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) + lib.toJNumber(y));
  }));

  variables['-'] = new lib.Variable(new lib.FunctionToken(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) - lib.toJNumber(y));
  }));

  variables['/'] = new lib.Variable(new lib.FunctionToken(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) / lib.toJNumber(y));
  }));

  variables['*'] = new lib.Variable(new lib.FunctionToken(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) * lib.toJNumber(y));
  }));

  return variables;
}
