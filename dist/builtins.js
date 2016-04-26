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
      return lib.toJString(arg);
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

    return Object.is(x, y);
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
//# sourceMappingURL=data:application/json;base64,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Q3hFLFdBQU8sSUFBSSxVQUFKLENBQWUsSUFBSSxJQUFKLENBQVMsY0FBVCxDQUF3QixJQUFJLFNBQUosQ0FBYyxJQUFkLENBQXhCLENBQWYsQ0FBUCxDQUR3RTtHQUF0QixDQUFwRCxFQXBMb0M7O0FBd0xwQyxZQUFVLFVBQVYsSUFBd0IsSUFBSSxJQUFJLFFBQUosQ0FBYSxjQUFqQixDQUF4QixDQXhMb0M7O0FBMExwQyxTQUFPLFNBQVAsQ0ExTG9DO0NBQS9CIiwiZmlsZSI6ImJ1aWx0aW5zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5jb25zdCBydW4gPSByZXF1aXJlKCcuL3J1bicpXG5jb25zdCBpbnRlcnAgPSByZXF1aXJlKCcuL2ludGVycCcpXG5jb25zdCBsaWIgPSByZXF1aXJlKCcuL2xpYicpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IEMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpXG5cbmZ1bmN0aW9uIGV4aXN0cyhwKSB7XG4gIC8vIHdhcm5pbmcsIHRoaXMgaXMgc3luY2hyb25vdXNcbiAgdHJ5IHtcbiAgICBmcy5hY2Nlc3NTeW5jKHAsIGZzLkZfT0spXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VCdWlsdGlucyhmc1Njb3BlKSB7XG4gIGxldCB2YXJpYWJsZXMgPSB7fVxuXG4gIHZhcmlhYmxlc1sncHJpbnQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIGNvbnNvbGUubG9nKC4uLmFyZ3MubWFwKGFyZyA9PiBsaWIudG9KU3RyaW5nKGFyZykpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2NvbmNhdCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGxpYi50b0xTdHJpbmcoYXJncy5tYXAobGliLnRvSlN0cmluZykuam9pbignJykpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snaWYnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIGlmIChsaWIudG9KQm9vbGVhbihhcmdzWzBdKSkge1xuICAgICAgbGliLmNhbGwoYXJnc1sxXSwgW10pXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG9wdGlvbmFsIGBlbHNlYFxuICAgICAgaWYgKGFyZ3NbMl0pIGxpYi5jYWxsKGFyZ3NbMl0sIFtdKVxuICAgIH1cbiAgfSkpXG5cbiAgdmFyaWFibGVzWydpZmVsJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBpZiAobGliLnRvSkJvb2xlYW4oYXJnc1swXSkpIHtcbiAgICAgIGxpYi5jYWxsKGFyZ3NbMV0sIFtdKVxuICAgIH0gZWxzZSB7XG4gICAgICBsaWIuY2FsbChhcmdzWzJdLCBbXSlcbiAgICB9XG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snc2xlZXAnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3RpbWVdKSB7XG4gICAgbGV0IGUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSArIChsaWIudG9KTnVtYmVyKHRpbWUpICogMTAwMClcbiAgICB3aGlsZSAobmV3IERhdGUoKS5nZXRUaW1lKCkgPD0gZSkgeyAvKiBlbXB0eSAqLyB9XG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snb2JqJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gbmV3IGxpYi5MT2JqZWN0KClcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydhcnJheSddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIG5ldyBsaWIuTEFycmF5KClcbiAgfSkpXG5cbiAgdmFyaWFibGVzWycrJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKGxpYi50b0pOdW1iZXIoeCkgKyBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcbiAgdmFyaWFibGVzWydhZGQnXSA9IHZhcmlhYmxlc1snKyddXG5cbiAgdmFyaWFibGVzWyctJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKGxpYi50b0pOdW1iZXIoeCkgLSBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcbiAgdmFyaWFibGVzWydtaW51cyddID0gdmFyaWFibGVzWyctJ11cblxuICB2YXJpYWJsZXNbJy8nXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobGliLnRvSk51bWJlcih4KSAvIGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJ2RpdmlkZSddID0gdmFyaWFibGVzWycvJ11cblxuICB2YXJpYWJsZXNbJyonXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobGliLnRvSk51bWJlcih4KSAqIGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJ211bHRpcGx5J10gPSB2YXJpYWJsZXNbJyYnXVxuXG4gIHZhcmlhYmxlc1snbm90J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtib29sXSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbighbGliLnRvSkJvb2xlYW4oYm9vbCkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJyEnXSA9IHZhcmlhYmxlc1snbm90J11cblxuICB2YXJpYWJsZXNbJ2FuZCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbYjEsIGIyXSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KQm9vbGVhbihiMSkgJiYgbGliLnRvSkJvb2xlYW4oYjIpKVxuICB9KSlcbiAgdmFyaWFibGVzWycmJ10gPSB2YXJpYWJsZXNbJ2FuZCddXG5cbiAgdmFyaWFibGVzWydvciddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbYjEsIGIyXSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KQm9vbGVhbihiMSkgfHwgbGliLnRvSkJvb2xlYW4oYjIpKVxuICB9KSlcbiAgdmFyaWFibGVzWyd8J10gPSB2YXJpYWJsZXNbJ29yJ11cblxuICB2YXJpYWJsZXNbJ2x0J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KTnVtYmVyKHgpIDwgbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snPCddID0gdmFyaWFibGVzWydsdCddXG5cbiAgdmFyaWFibGVzWydndCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSk51bWJlcih4KSA+IGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJz4nXSA9IHZhcmlhYmxlc1snZ3QnXVxuXG4gIHZhcmlhYmxlc1snZXEnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pOdW1iZXIoeCkgPT09IGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJz0nXSA9IHZhcmlhYmxlc1snZXEnXVxuXG4gIHZhcmlhYmxlc1snaXMnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIE9iamVjdC5pcyh4LCB5KVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2xvb3AnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2ZuXSkge1xuICAgIHdoaWxlIChsaWIudG9KQm9vbGVhbihsaWIuY2FsbChmbiwgW10pKSkgeyAvKiBlbXB0eSAqLyB9XG4gIH0pKVxuXG4gIHZhcmlhYmxlc1sndXNlJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtwYXRoU3RyXSkge1xuICAgIGxldCBwID0gbGliLnRvSlN0cmluZyhwYXRoU3RyKVxuICAgIGxldCBsb2NhdGlvbkluQnVpbHRpbnMgPSBgJHtmc1Njb3BlfS8ke3B9YFxuXG4gICAgaWYgKHAuc3Vic3RyKDAsIDEpICE9PSAnLicpIHtcbiAgICAgIGxvY2F0aW9uSW5CdWlsdGlucyA9IGAke19fZGlybmFtZX0vLi4vZ2xvYmFsLW1vZHVsZXMvJHtwfWBcbiAgICB9XG5cbiAgICBsZXQgZXh0ID0gcGF0aC5wYXJzZShsb2NhdGlvbkluQnVpbHRpbnMpLmV4dFxuXG4gICAgaWYgKCFleHQpIHtcbiAgICAgIGxvY2F0aW9uSW5CdWlsdGlucyArPSAnLnR1bCdcbiAgICAgIGV4dCA9ICcudHVsJ1xuXG4gICAgICBpZiAoIWV4aXN0cyhsb2NhdGlvbkluQnVpbHRpbnMpKSB7XG4gICAgICAgIGxvY2F0aW9uSW5CdWlsdGlucyA9IGAke2xvY2F0aW9uSW5CdWlsdGlucy5zdWJzdHIoMCwgbG9jYXRpb25JbkJ1aWx0aW5zLmxlbmd0aCAtIDMpfWpzYFxuICAgICAgICBleHQgPSAnLmpzJ1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChleGlzdHMobG9jYXRpb25JbkJ1aWx0aW5zKSkge1xuICAgICAgaWYgKGV4dCA9PT0gJy5qcycpIHtcbiAgICAgICAgbGV0IHVzZWQgPSByZXF1aXJlKGxvY2F0aW9uSW5CdWlsdGlucykobGliLCBmc1Njb3BlKVxuICAgICAgICAvL3ZhciB1c2VkT2JqID0gbGliLnRvTE9iamVjdCh1c2VkKTtcbiAgICAgICAgcmV0dXJuIHVzZWRcbiAgICAgIH0gZWxzZSBpZiAoZXh0ID09PSAnLnR1bCcpIHtcbiAgICAgICAgbGV0IHByb2dyYW0gPSBmcy5yZWFkRmlsZVN5bmMobG9jYXRpb25JbkJ1aWx0aW5zKS50b1N0cmluZygpXG4gICAgICAgIGxldCByZXN1bHQgPSBydW4ucnVuKHByb2dyYW0pXG4gICAgICAgIGlmICgnZXhwb3J0cycgaW4gcmVzdWx0LnZhcmlhYmxlcykge1xuICAgICAgICAgIHJldHVybiByZXN1bHQudmFyaWFibGVzLmV4cG9ydHMudmFsdWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV3IGxpYi5MT2JqZWN0KClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICBjaGFsay5jeWFuKGB1c2UoLi4uKWApXG4gICAgICAgICAgK1xuICAgICAgICAgICc6ICdcbiAgICAgICAgICArXG4gICAgICAgICAgY2hhbGsucmVkKGBJbnZhbGlkIGV4dGVuc2lvbiAke2NoYWxrLnllbGxvdyhleHQpfS5gKVxuICAgICAgICApXG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICBjaGFsay5jeWFuKGB1c2UoLi4uKWApXG4gICAgICAgICtcbiAgICAgICAgJzogJ1xuICAgICAgICArXG4gICAgICAgIGNoYWxrLnJlZChgQ291bGQgbm90IGZpbmQgbW9kdWxlICR7Y2hhbGsueWVsbG93KHApfS5gKVxuICAgICAgKVxuICAgICAgcHJvY2Vzcy5leGl0KDEpXG4gICAgfVxuICB9KSlcblxuICBsZXQgdmFyaWFibGVPYmplY3QgPSBuZXcgbGliLkxPYmplY3QoKVxuXG4gIGxpYi5zZXQodmFyaWFibGVPYmplY3QsICdtYWtlJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2VudiwgbmFtZSwgdmFsdWVdKSB7XG4gICAgbGV0IHYgPSBuZXcgbGliLlZhcmlhYmxlKHZhbHVlKVxuICAgIGVudi52YXJzW2xpYi50b0pTdHJpbmcobmFtZSldID0gdlxuICAgIHJldHVybiB2XG4gIH0pKVxuXG4gIGxpYi5zZXQodmFyaWFibGVPYmplY3QsICdjaGFuZ2UnLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbdmFyaWFibGUsIG5ld1ZhbHVlXSkge1xuICAgIHZhcmlhYmxlLnZhbHVlID0gbmV3VmFsdWVcbiAgfSkpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ3ZhbHVlJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3ZhcmlhYmxlXSkge1xuICAgIHJldHVybiB2YXJpYWJsZS52YWx1ZVxuICB9KSlcblxuICBsaWIuc2V0KHZhcmlhYmxlT2JqZWN0LCAnZnJvbScsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtlbnYsIG5hbWVdKSB7XG4gICAgbmFtZSA9IGxpYi50b0pTdHJpbmcobmFtZSlcbiAgICBsZXQgdmFyaWFibGUgPSBlbnYudmFyc1tuYW1lXVxuICAgIGlmICh0eXBlb2YgdmFyaWFibGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGFjY2VzcyB2YXJpYWJsZSAke25hbWV9IGJlY2F1c2UgaXQgZG9lc24ndCBleGlzdGApXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YXJpYWJsZVxuICAgIH1cbiAgfSkpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ2V4aXN0cycsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtlbnYsIG5hbWVdKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGVudi52YXJzLmhhc093blByb3BlcnR5KGxpYi50b0pTdHJpbmcobmFtZSkpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ1ZhcmlhYmxlJ10gPSBuZXcgbGliLlZhcmlhYmxlKHZhcmlhYmxlT2JqZWN0KVxuXG4gIHJldHVybiB2YXJpYWJsZXNcbn1cbiJdfQ==