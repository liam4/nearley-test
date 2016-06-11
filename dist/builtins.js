'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.makeBuiltins = makeBuiltins;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var path = require('path');
var run = require('./run');
var interp = require('./interp');
var lib = require('./lib');
var chalk = require('chalk');
var C = require('./constants');

function exists(p) {
  // warning, this is synchronous
  try {
    fs.accessSync(p, fs.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

function makeBuiltins(fsScope) {
  var variables = {};

  variables['print'] = new lib.Variable(new lib.LFunction(function (args) {
    var _console;

    (_console = console).log.apply(_console, (0, _toConsumableArray3.default)(args.map(function (arg) {
      var a = arg.toString() || '';
      if (a === '<Boolean true>') a = chalk.green('true'); // true
      else if (a === '<Boolean false>') a = chalk.red('false'); // false
        else if (a === '<Function>') a = chalk.magenta('function'); // function
          else if (a.substr(0, 8) === '<String ') a = '' + a.substr(8, a.length - 9); // string
            else if (a.substr(0, 8) === '<Number ') {
                if (Number(a.substr(8, a.length - 9)) % 1 === 0) a = chalk.blue('' + a.substr(8, a.length - 9)); // integer
                else a = chalk.blue('' + a.substr(8, a.length - 9)); // float
              }
      return a;
    })));
  }));

  variables['process'] = new lib.Variable(lib.toLObject({
    exit: new lib.LFunction(function (_ref) {
      var _ref2 = (0, _slicedToArray3.default)(_ref, 1);

      var code = _ref2[0];

      code = code || 0;
      process.exit(code);
    })
  }));

  variables['print-debug'] = new lib.Variable(new lib.LFunction(function (args) {
    var _console2;

    (_console2 = console).log.apply(_console2, (0, _toConsumableArray3.default)(args));
  }));

  variables['concat'] = new lib.Variable(new lib.LFunction(function (args) {
    return lib.toLString(args.map(lib.toJString).join(''));
  }));

  variables['if'] = new lib.Variable(new lib.LFunction(function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(args) {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!lib.toJBoolean(args[0])) {
                _context.next = 5;
                break;
              }

              _context.next = 3;
              return lib.call(args[1], []);

            case 3:
              _context.next = 6;
              break;

            case 5:
              // optional `else`
              if (args[2]) lib.call(args[2], []);

            case 6:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
    return function (_x) {
      return ref.apply(this, arguments);
    };
  }()));

  variables['ifel'] = new lib.Variable(new lib.LFunction(function (args) {
    if (lib.toJBoolean(args[0])) {
      lib.call(args[1], []);
    } else {
      lib.call(args[2], []);
    }
  }));

  variables['sleep'] = new lib.Variable(new lib.LFunction(function (_ref3) {
    var _ref4 = (0, _slicedToArray3.default)(_ref3, 1);

    var time = _ref4[0];

    var e = new Date().getTime() + lib.toJNumber(time) * 1000;
    while (new Date().getTime() <= e) {/* empty */}
  }));

  variables['obj'] = new lib.Variable(new lib.LFunction(function (args) {
    return new lib.LObject();
  }));

  variables['array'] = new lib.Variable(new lib.LFunction(function (args) {
    return new lib.LArray();
  }));

  variables['+'] = new lib.Variable(new lib.LFunction(function (_ref5) {
    var _ref6 = (0, _slicedToArray3.default)(_ref5, 2);

    var x = _ref6[0];
    var y = _ref6[1];

    return lib.toLNumber(lib.toJNumber(x) + lib.toJNumber(y));
  }));
  variables['add'] = variables['+'];

  variables['-'] = new lib.Variable(new lib.LFunction(function (_ref7) {
    var _ref8 = (0, _slicedToArray3.default)(_ref7, 2);

    var x = _ref8[0];
    var y = _ref8[1];

    return lib.toLNumber(lib.toJNumber(x) - lib.toJNumber(y));
  }));
  variables['minus'] = variables['-'];

  variables['/'] = new lib.Variable(new lib.LFunction(function (_ref9) {
    var _ref10 = (0, _slicedToArray3.default)(_ref9, 2);

    var x = _ref10[0];
    var y = _ref10[1];

    return lib.toLNumber(lib.toJNumber(x) / lib.toJNumber(y));
  }));
  variables['divide'] = variables['/'];

  variables['*'] = new lib.Variable(new lib.LFunction(function (_ref11) {
    var _ref12 = (0, _slicedToArray3.default)(_ref11, 2);

    var x = _ref12[0];
    var y = _ref12[1];

    return lib.toLNumber(lib.toJNumber(x) * lib.toJNumber(y));
  }));
  variables['multiply'] = variables['&'];

  variables['^'] = new lib.Variable(new lib.LFunction(function (_ref13) {
    var _ref14 = (0, _slicedToArray3.default)(_ref13, 2);

    var x = _ref14[0];
    var y = _ref14[1];

    return lib.toLNumber(Math.pow(lib.toJNumber(x), lib.toJNumber(y)));
  }));

  variables['not'] = new lib.Variable(new lib.LFunction(function (_ref15) {
    var _ref16 = (0, _slicedToArray3.default)(_ref15, 1);

    var bool = _ref16[0];

    return lib.toLBoolean(!lib.toJBoolean(bool));
  }));
  variables['!'] = variables['not'];

  variables['and'] = new lib.Variable(new lib.LFunction(function (_ref17) {
    var _ref18 = (0, _slicedToArray3.default)(_ref17, 2);

    var b1 = _ref18[0];
    var b2 = _ref18[1];

    return lib.toLBoolean(lib.toJBoolean(b1) && lib.toJBoolean(b2));
  }));
  variables['&'] = variables['and'];

  variables['or'] = new lib.Variable(new lib.LFunction(function (_ref19) {
    var _ref20 = (0, _slicedToArray3.default)(_ref19, 2);

    var b1 = _ref20[0];
    var b2 = _ref20[1];

    return lib.toLBoolean(lib.toJBoolean(b1) || lib.toJBoolean(b2));
  }));
  variables['|'] = variables['or'];

  variables['lt'] = new lib.Variable(new lib.LFunction(function (_ref21) {
    var _ref22 = (0, _slicedToArray3.default)(_ref21, 2);

    var x = _ref22[0];
    var y = _ref22[1];

    return lib.toLBoolean(lib.toJNumber(x) < lib.toJNumber(y));
  }));
  variables['<'] = variables['lt'];

  variables['gt'] = new lib.Variable(new lib.LFunction(function (_ref23) {
    var _ref24 = (0, _slicedToArray3.default)(_ref23, 2);

    var x = _ref24[0];
    var y = _ref24[1];

    return lib.toLBoolean(lib.toJNumber(x) > lib.toJNumber(y));
  }));
  variables['>'] = variables['gt'];

  variables['eq'] = new lib.Variable(new lib.LFunction(function (_ref25) {
    var _ref26 = (0, _slicedToArray3.default)(_ref25, 2);

    var x = _ref26[0];
    var y = _ref26[1];

    return lib.toLBoolean(lib.toJNumber(x) === lib.toJNumber(y));
  }));
  variables['='] = variables['eq'];

  variables['is'] = new lib.Variable(new lib.LFunction(function (_ref27) {
    var _ref28 = (0, _slicedToArray3.default)(_ref27, 2);

    var x = _ref28[0];
    var y = _ref28[1];

    return lib.toLBoolean(x.toString() === y.toString());
  }));

  variables['loop'] = new lib.Variable(new lib.LFunction(function (_ref29) {
    var _ref30 = (0, _slicedToArray3.default)(_ref29, 1);

    var fn = _ref30[0];

    while (lib.toJBoolean(lib.call(fn, []))) {/* empty */}
  }));

  variables['use'] = new lib.Variable(new lib.LFunction(function (_ref31) {
    var _ref32 = (0, _slicedToArray3.default)(_ref31, 1);

    var pathStr = _ref32[0];

    var p = lib.toJString(pathStr);
    var locationInBuiltins = fsScope + '/' + p;

    if (p.substr(0, 1) !== '.') {
      locationInBuiltins = __dirname + '/../global-modules/' + p;
    }

    var ext = path.parse(locationInBuiltins).ext;

    if (!ext) {
      locationInBuiltins += '.tul';
      ext = '.tul';

      if (!exists(locationInBuiltins)) {
        locationInBuiltins = locationInBuiltins.substr(0, locationInBuiltins.length - 3) + 'js';
        ext = '.js';
      }
    }

    if (exists(locationInBuiltins)) {
      if (ext === '.js') {
        var used = require(locationInBuiltins)(lib, fsScope);
        //var usedObj = lib.toLObject(used);
        return used;
      } else if (ext === '.tul') {
        var program = fs.readFileSync(locationInBuiltins).toString();
        var result = run.run(program);
        if ('exports' in result.variables) {
          return result.variables.exports.value;
        } else {
          return new lib.LObject();
        }
      } else {
        console.error(chalk.cyan('use(...)') + ': ' + chalk.red('Invalid extension ' + chalk.yellow(ext) + '.'));
        process.exit(1);
      }
    } else {
      console.error(chalk.cyan('use(...)') + ': ' + chalk.red('Could not find ' + chalk.yellow(p) + ' ' + chalk.white.dim('@ ' + locationInBuiltins) + '.'));
      process.exit(1);
    }
  }));

  var variableObject = new lib.LObject();

  lib.set(variableObject, 'make', new lib.LFunction(function (_ref33) {
    var _ref34 = (0, _slicedToArray3.default)(_ref33, 3);

    var env = _ref34[0];
    var name = _ref34[1];
    var value = _ref34[2];

    var v = new lib.Variable(value);
    env.vars[lib.toJString(name)] = v;
    return v;
  }));

  lib.set(variableObject, 'change', new lib.LFunction(function (_ref35) {
    var _ref36 = (0, _slicedToArray3.default)(_ref35, 2);

    var variable = _ref36[0];
    var newValue = _ref36[1];

    variable.value = newValue;
  }));

  lib.set(variableObject, 'value', new lib.LFunction(function (_ref37) {
    var _ref38 = (0, _slicedToArray3.default)(_ref37, 1);

    var variable = _ref38[0];

    return variable.value;
  }));

  lib.set(variableObject, 'from', new lib.LFunction(function (_ref39) {
    var _ref40 = (0, _slicedToArray3.default)(_ref39, 2);

    var env = _ref40[0];
    var name = _ref40[1];

    name = lib.toJString(name);
    var variable = env.vars[name];
    if (typeof variable === 'undefined') {
      throw new Error(chalk.red('Can\'t access variable ' + chalk.cyan(name) + ' because it doesn\'t exist!'));
    } else {
      return variable;
    }
  }));

  lib.set(variableObject, 'exists', new lib.LFunction(function (_ref41) {
    var _ref42 = (0, _slicedToArray3.default)(_ref41, 2);

    var env = _ref42[0];
    var name = _ref42[1];

    return lib.toLBoolean(env.vars.hasOwnProperty(lib.toJString(name)));
  }));

  variables['Variable'] = new lib.Variable(variableObject);

  var environmentObject = new lib.LObject();

  lib.set(environmentObject, 'break-to', new lib.LFunction(function (_ref43) {
    var _ref44 = (0, _slicedToArray3.default)(_ref43, 2);

    var toEnv = _ref44[0];
    var fromEnv = _ref44[1];

    fromEnv.breakToEnvironment = toEnv;
  }));

  lib.set(environmentObject, 'set-comment', new lib.LFunction(function (_ref45) {
    var _ref46 = (0, _slicedToArray3.default)(_ref45, 2);

    var env = _ref46[0];
    var comment = _ref46[1];

    env.comment = lib.toJString(comment);
  }));

  variables['Environment'] = new lib.Variable(environmentObject);

  variables['set-timeout'] = new lib.Variable(new lib.LFunction(function (_ref47) {
    var _ref48 = (0, _slicedToArray3.default)(_ref47, 2);

    var fn = _ref48[0];
    var ms = _ref48[1];

    setTimeout(function () {
      lib.call(fn, []);
    }, lib.toJNumber(ms));
  }));

  (0, _keys2.default)(variables).map(function (value, index) {
    if (variables[value]) {
      if (variables[value].value instanceof lib.LFunction) variables[value].value.builtin = true;
    }
  });

  return variables;
}
//# sourceMappingURL=builtins.js.map
