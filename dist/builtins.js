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
//# sourceMappingURL=data:application/json;base64,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QUFJQSxNQUFJLEdBQUosQ0FBUSxjQUFSLEVBQXdCLE9BQXhCLEVBQWlDLElBQUksSUFBSSxTQUFSLENBQWtCLGtCQUFxQjtBQUFBOztBQUFBLFFBQVgsUUFBVzs7QUFDdEUsV0FBTyxTQUFTLEtBQWhCO0FBQ0QsR0FGZ0MsQ0FBakM7O0FBSUEsTUFBSSxHQUFKLENBQVEsY0FBUixFQUF3QixNQUF4QixFQUFnQyxJQUFJLElBQUksU0FBUixDQUFrQixrQkFBc0I7QUFBQTs7QUFBQSxRQUFaLEdBQVk7QUFBQSxRQUFQLElBQU87O0FBQ3RFLFdBQU8sSUFBSSxTQUFKLENBQWMsSUFBZCxDQUFQO0FBQ0EsUUFBSSxXQUFXLElBQUksSUFBSixDQUFTLElBQVQsQ0FBZjtBQUNBLFFBQUksT0FBTyxRQUFQLEtBQW9CLFdBQXhCLEVBQXFDO0FBQ25DLFlBQU0sSUFBSSxLQUFKLDZCQUFtQyxJQUFuQyxnQ0FBTjtBQUNELEtBRkQsTUFFTztBQUNMLGFBQU8sUUFBUDtBQUNEO0FBQ0YsR0FSK0IsQ0FBaEM7O0FBVUEsTUFBSSxHQUFKLENBQVEsY0FBUixFQUF3QixRQUF4QixFQUFrQyxJQUFJLElBQUksU0FBUixDQUFrQixrQkFBc0I7QUFBQTs7QUFBQSxRQUFaLEdBQVk7QUFBQSxRQUFQLElBQU87O0FBQ3hFLFdBQU8sSUFBSSxVQUFKLENBQWUsSUFBSSxJQUFKLENBQVMsY0FBVCxDQUF3QixJQUFJLFNBQUosQ0FBYyxJQUFkLENBQXhCLENBQWYsQ0FBUDtBQUNELEdBRmlDLENBQWxDOztBQUlBLFlBQVUsVUFBVixJQUF3QixJQUFJLElBQUksUUFBUixDQUFpQixjQUFqQixDQUF4Qjs7QUFFQSxTQUFPLFNBQVA7QUFDRCIsImZpbGUiOiJidWlsdGlucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuY29uc3QgcnVuID0gcmVxdWlyZSgnLi9ydW4nKVxuY29uc3QgaW50ZXJwID0gcmVxdWlyZSgnLi9pbnRlcnAnKVxuY29uc3QgbGliID0gcmVxdWlyZSgnLi9saWInKVxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBDID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKVxuXG5mdW5jdGlvbiBleGlzdHMocCkge1xuICAvLyB3YXJuaW5nLCB0aGlzIGlzIHN5bmNocm9ub3VzXG4gIHRyeSB7XG4gICAgZnMuYWNjZXNzU3luYyhwLCBmcy5GX09LKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQnVpbHRpbnMoZnNTY29wZSkge1xuICBsZXQgdmFyaWFibGVzID0ge31cblxuICB2YXJpYWJsZXNbJ3ByaW50J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBjb25zb2xlLmxvZyguLi5hcmdzLm1hcChhcmcgPT4ge1xuICAgICAgbGV0IGEgPSBhcmcudG9TdHJpbmcoKSB8fCAnJ1xuICAgICAgaWYgKGEgPT09ICc8Qm9vbGVhbiB0cnVlPicpIGEgPSBjaGFsay5ncmVlbigndHJ1ZScpIC8vIHRydWVcbiAgICAgIGVsc2UgaWYgKGEgPT09ICc8Qm9vbGVhbiBmYWxzZT4nKSBhID0gY2hhbGsucmVkKCdmYWxzZScpIC8vIGZhbHNlXG4gICAgICBlbHNlIGlmIChhID09PSAnPEZ1bmN0aW9uPicpIGEgPSBjaGFsay5tYWdlbnRhKGBmdW5jdGlvbmApIC8vIGZ1bmN0aW9uXG4gICAgICBlbHNlIGlmIChhLnN1YnN0cigwLCA4KSA9PT0gJzxTdHJpbmcgJykgYSA9IGAke2Euc3Vic3RyKDgsIGEubGVuZ3RoLTkpfWAgLy8gc3RyaW5nXG4gICAgICBlbHNlIGlmIChhLnN1YnN0cigwLCA4KSA9PT0gJzxOdW1iZXIgJykge1xuICAgICAgICBpZiAoTnVtYmVyKGEuc3Vic3RyKDgsIGEubGVuZ3RoLTkpKSAlIDEgPT09IDApIGEgPSBjaGFsay5ibHVlKGAke2Euc3Vic3RyKDgsIGEubGVuZ3RoLTkpfWApIC8vIGludGVnZXJcbiAgICAgICAgZWxzZSBhID0gY2hhbGsuYmx1ZShgJHthLnN1YnN0cig4LCBhLmxlbmd0aC05KX1gKSAvLyBmbG9hdFxuICAgICAgfVxuICAgICAgcmV0dXJuIGFcbiAgICB9KSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydjb25jYXQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBsaWIudG9MU3RyaW5nKGFyZ3MubWFwKGxpYi50b0pTdHJpbmcpLmpvaW4oJycpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2lmJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBpZiAobGliLnRvSkJvb2xlYW4oYXJnc1swXSkpIHtcbiAgICAgIGxpYi5jYWxsKGFyZ3NbMV0sIFtdKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBvcHRpb25hbCBgZWxzZWBcbiAgICAgIGlmIChhcmdzWzJdKSBsaWIuY2FsbChhcmdzWzJdLCBbXSlcbiAgICB9XG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snaWZlbCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgaWYgKGxpYi50b0pCb29sZWFuKGFyZ3NbMF0pKSB7XG4gICAgICBsaWIuY2FsbChhcmdzWzFdLCBbXSlcbiAgICB9IGVsc2Uge1xuICAgICAgbGliLmNhbGwoYXJnc1syXSwgW10pXG4gICAgfVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ3NsZWVwJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt0aW1lXSkge1xuICAgIGxldCBlID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgKyAobGliLnRvSk51bWJlcih0aW1lKSAqIDEwMDApXG4gICAgd2hpbGUgKG5ldyBEYXRlKCkuZ2V0VGltZSgpIDw9IGUpIHsgLyogZW1wdHkgKi8gfVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ29iaiddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIG5ldyBsaWIuTE9iamVjdCgpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snYXJyYXknXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBuZXcgbGliLkxBcnJheSgpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snKyddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihsaWIudG9KTnVtYmVyKHgpICsgbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snYWRkJ10gPSB2YXJpYWJsZXNbJysnXVxuXG4gIHZhcmlhYmxlc1snLSddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihsaWIudG9KTnVtYmVyKHgpIC0gbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snbWludXMnXSA9IHZhcmlhYmxlc1snLSddXG5cbiAgdmFyaWFibGVzWycvJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKGxpYi50b0pOdW1iZXIoeCkgLyBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcbiAgdmFyaWFibGVzWydkaXZpZGUnXSA9IHZhcmlhYmxlc1snLyddXG5cbiAgdmFyaWFibGVzWycqJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKGxpYi50b0pOdW1iZXIoeCkgKiBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcbiAgdmFyaWFibGVzWydtdWx0aXBseSddID0gdmFyaWFibGVzWycmJ11cblxuICB2YXJpYWJsZXNbJ25vdCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbYm9vbF0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4oIWxpYi50b0pCb29sZWFuKGJvb2wpKVxuICB9KSlcbiAgdmFyaWFibGVzWychJ10gPSB2YXJpYWJsZXNbJ25vdCddXG5cbiAgdmFyaWFibGVzWydhbmQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2IxLCBiMl0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSkJvb2xlYW4oYjEpICYmIGxpYi50b0pCb29sZWFuKGIyKSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snJiddID0gdmFyaWFibGVzWydhbmQnXVxuXG4gIHZhcmlhYmxlc1snb3InXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2IxLCBiMl0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSkJvb2xlYW4oYjEpIHx8IGxpYi50b0pCb29sZWFuKGIyKSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snfCddID0gdmFyaWFibGVzWydvciddXG5cbiAgdmFyaWFibGVzWydsdCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSk51bWJlcih4KSA8IGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJzwnXSA9IHZhcmlhYmxlc1snbHQnXVxuXG4gIHZhcmlhYmxlc1snZ3QnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pOdW1iZXIoeCkgPiBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcbiAgdmFyaWFibGVzWyc+J10gPSB2YXJpYWJsZXNbJ2d0J11cblxuICB2YXJpYWJsZXNbJ2VxJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KTnVtYmVyKHgpID09PSBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcbiAgdmFyaWFibGVzWyc9J10gPSB2YXJpYWJsZXNbJ2VxJ11cblxuICB2YXJpYWJsZXNbJ2lzJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihPYmplY3QuaXMoeCwgeSkgfHwgeC50b1N0cmluZygpID09PSB5LnRvU3RyaW5nKCkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snbG9vcCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbZm5dKSB7XG4gICAgd2hpbGUgKGxpYi50b0pCb29sZWFuKGxpYi5jYWxsKGZuLCBbXSkpKSB7IC8qIGVtcHR5ICovIH1cbiAgfSkpXG5cbiAgdmFyaWFibGVzWyd1c2UnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3BhdGhTdHJdKSB7XG4gICAgbGV0IHAgPSBsaWIudG9KU3RyaW5nKHBhdGhTdHIpXG4gICAgbGV0IGxvY2F0aW9uSW5CdWlsdGlucyA9IGAke2ZzU2NvcGV9LyR7cH1gXG5cbiAgICBpZiAocC5zdWJzdHIoMCwgMSkgIT09ICcuJykge1xuICAgICAgbG9jYXRpb25JbkJ1aWx0aW5zID0gYCR7X19kaXJuYW1lfS8uLi9nbG9iYWwtbW9kdWxlcy8ke3B9YFxuICAgIH1cblxuICAgIGxldCBleHQgPSBwYXRoLnBhcnNlKGxvY2F0aW9uSW5CdWlsdGlucykuZXh0XG5cbiAgICBpZiAoIWV4dCkge1xuICAgICAgbG9jYXRpb25JbkJ1aWx0aW5zICs9ICcudHVsJ1xuICAgICAgZXh0ID0gJy50dWwnXG5cbiAgICAgIGlmICghZXhpc3RzKGxvY2F0aW9uSW5CdWlsdGlucykpIHtcbiAgICAgICAgbG9jYXRpb25JbkJ1aWx0aW5zID0gYCR7bG9jYXRpb25JbkJ1aWx0aW5zLnN1YnN0cigwLCBsb2NhdGlvbkluQnVpbHRpbnMubGVuZ3RoIC0gMyl9anNgXG4gICAgICAgIGV4dCA9ICcuanMnXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGV4aXN0cyhsb2NhdGlvbkluQnVpbHRpbnMpKSB7XG4gICAgICBpZiAoZXh0ID09PSAnLmpzJykge1xuICAgICAgICBsZXQgdXNlZCA9IHJlcXVpcmUobG9jYXRpb25JbkJ1aWx0aW5zKShsaWIsIGZzU2NvcGUpXG4gICAgICAgIC8vdmFyIHVzZWRPYmogPSBsaWIudG9MT2JqZWN0KHVzZWQpO1xuICAgICAgICByZXR1cm4gdXNlZFxuICAgICAgfSBlbHNlIGlmIChleHQgPT09ICcudHVsJykge1xuICAgICAgICBsZXQgcHJvZ3JhbSA9IGZzLnJlYWRGaWxlU3luYyhsb2NhdGlvbkluQnVpbHRpbnMpLnRvU3RyaW5nKClcbiAgICAgICAgbGV0IHJlc3VsdCA9IHJ1bi5ydW4ocHJvZ3JhbSlcbiAgICAgICAgaWYgKCdleHBvcnRzJyBpbiByZXN1bHQudmFyaWFibGVzKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC52YXJpYWJsZXMuZXhwb3J0cy52YWx1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBuZXcgbGliLkxPYmplY3QoKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgIGNoYWxrLmN5YW4oYHVzZSguLi4pYClcbiAgICAgICAgICArXG4gICAgICAgICAgJzogJ1xuICAgICAgICAgICtcbiAgICAgICAgICBjaGFsay5yZWQoYEludmFsaWQgZXh0ZW5zaW9uICR7Y2hhbGsueWVsbG93KGV4dCl9LmApXG4gICAgICAgIClcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIGNoYWxrLmN5YW4oYHVzZSguLi4pYClcbiAgICAgICAgK1xuICAgICAgICAnOiAnXG4gICAgICAgICtcbiAgICAgICAgY2hhbGsucmVkKGBDb3VsZCBub3QgZmluZCBtb2R1bGUgJHtjaGFsay55ZWxsb3cocCl9LmApXG4gICAgICApXG4gICAgICBwcm9jZXNzLmV4aXQoMSlcbiAgICB9XG4gIH0pKVxuXG4gIGxldCB2YXJpYWJsZU9iamVjdCA9IG5ldyBsaWIuTE9iamVjdCgpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ21ha2UnLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbZW52LCBuYW1lLCB2YWx1ZV0pIHtcbiAgICBsZXQgdiA9IG5ldyBsaWIuVmFyaWFibGUodmFsdWUpXG4gICAgZW52LnZhcnNbbGliLnRvSlN0cmluZyhuYW1lKV0gPSB2XG4gICAgcmV0dXJuIHZcbiAgfSkpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ2NoYW5nZScsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt2YXJpYWJsZSwgbmV3VmFsdWVdKSB7XG4gICAgdmFyaWFibGUudmFsdWUgPSBuZXdWYWx1ZVxuICB9KSlcblxuICBsaWIuc2V0KHZhcmlhYmxlT2JqZWN0LCAndmFsdWUnLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbdmFyaWFibGVdKSB7XG4gICAgcmV0dXJuIHZhcmlhYmxlLnZhbHVlXG4gIH0pKVxuXG4gIGxpYi5zZXQodmFyaWFibGVPYmplY3QsICdmcm9tJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2VudiwgbmFtZV0pIHtcbiAgICBuYW1lID0gbGliLnRvSlN0cmluZyhuYW1lKVxuICAgIGxldCB2YXJpYWJsZSA9IGVudi52YXJzW25hbWVdXG4gICAgaWYgKHR5cGVvZiB2YXJpYWJsZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgYWNjZXNzIHZhcmlhYmxlICR7bmFtZX0gYmVjYXVzZSBpdCBkb2Vzbid0IGV4aXN0YClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHZhcmlhYmxlXG4gICAgfVxuICB9KSlcblxuICBsaWIuc2V0KHZhcmlhYmxlT2JqZWN0LCAnZXhpc3RzJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2VudiwgbmFtZV0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4oZW52LnZhcnMuaGFzT3duUHJvcGVydHkobGliLnRvSlN0cmluZyhuYW1lKSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snVmFyaWFibGUnXSA9IG5ldyBsaWIuVmFyaWFibGUodmFyaWFibGVPYmplY3QpXG5cbiAgcmV0dXJuIHZhcmlhYmxlc1xufVxuIl19