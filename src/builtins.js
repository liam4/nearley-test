var fs = require('fs');
var path = require('path');
var run = require('./run');
var interp = require('./interp');
var lib = require('./lib');
var C = require('./constants');
var chalk = require('chalk');

function exists(p) {
  // warning, this is synchronous
  try {
    fs.accessSync(p, fs.F_OK);
    return true;
  } catch(err) {
    return false;
  }
}

export function makeBuiltins(fsScope) {
  var variables = {};

  variables['print'] = new lib.Variable(new lib.LFunction(function(args) {
    console.log(...args.map(arg => lib.toJString(arg)));
  }));

  variables['concat'] = new lib.Variable(new lib.LFunction(function(args) {
    return lib.toLString(args.map(lib.toJString).join(''));
  }));

  variables['if'] = new lib.Variable(new lib.LFunction(function(args) {
    if (lib.toJBoolean(args[0])) {
      lib.call(args[1], []);
    } else {
      // optional `else`
      if(args[2]) lib.call(args[2], []);
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

  variables['not'] = new lib.Variable(new lib.LFunction(function([bool]) {
    return lib.toLBoolean(!lib.toJBoolean(bool));
  }));

  variables['and'] = new lib.Variable(new lib.LFunction(function([b1, b2]) {
    return lib.toLBoolean(lib.toJBoolean(b1) && lib.toJBoolean(b2));
  }));

  variables['or'] = new lib.Variable(new lib.LFunction(function([b1, b2]) {
    return lib.toLBoolean(lib.toJBoolean(b1) || lib.toJBoolean(b2));
  }));

  variables['lt'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLBoolean(lib.toJNumber(x) < lib.toJNumber(y));
  }));

  variables['gt'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLBoolean(lib.toJNumber(x) > lib.toJNumber(y));
  }));

  variables['eq'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLBoolean(lib.toJNumber(x) === lib.toJNumber(y));
  }));

  variables['loop'] = new lib.Variable(new lib.LFunction(function([fn]) {
    while (lib.toJBoolean(lib.call(fn, [])));
  }));

  variables['sleep'] = new lib.Variable(new lib.LFunction(function([time]) {
    var e = new Date().getTime() + (lib.toJNumber(time) * 1000);

    while (new Date().getTime() <= e) {
      ;
    }
  }));

  variables['use'] = new lib.Variable(new lib.LFunction(function([pathStr]) {
    var p = lib.toJString(pathStr);

    if(p.substr(0, 2) !== './') {
      p = 'tulun_modules/' + p;
    }

    var locationInBuiltins = fsScope + '/' + p;
    var ext = path.parse(p).ext;

    if(!ext) {
      locationInBuiltins += '.tul';
      ext = '.tul';

      if(!exists(locationInBuiltins)) {
        locationInBuiltins = locationInBuiltins.substr(0, locationInBuiltins.length - 3) + 'js';
        ext = '.js';
      }
    }

    if (exists(locationInBuiltins)) {
      if (ext === '.js') {
        var used = require(locationInBuiltins)(lib, fsScope);
        var usedObj = lib.toLObject(used);
        return usedObj;
      } else if (ext === '.tul') {
        var program = fs.readFileSync(locationInBuiltins).toString();
        var result = run.run(program);
        if ('exports' in result.variables) {
          return result.variables.exports.value;
        } else {
          return new lib.LObject();
        }
      } else {
        console.error(
          chalk.cyan(`use(...)`)
          +
          ': '
          +
          chalk.red(`Invalid extension ${chalk.yellow(ext)}.`)
        );
        process.exit(1);
      }
    } else {
      console.error(
        chalk.cyan(`use(...)`)
        +
        ': '
        +
        chalk.red(`Could not find module ${chalk.yellow(p)}.`)
      );
      process.exit(1);
    }
  }));

  return variables;
}
