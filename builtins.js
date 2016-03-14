var fs = require('fs');
var lib = require('./lib');
var C = require('./constants');

function exists(p) {
  // warning, this is synchronous
  try {
    fs.accessSync(p, fs.F_OK);
    return true;
  } catch(err) {
    return false;
  }
}

export function makeBuiltins() {
  var variables = {};

  variables['print'] = new lib.Variable(new lib.LFunction(function(args) {
    console.log('{Print}', ...args.map(arg => lib.toJString(arg)));
  }));

  variables['if'] = new lib.Variable(new lib.LFunction(function(args) {
    if (lib.toJBoolean(args[0])) {
      lib.call(args[1], []);
    }
  }));

  variables['ifel'] = new lib.Variable(new lib.LFunction(function(args) {
    if (lib.toJBoolean(args[0])) {
      lib.call(args[1], []);
    } else {
      lib.call(args[2], []);
    }
  }));

  variables['obj'] = new lib.Variable(new lib.LFunction(function(args) {
    return new lib.LObject();
  }));

  variables['array'] = new lib.Variable(new lib.LFunction(function(args) {
    return new lib.LArray();
  }));

  variables['+'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) + lib.toJNumber(y));
  }));

  variables['-'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) - lib.toJNumber(y));
  }));

  variables['/'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) / lib.toJNumber(y));
  }));

  variables['*'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) * lib.toJNumber(y));
  }));

  variables['use'] = new lib.Variable(new lib.LFunction(function([pathStr]) {
    var p = lib.toJString(pathStr);
    var locationInBuiltins = './builtin_lib/' + p;
    if (exists(locationInBuiltins)) {
      var used = require(locationInBuiltins);
      var usedObj = lib.toLObject(used);
      return usedObj;
    } else {
      console.log('file not found');
    }
  }));

  return variables;
}
