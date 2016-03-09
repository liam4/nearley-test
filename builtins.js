var lib = require('./lib');
var C = require('./constants');

export class ClassInstance extends lib.ObjectToken {
  constructor(cls) {
    super();
    this.cls = cls;
  }

  __get__(what) {
    // TODO: inheritence
    if (lib.has(this.cls.descriptor, what)) {
      var gotten = lib.get(this.cls.descriptor, what);
      if (gotten instanceof lib.FunctionToken) {
        return new lib.FunctionToken(args => { // arrow ftw :)
          return lib.call(gotten, [this, ...args]);
        });
      }
      return gotten;
    } else {
      return this.map.get(what);
    }
  }
}

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
    const self = new ClassInstance(cls);
    return self;
  }));

  return variables;
}
