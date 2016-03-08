var lib = require('./lib');

export function makeBuiltins() {
  var variables = {};

  variables['print'] = new lib.Variable(new lib.FunctionToken(function(args) {
    console.log('{Print}', ...args);
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

  variables['class'] = new lib.Variable(new lib.FunctionToken(function(args) {
    const descriptor = args[0];
    return {
      descriptor
    };
  }));

  variables['construct'] = new lib.Variable(new lib.FunctionToken(function(args) {
    const cls = args[0];
    return {
      '__get__': function(what) {
        return lib.get(cls.descriptor, what);
      }
    };
  }));

  return variables;
}
