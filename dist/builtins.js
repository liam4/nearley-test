'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _is = require('babel-runtime/core-js/object/is');

var _is2 = _interopRequireDefault(_is);

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

  variables['if'] = new lib.Variable(new lib.LFunction(function (args) {
    if (lib.toJBoolean(args[0])) {
      lib.call(args[1], []);
    } else {
      // optional `else`
      if (args[2]) lib.call(args[2], []);
    }
  }));

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

  variables['not'] = new lib.Variable(new lib.LFunction(function (_ref13) {
    var _ref14 = (0, _slicedToArray3.default)(_ref13, 1);

    var bool = _ref14[0];

    return lib.toLBoolean(!lib.toJBoolean(bool));
  }));
  variables['!'] = variables['not'];

  variables['and'] = new lib.Variable(new lib.LFunction(function (_ref15) {
    var _ref16 = (0, _slicedToArray3.default)(_ref15, 2);

    var b1 = _ref16[0];
    var b2 = _ref16[1];

    return lib.toLBoolean(lib.toJBoolean(b1) && lib.toJBoolean(b2));
  }));
  variables['&'] = variables['and'];

  variables['or'] = new lib.Variable(new lib.LFunction(function (_ref17) {
    var _ref18 = (0, _slicedToArray3.default)(_ref17, 2);

    var b1 = _ref18[0];
    var b2 = _ref18[1];

    return lib.toLBoolean(lib.toJBoolean(b1) || lib.toJBoolean(b2));
  }));
  variables['|'] = variables['or'];

  variables['lt'] = new lib.Variable(new lib.LFunction(function (_ref19) {
    var _ref20 = (0, _slicedToArray3.default)(_ref19, 2);

    var x = _ref20[0];
    var y = _ref20[1];

    return lib.toLBoolean(lib.toJNumber(x) < lib.toJNumber(y));
  }));
  variables['<'] = variables['lt'];

  variables['gt'] = new lib.Variable(new lib.LFunction(function (_ref21) {
    var _ref22 = (0, _slicedToArray3.default)(_ref21, 2);

    var x = _ref22[0];
    var y = _ref22[1];

    return lib.toLBoolean(lib.toJNumber(x) > lib.toJNumber(y));
  }));
  variables['>'] = variables['gt'];

  variables['eq'] = new lib.Variable(new lib.LFunction(function (_ref23) {
    var _ref24 = (0, _slicedToArray3.default)(_ref23, 2);

    var x = _ref24[0];
    var y = _ref24[1];

    return lib.toLBoolean(lib.toJNumber(x) === lib.toJNumber(y));
  }));
  variables['='] = variables['eq'];

  variables['is'] = new lib.Variable(new lib.LFunction(function (_ref25) {
    var _ref26 = (0, _slicedToArray3.default)(_ref25, 2);

    var x = _ref26[0];
    var y = _ref26[1];

    return lib.toLBoolean((0, _is2.default)(x, y) || x.toString() === y.toString());
  }));

  variables['loop'] = new lib.Variable(new lib.LFunction(function (_ref27) {
    var _ref28 = (0, _slicedToArray3.default)(_ref27, 1);

    var fn = _ref28[0];

    while (lib.toJBoolean(lib.call(fn, []))) {/* empty */}
  }));

  variables['use'] = new lib.Variable(new lib.LFunction(function (_ref29) {
    var _ref30 = (0, _slicedToArray3.default)(_ref29, 1);

    var pathStr = _ref30[0];

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
      console.error(chalk.cyan('use(...)') + ': ' + chalk.red('Could not find module ' + chalk.yellow(p) + '.'));
      process.exit(1);
    }
  }));

  var variableObject = new lib.LObject();

  lib.set(variableObject, 'make', new lib.LFunction(function (_ref31) {
    var _ref32 = (0, _slicedToArray3.default)(_ref31, 3);

    var env = _ref32[0];
    var name = _ref32[1];
    var value = _ref32[2];

    var v = new lib.Variable(value);
    env.vars[lib.toJString(name)] = v;
    return v;
  }));

  lib.set(variableObject, 'change', new lib.LFunction(function (_ref33) {
    var _ref34 = (0, _slicedToArray3.default)(_ref33, 2);

    var variable = _ref34[0];
    var newValue = _ref34[1];

    variable.value = newValue;
  }));

  lib.set(variableObject, 'value', new lib.LFunction(function (_ref35) {
    var _ref36 = (0, _slicedToArray3.default)(_ref35, 1);

    var variable = _ref36[0];

    return variable.value;
  }));

  lib.set(variableObject, 'from', new lib.LFunction(function (_ref37) {
    var _ref38 = (0, _slicedToArray3.default)(_ref37, 2);

    var env = _ref38[0];
    var name = _ref38[1];

    name = lib.toJString(name);
    var variable = env.vars[name];
    if (typeof variable === 'undefined') {
      throw new Error('Can\'t access variable ' + name + ' because it doesn\'t exist');
    } else {
      return variable;
    }
  }));

  lib.set(variableObject, 'exists', new lib.LFunction(function (_ref39) {
    var _ref40 = (0, _slicedToArray3.default)(_ref39, 2);

    var env = _ref40[0];
    var name = _ref40[1];

    return lib.toLBoolean(env.vars.hasOwnProperty(lib.toJString(name)));
  }));

  variables['Variable'] = new lib.Variable(variableObject);

  variables['set-timeout'] = new lib.Variable(new lib.LFunction(function (_ref41) {
    var _ref42 = (0, _slicedToArray3.default)(_ref41, 2);

    var fn = _ref42[0];
    var ms = _ref42[1];

    setTimeout(function () {
      lib.call(fn, []);
    }, lib.toJNumber(ms));
  }));

  return variables;
}
//# sourceMappingURL=data:application/json;base64,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LENBQXhCLENBbk1vQzs7QUFxTXBDLFNBQU8sU0FBUCxDQXJNb0M7Q0FBL0IiLCJmaWxlIjoiYnVpbHRpbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmNvbnN0IHJ1biA9IHJlcXVpcmUoJy4vcnVuJylcbmNvbnN0IGludGVycCA9IHJlcXVpcmUoJy4vaW50ZXJwJylcbmNvbnN0IGxpYiA9IHJlcXVpcmUoJy4vbGliJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgQyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJylcblxuZnVuY3Rpb24gZXhpc3RzKHApIHtcbiAgLy8gd2FybmluZywgdGhpcyBpcyBzeW5jaHJvbm91c1xuICB0cnkge1xuICAgIGZzLmFjY2Vzc1N5bmMocCwgZnMuRl9PSylcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUJ1aWx0aW5zKGZzU2NvcGUpIHtcbiAgbGV0IHZhcmlhYmxlcyA9IHt9XG5cbiAgdmFyaWFibGVzWydwcmludCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgY29uc29sZS5sb2coLi4uYXJncy5tYXAoYXJnID0+IHtcbiAgICAgIGxldCBhID0gYXJnLnRvU3RyaW5nKCkgfHwgJydcbiAgICAgIGlmIChhID09PSAnPEJvb2xlYW4gdHJ1ZT4nKSBhID0gY2hhbGsuZ3JlZW4oJ3RydWUnKSAvLyB0cnVlXG4gICAgICBlbHNlIGlmIChhID09PSAnPEJvb2xlYW4gZmFsc2U+JykgYSA9IGNoYWxrLnJlZCgnZmFsc2UnKSAvLyBmYWxzZVxuICAgICAgZWxzZSBpZiAoYSA9PT0gJzxGdW5jdGlvbj4nKSBhID0gY2hhbGsubWFnZW50YShgZnVuY3Rpb25gKSAvLyBmdW5jdGlvblxuICAgICAgZWxzZSBpZiAoYS5zdWJzdHIoMCwgOCkgPT09ICc8U3RyaW5nICcpIGEgPSBgJHthLnN1YnN0cig4LCBhLmxlbmd0aC05KX1gIC8vIHN0cmluZ1xuICAgICAgZWxzZSBpZiAoYS5zdWJzdHIoMCwgOCkgPT09ICc8TnVtYmVyICcpIHtcbiAgICAgICAgaWYgKE51bWJlcihhLnN1YnN0cig4LCBhLmxlbmd0aC05KSkgJSAxID09PSAwKSBhID0gY2hhbGsuYmx1ZShgJHthLnN1YnN0cig4LCBhLmxlbmd0aC05KX1gKSAvLyBpbnRlZ2VyXG4gICAgICAgIGVsc2UgYSA9IGNoYWxrLmJsdWUoYCR7YS5zdWJzdHIoOCwgYS5sZW5ndGgtOSl9YCkgLy8gZmxvYXRcbiAgICAgIH1cbiAgICAgIHJldHVybiBhXG4gICAgfSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snY29uY2F0J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gbGliLnRvTFN0cmluZyhhcmdzLm1hcChsaWIudG9KU3RyaW5nKS5qb2luKCcnKSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydpZiddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgaWYgKGxpYi50b0pCb29sZWFuKGFyZ3NbMF0pKSB7XG4gICAgICBsaWIuY2FsbChhcmdzWzFdLCBbXSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gb3B0aW9uYWwgYGVsc2VgXG4gICAgICBpZiAoYXJnc1syXSkgbGliLmNhbGwoYXJnc1syXSwgW10pXG4gICAgfVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2lmZWwnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIGlmIChsaWIudG9KQm9vbGVhbihhcmdzWzBdKSkge1xuICAgICAgbGliLmNhbGwoYXJnc1sxXSwgW10pXG4gICAgfSBlbHNlIHtcbiAgICAgIGxpYi5jYWxsKGFyZ3NbMl0sIFtdKVxuICAgIH1cbiAgfSkpXG5cbiAgdmFyaWFibGVzWydzbGVlcCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbdGltZV0pIHtcbiAgICBsZXQgZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgKGxpYi50b0pOdW1iZXIodGltZSkgKiAxMDAwKVxuICAgIHdoaWxlIChuZXcgRGF0ZSgpLmdldFRpbWUoKSA8PSBlKSB7IC8qIGVtcHR5ICovIH1cbiAgfSkpXG5cbiAgdmFyaWFibGVzWydvYmonXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBuZXcgbGliLkxPYmplY3QoKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2FycmF5J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gbmV3IGxpYi5MQXJyYXkoKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJysnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobGliLnRvSk51bWJlcih4KSArIGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJ2FkZCddID0gdmFyaWFibGVzWycrJ11cblxuICB2YXJpYWJsZXNbJy0nXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobGliLnRvSk51bWJlcih4KSAtIGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJ21pbnVzJ10gPSB2YXJpYWJsZXNbJy0nXVxuXG4gIHZhcmlhYmxlc1snLyddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihsaWIudG9KTnVtYmVyKHgpIC8gbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snZGl2aWRlJ10gPSB2YXJpYWJsZXNbJy8nXVxuXG4gIHZhcmlhYmxlc1snKiddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihsaWIudG9KTnVtYmVyKHgpICogbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snbXVsdGlwbHknXSA9IHZhcmlhYmxlc1snJiddXG5cbiAgdmFyaWFibGVzWydub3QnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2Jvb2xdKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKCFsaWIudG9KQm9vbGVhbihib29sKSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snISddID0gdmFyaWFibGVzWydub3QnXVxuXG4gIHZhcmlhYmxlc1snYW5kJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtiMSwgYjJdKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pCb29sZWFuKGIxKSAmJiBsaWIudG9KQm9vbGVhbihiMikpXG4gIH0pKVxuICB2YXJpYWJsZXNbJyYnXSA9IHZhcmlhYmxlc1snYW5kJ11cblxuICB2YXJpYWJsZXNbJ29yJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtiMSwgYjJdKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pCb29sZWFuKGIxKSB8fCBsaWIudG9KQm9vbGVhbihiMikpXG4gIH0pKVxuICB2YXJpYWJsZXNbJ3wnXSA9IHZhcmlhYmxlc1snb3InXVxuXG4gIHZhcmlhYmxlc1snbHQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pOdW1iZXIoeCkgPCBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcbiAgdmFyaWFibGVzWyc8J10gPSB2YXJpYWJsZXNbJ2x0J11cblxuICB2YXJpYWJsZXNbJ2d0J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KTnVtYmVyKHgpID4gbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snPiddID0gdmFyaWFibGVzWydndCddXG5cbiAgdmFyaWFibGVzWydlcSddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSk51bWJlcih4KSA9PT0gbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snPSddID0gdmFyaWFibGVzWydlcSddXG5cbiAgdmFyaWFibGVzWydpcyddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4oT2JqZWN0LmlzKHgsIHkpIHx8IHgudG9TdHJpbmcoKSA9PT0geS50b1N0cmluZygpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2xvb3AnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2ZuXSkge1xuICAgIHdoaWxlIChsaWIudG9KQm9vbGVhbihsaWIuY2FsbChmbiwgW10pKSkgeyAvKiBlbXB0eSAqLyB9XG4gIH0pKVxuXG4gIHZhcmlhYmxlc1sndXNlJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtwYXRoU3RyXSkge1xuICAgIGxldCBwID0gbGliLnRvSlN0cmluZyhwYXRoU3RyKVxuICAgIGxldCBsb2NhdGlvbkluQnVpbHRpbnMgPSBgJHtmc1Njb3BlfS8ke3B9YFxuXG4gICAgaWYgKHAuc3Vic3RyKDAsIDEpICE9PSAnLicpIHtcbiAgICAgIGxvY2F0aW9uSW5CdWlsdGlucyA9IGAke19fZGlybmFtZX0vLi4vZ2xvYmFsLW1vZHVsZXMvJHtwfWBcbiAgICB9XG5cbiAgICBsZXQgZXh0ID0gcGF0aC5wYXJzZShsb2NhdGlvbkluQnVpbHRpbnMpLmV4dFxuXG4gICAgaWYgKCFleHQpIHtcbiAgICAgIGxvY2F0aW9uSW5CdWlsdGlucyArPSAnLnR1bCdcbiAgICAgIGV4dCA9ICcudHVsJ1xuXG4gICAgICBpZiAoIWV4aXN0cyhsb2NhdGlvbkluQnVpbHRpbnMpKSB7XG4gICAgICAgIGxvY2F0aW9uSW5CdWlsdGlucyA9IGAke2xvY2F0aW9uSW5CdWlsdGlucy5zdWJzdHIoMCwgbG9jYXRpb25JbkJ1aWx0aW5zLmxlbmd0aCAtIDMpfWpzYFxuICAgICAgICBleHQgPSAnLmpzJ1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChleGlzdHMobG9jYXRpb25JbkJ1aWx0aW5zKSkge1xuICAgICAgaWYgKGV4dCA9PT0gJy5qcycpIHtcbiAgICAgICAgbGV0IHVzZWQgPSByZXF1aXJlKGxvY2F0aW9uSW5CdWlsdGlucykobGliLCBmc1Njb3BlKVxuICAgICAgICAvL3ZhciB1c2VkT2JqID0gbGliLnRvTE9iamVjdCh1c2VkKTtcbiAgICAgICAgcmV0dXJuIHVzZWRcbiAgICAgIH0gZWxzZSBpZiAoZXh0ID09PSAnLnR1bCcpIHtcbiAgICAgICAgbGV0IHByb2dyYW0gPSBmcy5yZWFkRmlsZVN5bmMobG9jYXRpb25JbkJ1aWx0aW5zKS50b1N0cmluZygpXG4gICAgICAgIGxldCByZXN1bHQgPSBydW4ucnVuKHByb2dyYW0pXG4gICAgICAgIGlmICgnZXhwb3J0cycgaW4gcmVzdWx0LnZhcmlhYmxlcykge1xuICAgICAgICAgIHJldHVybiByZXN1bHQudmFyaWFibGVzLmV4cG9ydHMudmFsdWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV3IGxpYi5MT2JqZWN0KClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICBjaGFsay5jeWFuKGB1c2UoLi4uKWApXG4gICAgICAgICAgK1xuICAgICAgICAgICc6ICdcbiAgICAgICAgICArXG4gICAgICAgICAgY2hhbGsucmVkKGBJbnZhbGlkIGV4dGVuc2lvbiAke2NoYWxrLnllbGxvdyhleHQpfS5gKVxuICAgICAgICApXG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICBjaGFsay5jeWFuKGB1c2UoLi4uKWApXG4gICAgICAgICtcbiAgICAgICAgJzogJ1xuICAgICAgICArXG4gICAgICAgIGNoYWxrLnJlZChgQ291bGQgbm90IGZpbmQgbW9kdWxlICR7Y2hhbGsueWVsbG93KHApfS5gKVxuICAgICAgKVxuICAgICAgcHJvY2Vzcy5leGl0KDEpXG4gICAgfVxuICB9KSlcblxuICBsZXQgdmFyaWFibGVPYmplY3QgPSBuZXcgbGliLkxPYmplY3QoKVxuXG4gIGxpYi5zZXQodmFyaWFibGVPYmplY3QsICdtYWtlJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2VudiwgbmFtZSwgdmFsdWVdKSB7XG4gICAgbGV0IHYgPSBuZXcgbGliLlZhcmlhYmxlKHZhbHVlKVxuICAgIGVudi52YXJzW2xpYi50b0pTdHJpbmcobmFtZSldID0gdlxuICAgIHJldHVybiB2XG4gIH0pKVxuXG4gIGxpYi5zZXQodmFyaWFibGVPYmplY3QsICdjaGFuZ2UnLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbdmFyaWFibGUsIG5ld1ZhbHVlXSkge1xuICAgIHZhcmlhYmxlLnZhbHVlID0gbmV3VmFsdWVcbiAgfSkpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ3ZhbHVlJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3ZhcmlhYmxlXSkge1xuICAgIHJldHVybiB2YXJpYWJsZS52YWx1ZVxuICB9KSlcblxuICBsaWIuc2V0KHZhcmlhYmxlT2JqZWN0LCAnZnJvbScsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtlbnYsIG5hbWVdKSB7XG4gICAgbmFtZSA9IGxpYi50b0pTdHJpbmcobmFtZSlcbiAgICBsZXQgdmFyaWFibGUgPSBlbnYudmFyc1tuYW1lXVxuICAgIGlmICh0eXBlb2YgdmFyaWFibGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGFjY2VzcyB2YXJpYWJsZSAke25hbWV9IGJlY2F1c2UgaXQgZG9lc24ndCBleGlzdGApXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YXJpYWJsZVxuICAgIH1cbiAgfSkpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ2V4aXN0cycsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtlbnYsIG5hbWVdKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGVudi52YXJzLmhhc093blByb3BlcnR5KGxpYi50b0pTdHJpbmcobmFtZSkpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ1ZhcmlhYmxlJ10gPSBuZXcgbGliLlZhcmlhYmxlKHZhcmlhYmxlT2JqZWN0KVxuXG4gIHJldHVybiB2YXJpYWJsZXNcbn1cbiJdfQ==