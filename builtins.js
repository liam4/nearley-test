var lib = require('./lib');

export function makeBuiltins() {
  var variables = {};

  variables['print'] = new lib.Variable(new lib.FunctionToken(function(args) {
    console.log('{Print}', ...args);
  }));

  variables['if'] = new lib.Variable(new lib.FunctionToken(function(args) {
    console.log(args);
    if (args[0] && args[0][0] === 'BOOLEAN_PRIM' && args[0][1] === true) {
      lib.call(args[1], []);
    }
  }));

  return variables;
}
