'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.makeBuiltins = makeBuiltins;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

    (_console = console).log.apply(_console, _toConsumableArray(args.map(function (arg) {
      var a = lib.toJString(arg);
      if (a == '<Boolean true>') a = chalk.green('true');
      if (a == '<Boolean false>') a = chalk.red('false');
      return a;
    })));
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

  variables['sleep'] = new lib.Variable(new lib.LFunction(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 1);

    var time = _ref2[0];

    var e = new Date().getTime() + lib.toJNumber(time) * 1000;
    while (new Date().getTime() <= e) {/* empty */}
  }));

  variables['obj'] = new lib.Variable(new lib.LFunction(function (args) {
    return new lib.LObject();
  }));

  variables['array'] = new lib.Variable(new lib.LFunction(function (args) {
    return new lib.LArray();
  }));

  variables['+'] = new lib.Variable(new lib.LFunction(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2);

    var x = _ref4[0];
    var y = _ref4[1];

    return lib.toLNumber(lib.toJNumber(x) + lib.toJNumber(y));
  }));
  variables['add'] = variables['+'];

  variables['-'] = new lib.Variable(new lib.LFunction(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2);

    var x = _ref6[0];
    var y = _ref6[1];

    return lib.toLNumber(lib.toJNumber(x) - lib.toJNumber(y));
  }));
  variables['minus'] = variables['-'];

  variables['/'] = new lib.Variable(new lib.LFunction(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2);

    var x = _ref8[0];
    var y = _ref8[1];

    return lib.toLNumber(lib.toJNumber(x) / lib.toJNumber(y));
  }));
  variables['divide'] = variables['/'];

  variables['*'] = new lib.Variable(new lib.LFunction(function (_ref9) {
    var _ref10 = _slicedToArray(_ref9, 2);

    var x = _ref10[0];
    var y = _ref10[1];

    return lib.toLNumber(lib.toJNumber(x) * lib.toJNumber(y));
  }));
  variables['multiply'] = variables['&'];

  variables['not'] = new lib.Variable(new lib.LFunction(function (_ref11) {
    var _ref12 = _slicedToArray(_ref11, 1);

    var bool = _ref12[0];

    return lib.toLBoolean(!lib.toJBoolean(bool));
  }));
  variables['!'] = variables['not'];

  variables['and'] = new lib.Variable(new lib.LFunction(function (_ref13) {
    var _ref14 = _slicedToArray(_ref13, 2);

    var b1 = _ref14[0];
    var b2 = _ref14[1];

    return lib.toLBoolean(lib.toJBoolean(b1) && lib.toJBoolean(b2));
  }));
  variables['&'] = variables['and'];

  variables['or'] = new lib.Variable(new lib.LFunction(function (_ref15) {
    var _ref16 = _slicedToArray(_ref15, 2);

    var b1 = _ref16[0];
    var b2 = _ref16[1];

    return lib.toLBoolean(lib.toJBoolean(b1) || lib.toJBoolean(b2));
  }));
  variables['|'] = variables['or'];

  variables['lt'] = new lib.Variable(new lib.LFunction(function (_ref17) {
    var _ref18 = _slicedToArray(_ref17, 2);

    var x = _ref18[0];
    var y = _ref18[1];

    return lib.toLBoolean(lib.toJNumber(x) < lib.toJNumber(y));
  }));
  variables['<'] = variables['lt'];

  variables['gt'] = new lib.Variable(new lib.LFunction(function (_ref19) {
    var _ref20 = _slicedToArray(_ref19, 2);

    var x = _ref20[0];
    var y = _ref20[1];

    return lib.toLBoolean(lib.toJNumber(x) > lib.toJNumber(y));
  }));
  variables['>'] = variables['gt'];

  variables['eq'] = new lib.Variable(new lib.LFunction(function (_ref21) {
    var _ref22 = _slicedToArray(_ref21, 2);

    var x = _ref22[0];
    var y = _ref22[1];

    return lib.toLBoolean(lib.toJNumber(x) === lib.toJNumber(y));
  }));
  variables['='] = variables['eq'];

  variables['is'] = new lib.Variable(new lib.LFunction(function (_ref23) {
    var _ref24 = _slicedToArray(_ref23, 2);

    var x = _ref24[0];
    var y = _ref24[1];

    return lib.toLBoolean(Object.is(x, y) || x.toString() === y.toString());
  }));

  variables['loop'] = new lib.Variable(new lib.LFunction(function (_ref25) {
    var _ref26 = _slicedToArray(_ref25, 1);

    var fn = _ref26[0];

    while (lib.toJBoolean(lib.call(fn, []))) {/* empty */}
  }));

  variables['use'] = new lib.Variable(new lib.LFunction(function (_ref27) {
    var _ref28 = _slicedToArray(_ref27, 1);

    var pathStr = _ref28[0];

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

  lib.set(variableObject, 'make', new lib.LFunction(function (_ref29) {
    var _ref30 = _slicedToArray(_ref29, 3);

    var env = _ref30[0];
    var name = _ref30[1];
    var value = _ref30[2];

    var v = new lib.Variable(value);
    env.vars[lib.toJString(name)] = v;
    return v;
  }));

  lib.set(variableObject, 'change', new lib.LFunction(function (_ref31) {
    var _ref32 = _slicedToArray(_ref31, 2);

    var variable = _ref32[0];
    var newValue = _ref32[1];

    variable.value = newValue;
  }));

  lib.set(variableObject, 'value', new lib.LFunction(function (_ref33) {
    var _ref34 = _slicedToArray(_ref33, 1);

    var variable = _ref34[0];

    return variable.value;
  }));

  lib.set(variableObject, 'from', new lib.LFunction(function (_ref35) {
    var _ref36 = _slicedToArray(_ref35, 2);

    var env = _ref36[0];
    var name = _ref36[1];

    name = lib.toJString(name);
    var variable = env.vars[name];
    if (typeof variable === 'undefined') {
      throw new Error('Can\'t access variable ' + name + ' because it doesn\'t exist');
    } else {
      return variable;
    }
  }));

  lib.set(variableObject, 'exists', new lib.LFunction(function (_ref37) {
    var _ref38 = _slicedToArray(_ref37, 2);

    var env = _ref38[0];
    var name = _ref38[1];

    return lib.toLBoolean(env.vars.hasOwnProperty(lib.toJString(name)));
  }));

  variables['Variable'] = new lib.Variable(variableObject);

  return variables;
}
//# sourceMappingURL=data:application/json;base64,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QjtBQUFBOztBQUFBLFFBQVosR0FBWTtBQUFBLFFBQVAsSUFBTzs7QUFDeEUsV0FBTyxJQUFJLFVBQUosQ0FBZSxJQUFJLElBQUosQ0FBUyxjQUFULENBQXdCLElBQUksU0FBSixDQUFjLElBQWQsQ0FBeEIsQ0FBZixDQUFQO0FBQ0QsR0FGaUMsQ0FBbEM7O0FBSUEsWUFBVSxVQUFWLElBQXdCLElBQUksSUFBSSxRQUFSLENBQWlCLGNBQWpCLENBQXhCOztBQUVBLFNBQU8sU0FBUDtBQUNEIiwiZmlsZSI6ImJ1aWx0aW5zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5jb25zdCBydW4gPSByZXF1aXJlKCcuL3J1bicpXG5jb25zdCBpbnRlcnAgPSByZXF1aXJlKCcuL2ludGVycCcpXG5jb25zdCBsaWIgPSByZXF1aXJlKCcuL2xpYicpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IEMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpXG5cbmZ1bmN0aW9uIGV4aXN0cyhwKSB7XG4gIC8vIHdhcm5pbmcsIHRoaXMgaXMgc3luY2hyb25vdXNcbiAgdHJ5IHtcbiAgICBmcy5hY2Nlc3NTeW5jKHAsIGZzLkZfT0spXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VCdWlsdGlucyhmc1Njb3BlKSB7XG4gIGxldCB2YXJpYWJsZXMgPSB7fVxuXG4gIHZhcmlhYmxlc1sncHJpbnQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIGNvbnNvbGUubG9nKC4uLmFyZ3MubWFwKGFyZyA9PiB7XG4gICAgICBsZXQgYSA9IGxpYi50b0pTdHJpbmcoYXJnKVxuICAgICAgaWYgKGEgPT0gJzxCb29sZWFuIHRydWU+JykgYSA9IGNoYWxrLmdyZWVuKCd0cnVlJylcbiAgICAgIGlmIChhID09ICc8Qm9vbGVhbiBmYWxzZT4nKSBhID0gY2hhbGsucmVkKCdmYWxzZScpXG4gICAgICByZXR1cm4gYVxuICAgIH0pKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2NvbmNhdCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGxpYi50b0xTdHJpbmcoYXJncy5tYXAobGliLnRvSlN0cmluZykuam9pbignJykpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snaWYnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIGlmIChsaWIudG9KQm9vbGVhbihhcmdzWzBdKSkge1xuICAgICAgbGliLmNhbGwoYXJnc1sxXSwgW10pXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG9wdGlvbmFsIGBlbHNlYFxuICAgICAgaWYgKGFyZ3NbMl0pIGxpYi5jYWxsKGFyZ3NbMl0sIFtdKVxuICAgIH1cbiAgfSkpXG5cbiAgdmFyaWFibGVzWydpZmVsJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBpZiAobGliLnRvSkJvb2xlYW4oYXJnc1swXSkpIHtcbiAgICAgIGxpYi5jYWxsKGFyZ3NbMV0sIFtdKVxuICAgIH0gZWxzZSB7XG4gICAgICBsaWIuY2FsbChhcmdzWzJdLCBbXSlcbiAgICB9XG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snc2xlZXAnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3RpbWVdKSB7XG4gICAgbGV0IGUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSArIChsaWIudG9KTnVtYmVyKHRpbWUpICogMTAwMClcbiAgICB3aGlsZSAobmV3IERhdGUoKS5nZXRUaW1lKCkgPD0gZSkgeyAvKiBlbXB0eSAqLyB9XG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snb2JqJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gbmV3IGxpYi5MT2JqZWN0KClcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydhcnJheSddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIG5ldyBsaWIuTEFycmF5KClcbiAgfSkpXG5cbiAgdmFyaWFibGVzWycrJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKGxpYi50b0pOdW1iZXIoeCkgKyBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcbiAgdmFyaWFibGVzWydhZGQnXSA9IHZhcmlhYmxlc1snKyddXG5cbiAgdmFyaWFibGVzWyctJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKGxpYi50b0pOdW1iZXIoeCkgLSBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcbiAgdmFyaWFibGVzWydtaW51cyddID0gdmFyaWFibGVzWyctJ11cblxuICB2YXJpYWJsZXNbJy8nXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobGliLnRvSk51bWJlcih4KSAvIGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJ2RpdmlkZSddID0gdmFyaWFibGVzWycvJ11cblxuICB2YXJpYWJsZXNbJyonXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobGliLnRvSk51bWJlcih4KSAqIGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJ211bHRpcGx5J10gPSB2YXJpYWJsZXNbJyYnXVxuXG4gIHZhcmlhYmxlc1snbm90J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtib29sXSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbighbGliLnRvSkJvb2xlYW4oYm9vbCkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJyEnXSA9IHZhcmlhYmxlc1snbm90J11cblxuICB2YXJpYWJsZXNbJ2FuZCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbYjEsIGIyXSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KQm9vbGVhbihiMSkgJiYgbGliLnRvSkJvb2xlYW4oYjIpKVxuICB9KSlcbiAgdmFyaWFibGVzWycmJ10gPSB2YXJpYWJsZXNbJ2FuZCddXG5cbiAgdmFyaWFibGVzWydvciddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbYjEsIGIyXSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KQm9vbGVhbihiMSkgfHwgbGliLnRvSkJvb2xlYW4oYjIpKVxuICB9KSlcbiAgdmFyaWFibGVzWyd8J10gPSB2YXJpYWJsZXNbJ29yJ11cblxuICB2YXJpYWJsZXNbJ2x0J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KTnVtYmVyKHgpIDwgbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snPCddID0gdmFyaWFibGVzWydsdCddXG5cbiAgdmFyaWFibGVzWydndCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSk51bWJlcih4KSA+IGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJz4nXSA9IHZhcmlhYmxlc1snZ3QnXVxuXG4gIHZhcmlhYmxlc1snZXEnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pOdW1iZXIoeCkgPT09IGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJz0nXSA9IHZhcmlhYmxlc1snZXEnXVxuXG4gIHZhcmlhYmxlc1snaXMnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKE9iamVjdC5pcyh4LCB5KSB8fCB4LnRvU3RyaW5nKCkgPT09IHkudG9TdHJpbmcoKSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydsb29wJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtmbl0pIHtcbiAgICB3aGlsZSAobGliLnRvSkJvb2xlYW4obGliLmNhbGwoZm4sIFtdKSkpIHsgLyogZW1wdHkgKi8gfVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ3VzZSddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbcGF0aFN0cl0pIHtcbiAgICBsZXQgcCA9IGxpYi50b0pTdHJpbmcocGF0aFN0cilcbiAgICBsZXQgbG9jYXRpb25JbkJ1aWx0aW5zID0gYCR7ZnNTY29wZX0vJHtwfWBcblxuICAgIGlmIChwLnN1YnN0cigwLCAxKSAhPT0gJy4nKSB7XG4gICAgICBsb2NhdGlvbkluQnVpbHRpbnMgPSBgJHtfX2Rpcm5hbWV9Ly4uL2dsb2JhbC1tb2R1bGVzLyR7cH1gXG4gICAgfVxuXG4gICAgbGV0IGV4dCA9IHBhdGgucGFyc2UobG9jYXRpb25JbkJ1aWx0aW5zKS5leHRcblxuICAgIGlmICghZXh0KSB7XG4gICAgICBsb2NhdGlvbkluQnVpbHRpbnMgKz0gJy50dWwnXG4gICAgICBleHQgPSAnLnR1bCdcblxuICAgICAgaWYgKCFleGlzdHMobG9jYXRpb25JbkJ1aWx0aW5zKSkge1xuICAgICAgICBsb2NhdGlvbkluQnVpbHRpbnMgPSBgJHtsb2NhdGlvbkluQnVpbHRpbnMuc3Vic3RyKDAsIGxvY2F0aW9uSW5CdWlsdGlucy5sZW5ndGggLSAzKX1qc2BcbiAgICAgICAgZXh0ID0gJy5qcydcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZXhpc3RzKGxvY2F0aW9uSW5CdWlsdGlucykpIHtcbiAgICAgIGlmIChleHQgPT09ICcuanMnKSB7XG4gICAgICAgIGxldCB1c2VkID0gcmVxdWlyZShsb2NhdGlvbkluQnVpbHRpbnMpKGxpYiwgZnNTY29wZSlcbiAgICAgICAgLy92YXIgdXNlZE9iaiA9IGxpYi50b0xPYmplY3QodXNlZCk7XG4gICAgICAgIHJldHVybiB1c2VkXG4gICAgICB9IGVsc2UgaWYgKGV4dCA9PT0gJy50dWwnKSB7XG4gICAgICAgIGxldCBwcm9ncmFtID0gZnMucmVhZEZpbGVTeW5jKGxvY2F0aW9uSW5CdWlsdGlucykudG9TdHJpbmcoKVxuICAgICAgICBsZXQgcmVzdWx0ID0gcnVuLnJ1bihwcm9ncmFtKVxuICAgICAgICBpZiAoJ2V4cG9ydHMnIGluIHJlc3VsdC52YXJpYWJsZXMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LnZhcmlhYmxlcy5leHBvcnRzLnZhbHVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBsaWIuTE9iamVjdCgpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgY2hhbGsuY3lhbihgdXNlKC4uLilgKVxuICAgICAgICAgICtcbiAgICAgICAgICAnOiAnXG4gICAgICAgICAgK1xuICAgICAgICAgIGNoYWxrLnJlZChgSW52YWxpZCBleHRlbnNpb24gJHtjaGFsay55ZWxsb3coZXh0KX0uYClcbiAgICAgICAgKVxuICAgICAgICBwcm9jZXNzLmV4aXQoMSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgY2hhbGsuY3lhbihgdXNlKC4uLilgKVxuICAgICAgICArXG4gICAgICAgICc6ICdcbiAgICAgICAgK1xuICAgICAgICBjaGFsay5yZWQoYENvdWxkIG5vdCBmaW5kIG1vZHVsZSAke2NoYWxrLnllbGxvdyhwKX0uYClcbiAgICAgIClcbiAgICAgIHByb2Nlc3MuZXhpdCgxKVxuICAgIH1cbiAgfSkpXG5cbiAgbGV0IHZhcmlhYmxlT2JqZWN0ID0gbmV3IGxpYi5MT2JqZWN0KClcblxuICBsaWIuc2V0KHZhcmlhYmxlT2JqZWN0LCAnbWFrZScsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtlbnYsIG5hbWUsIHZhbHVlXSkge1xuICAgIGxldCB2ID0gbmV3IGxpYi5WYXJpYWJsZSh2YWx1ZSlcbiAgICBlbnYudmFyc1tsaWIudG9KU3RyaW5nKG5hbWUpXSA9IHZcbiAgICByZXR1cm4gdlxuICB9KSlcblxuICBsaWIuc2V0KHZhcmlhYmxlT2JqZWN0LCAnY2hhbmdlJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3ZhcmlhYmxlLCBuZXdWYWx1ZV0pIHtcbiAgICB2YXJpYWJsZS52YWx1ZSA9IG5ld1ZhbHVlXG4gIH0pKVxuXG4gIGxpYi5zZXQodmFyaWFibGVPYmplY3QsICd2YWx1ZScsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt2YXJpYWJsZV0pIHtcbiAgICByZXR1cm4gdmFyaWFibGUudmFsdWVcbiAgfSkpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ2Zyb20nLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbZW52LCBuYW1lXSkge1xuICAgIG5hbWUgPSBsaWIudG9KU3RyaW5nKG5hbWUpXG4gICAgbGV0IHZhcmlhYmxlID0gZW52LnZhcnNbbmFtZV1cbiAgICBpZiAodHlwZW9mIHZhcmlhYmxlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCBhY2Nlc3MgdmFyaWFibGUgJHtuYW1lfSBiZWNhdXNlIGl0IGRvZXNuJ3QgZXhpc3RgKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdmFyaWFibGVcbiAgICB9XG4gIH0pKVxuXG4gIGxpYi5zZXQodmFyaWFibGVPYmplY3QsICdleGlzdHMnLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbZW52LCBuYW1lXSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihlbnYudmFycy5oYXNPd25Qcm9wZXJ0eShsaWIudG9KU3RyaW5nKG5hbWUpKSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydWYXJpYWJsZSddID0gbmV3IGxpYi5WYXJpYWJsZSh2YXJpYWJsZU9iamVjdClcblxuICByZXR1cm4gdmFyaWFibGVzXG59XG4iXX0=