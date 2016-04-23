const fs = require('fs')
const path = require('path')
const run = require('./run')
const interp = require('./interp')
const lib = require('./lib')
const C = require('./constants')

function exists(p) {
  // warning, this is synchronous
  try {
    fs.accessSync(p, fs.F_OK)
    return true
  } catch(err) {
    return false
  }
}

export function makeBuiltins() {
  let variables = {}

  variables['print'] = new lib.Variable(new lib.LFunction(function(args) {
    console.log('{Print}', ...args.map(arg => lib.toJString(arg)))
  }))

  variables['concat'] = new lib.Variable(new lib.LFunction(function(args) {
    return lib.toLString(args.map(lib.toJString).join(''))
  }))

  variables['if'] = new lib.Variable(new lib.LFunction(function(args) {
    if(lib.toJBoolean(args[0])) {
      lib.call(args[1], [])
    } else {
      // optional `else`
      if(args[2]) lib.call(args[2], [])
    }
  }))

  variables['ifel'] = new lib.Variable(new lib.LFunction(function(args) {
    if(lib.toJBoolean(args[0])) {
      lib.call(args[1], [])
    } else {
      lib.call(args[2], [])
    }
  }))

  variables['obj'] = new lib.Variable(new lib.LFunction(function(args) {
    return new lib.LObject()
  }))

  variables['array'] = new lib.Variable(new lib.LFunction(function(args) {
    return new lib.LArray()
  }))

  variables['+'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) + lib.toJNumber(y))
  }))

  variables['-'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) - lib.toJNumber(y))
  }))

  variables['/'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) / lib.toJNumber(y))
  }))

  variables['*'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) * lib.toJNumber(y))
  }))

  variables['not'] = new lib.Variable(new lib.LFunction(function([bool]) {
    return lib.toLBoolean(!lib.toJBoolean(bool))
  }))

  variables['and'] = new lib.Variable(new lib.LFunction(function([b1, b2]) {
    return lib.toLBoolean(lib.toJBoolean(b1) && lib.toJBoolean(b2))
  }))

  variables['or'] = new lib.Variable(new lib.LFunction(function([b1, b2]) {
    return lib.toLBoolean(lib.toJBoolean(b1) || lib.toJBoolean(b2))
  }))

  variables['lt'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLBoolean(lib.toJNumber(x) < lib.toJNumber(y))
  }))

  variables['gt'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLBoolean(lib.toJNumber(x) > lib.toJNumber(y))
  }))

  variables['eq'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLBoolean(lib.toJNumber(x) === lib.toJNumber(y))
  }))

  variables['is'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return Object.is(x, y);
  }));

  variables['loop'] = new lib.Variable(new lib.LFunction(function([fn]) {
    while(lib.toJBoolean(lib.call(fn, [])));
  }))

  variables['use'] = new lib.Variable(new lib.LFunction(function([pathStr]) {
    let p = lib.toJString(pathStr)
    let locationInBuiltins = `${__dirname}/builtin_lib/${p}`
    console.log('location in bulitins:', locationInBuiltins)
    let ext = path.parse(p).ext
    if(exists(locationInBuiltins)) {
      if(ext === '.js') {
        let used = require(locationInBuiltins)
        let usedObj = lib.toLObject(used)
        return usedObj
      } else if(ext === '.tul') {
        let program = fs.readFileSync(locationInBuiltins).toString()
        let result = run.run(program)
        if('exports' in result.variables) {
          return result.variables.exports.value
        } else {
          return new lib.LObject()
        }
      } else {
        throw `Invalid use extension of ${p}`
      }
    } else {
      console.log('File not found')
    }
  }))

  variables['variable_make'] = new lib.Variable(new lib.LFunction(function([env, name, value]) {
    var v = new lib.Variable(value);
    env.vars[lib.toJString(name)] = v;
    return v;
  }));

  variables['variable_change'] = new lib.Variable(new lib.LFunction(function([variable, newValue]) {
    variable.value = newValue;
  }));

  variables['variable_value'] = new lib.Variable(new lib.LFunction(function([variable]) {
    return variable.value;
  }));

  variables['variable_raw'] = new lib.Variable(new lib.LFunction(function([env, name]) {
    var name = lib.toJString(name);
    var variable = env.vars[name];
    if (typeof variable === 'undefined') {
      throw new Error(`Can't access raw variable ${name} because it doesn't exist`);
    } else {
      return variable;
    }
  }));

  variables['variable_exists'] = new lib.Variable(new lib.LFunction(function([env, name]) {
    return lib.toLBoolean(env.vars.hasOwnProperty(lib.toJString(name)));
  }));

  // variables['set_timeout'] = new lib.Variable(new lib.LFunction(function([fn, ms]) {
  //   setTimeout(function() {
  //     lib.call(fn);
  //   }, lib.toJNumber(ms));
  // }));

  return variables
}
