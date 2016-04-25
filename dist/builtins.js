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

function makeBuiltins() {
  var variables = {};

  variables['print'] = new lib.Variable(new lib.LFunction(function (args) {
    var _console;

    (_console = console).log.apply(_console, ['{Print}'].concat(_toConsumableArray(args.map(function (arg) {
      return lib.toJString(arg);
    }))));
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

  variables['obj'] = new lib.Variable(new lib.LFunction(function (args) {
    return new lib.LObject();
  }));

  variables['array'] = new lib.Variable(new lib.LFunction(function (args) {
    return new lib.LArray();
  }));

  variables['+'] = new lib.Variable(new lib.LFunction(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var x = _ref2[0];
    var y = _ref2[1];

    return lib.toLNumber(lib.toJNumber(x) + lib.toJNumber(y));
  }));
  variables['add'] = variables['+'];

  variables['-'] = new lib.Variable(new lib.LFunction(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2);

    var x = _ref4[0];
    var y = _ref4[1];

    return lib.toLNumber(lib.toJNumber(x) - lib.toJNumber(y));
  }));
  variables['minus'] = variables['-'];

  variables['/'] = new lib.Variable(new lib.LFunction(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2);

    var x = _ref6[0];
    var y = _ref6[1];

    return lib.toLNumber(lib.toJNumber(x) / lib.toJNumber(y));
  }));
  variables['divide'] = variables['/'];

  variables['*'] = new lib.Variable(new lib.LFunction(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2);

    var x = _ref8[0];
    var y = _ref8[1];

    return lib.toLNumber(lib.toJNumber(x) * lib.toJNumber(y));
  }));
  variables['multiply'] = variables['&'];

  variables['not'] = new lib.Variable(new lib.LFunction(function (_ref9) {
    var _ref10 = _slicedToArray(_ref9, 1);

    var bool = _ref10[0];

    return lib.toLBoolean(!lib.toJBoolean(bool));
  }));
  variables['!'] = variables['not'];

  variables['and'] = new lib.Variable(new lib.LFunction(function (_ref11) {
    var _ref12 = _slicedToArray(_ref11, 2);

    var b1 = _ref12[0];
    var b2 = _ref12[1];

    return lib.toLBoolean(lib.toJBoolean(b1) && lib.toJBoolean(b2));
  }));
  variables['&'] = variables['and'];

  variables['or'] = new lib.Variable(new lib.LFunction(function (_ref13) {
    var _ref14 = _slicedToArray(_ref13, 2);

    var b1 = _ref14[0];
    var b2 = _ref14[1];

    return lib.toLBoolean(lib.toJBoolean(b1) || lib.toJBoolean(b2));
  }));
  variables['|'] = variables['or'];

  variables['lt'] = new lib.Variable(new lib.LFunction(function (_ref15) {
    var _ref16 = _slicedToArray(_ref15, 2);

    var x = _ref16[0];
    var y = _ref16[1];

    return lib.toLBoolean(lib.toJNumber(x) < lib.toJNumber(y));
  }));
  variables['<'] = variables['lt'];

  variables['gt'] = new lib.Variable(new lib.LFunction(function (_ref17) {
    var _ref18 = _slicedToArray(_ref17, 2);

    var x = _ref18[0];
    var y = _ref18[1];

    return lib.toLBoolean(lib.toJNumber(x) > lib.toJNumber(y));
  }));
  variables['>'] = variables['gt'];

  variables['eq'] = new lib.Variable(new lib.LFunction(function (_ref19) {
    var _ref20 = _slicedToArray(_ref19, 2);

    var x = _ref20[0];
    var y = _ref20[1];

    return lib.toLBoolean(lib.toJNumber(x) === lib.toJNumber(y));
  }));
  variables['='] = variables['eq'];

  variables['is'] = new lib.Variable(new lib.LFunction(function (_ref21) {
    var _ref22 = _slicedToArray(_ref21, 2);

    var x = _ref22[0];
    var y = _ref22[1];

    return Object.is(x, y);
  }));

  variables['loop'] = new lib.Variable(new lib.LFunction(function (_ref23) {
    var _ref24 = _slicedToArray(_ref23, 1);

    var fn = _ref24[0];

    while (lib.toJBoolean(lib.call(fn, []))) {/* empty */}
  }));

  variables['use'] = new lib.Variable(new lib.LFunction(function (_ref25) {
    var _ref26 = _slicedToArray(_ref25, 1);

    var pathStr = _ref26[0];

    var p = lib.toJString(pathStr);
    var locationInBuiltins = __dirname + '/builtin_lib/' + p;
    console.log('location in bulitins:', locationInBuiltins);
    var ext = path.parse(p).ext;
    if (exists(locationInBuiltins)) {
      if (ext === '.js') {
        var used = require(locationInBuiltins);
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
        throw 'Invalid use extension of ' + p;
      }
    } else {
      console.log('File not found');
    }
  }));

  var variableObject = new lib.LObject();

  lib.set(variableObject, 'make', new lib.LFunction(function (_ref27) {
    var _ref28 = _slicedToArray(_ref27, 3);

    var env = _ref28[0];
    var name = _ref28[1];
    var value = _ref28[2];

    var v = new lib.Variable(value);
    env.vars[lib.toJString(name)] = v;
    return v;
  }));

  lib.set(variableObject, 'change', new lib.LFunction(function (_ref29) {
    var _ref30 = _slicedToArray(_ref29, 2);

    var variable = _ref30[0];
    var newValue = _ref30[1];

    variable.value = newValue;
  }));

  lib.set(variableObject, 'value', new lib.LFunction(function (_ref31) {
    var _ref32 = _slicedToArray(_ref31, 1);

    var variable = _ref32[0];

    return variable.value;
  }));

  lib.set(variableObject, 'from', new lib.LFunction(function (_ref33) {
    var _ref34 = _slicedToArray(_ref33, 2);

    var env = _ref34[0];
    var name = _ref34[1];

    name = lib.toJString(name);
    var variable = env.vars[name];
    if (typeof variable === 'undefined') {
      throw new Error('Can\'t access variable ' + name + ' because it doesn\'t exist');
    } else {
      return variable;
    }
  }));

  lib.set(variableObject, 'exists', new lib.LFunction(function (_ref35) {
    var _ref36 = _slicedToArray(_ref35, 2);

    var env = _ref36[0];
    var name = _ref36[1];

    return lib.toLBoolean(env.vars.hasOwnProperty(lib.toJString(name)));
  }));

  variables['Variable'] = new lib.Variable(variableObject);

  return variables;
}
//# sourceMappingURL=data:application/json;base64,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S0FBckMsTUFFTztBQUNMLGFBQU8sUUFBUCxDQURLO0tBRlA7R0FIZ0QsQ0FBbEQsRUF4STZCOztBQWtKN0IsTUFBSSxHQUFKLENBQVEsY0FBUixFQUF3QixRQUF4QixFQUFrQyxJQUFJLElBQUksU0FBSixDQUFjLGtCQUFzQjs7O1FBQVosZ0JBQVk7UUFBUCxpQkFBTzs7QUFDeEUsV0FBTyxJQUFJLFVBQUosQ0FBZSxJQUFJLElBQUosQ0FBUyxjQUFULENBQXdCLElBQUksU0FBSixDQUFjLElBQWQsQ0FBeEIsQ0FBZixDQUFQLENBRHdFO0dBQXRCLENBQXBELEVBbEo2Qjs7QUFzSjdCLFlBQVUsVUFBVixJQUF3QixJQUFJLElBQUksUUFBSixDQUFhLGNBQWpCLENBQXhCLENBdEo2Qjs7QUF3SjdCLFNBQU8sU0FBUCxDQXhKNkI7Q0FBeEIiLCJmaWxlIjoiYnVpbHRpbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmNvbnN0IHJ1biA9IHJlcXVpcmUoJy4vcnVuJylcbmNvbnN0IGludGVycCA9IHJlcXVpcmUoJy4vaW50ZXJwJylcbmNvbnN0IGxpYiA9IHJlcXVpcmUoJy4vbGliJylcbmNvbnN0IEMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpXG5cbmZ1bmN0aW9uIGV4aXN0cyhwKSB7XG4gIC8vIHdhcm5pbmcsIHRoaXMgaXMgc3luY2hyb25vdXNcbiAgdHJ5IHtcbiAgICBmcy5hY2Nlc3NTeW5jKHAsIGZzLkZfT0spXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VCdWlsdGlucygpIHtcbiAgbGV0IHZhcmlhYmxlcyA9IHt9XG5cbiAgdmFyaWFibGVzWydwcmludCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgY29uc29sZS5sb2coJ3tQcmludH0nLCAuLi5hcmdzLm1hcChhcmcgPT4gbGliLnRvSlN0cmluZyhhcmcpKSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydjb25jYXQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBsaWIudG9MU3RyaW5nKGFyZ3MubWFwKGxpYi50b0pTdHJpbmcpLmpvaW4oJycpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2lmJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBpZiAobGliLnRvSkJvb2xlYW4oYXJnc1swXSkpIHtcbiAgICAgIGxpYi5jYWxsKGFyZ3NbMV0sIFtdKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBvcHRpb25hbCBgZWxzZWBcbiAgICAgIGlmIChhcmdzWzJdKSBsaWIuY2FsbChhcmdzWzJdLCBbXSlcbiAgICB9XG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snaWZlbCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgaWYgKGxpYi50b0pCb29sZWFuKGFyZ3NbMF0pKSB7XG4gICAgICBsaWIuY2FsbChhcmdzWzFdLCBbXSlcbiAgICB9IGVsc2Uge1xuICAgICAgbGliLmNhbGwoYXJnc1syXSwgW10pXG4gICAgfVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ29iaiddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIG5ldyBsaWIuTE9iamVjdCgpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snYXJyYXknXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBuZXcgbGliLkxBcnJheSgpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snKyddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihsaWIudG9KTnVtYmVyKHgpICsgbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snYWRkJ10gPSB2YXJpYWJsZXNbJysnXVxuXG4gIHZhcmlhYmxlc1snLSddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihsaWIudG9KTnVtYmVyKHgpIC0gbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snbWludXMnXSA9IHZhcmlhYmxlc1snLSddXG5cbiAgdmFyaWFibGVzWycvJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKGxpYi50b0pOdW1iZXIoeCkgLyBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcbiAgdmFyaWFibGVzWydkaXZpZGUnXSA9IHZhcmlhYmxlc1snLyddXG5cbiAgdmFyaWFibGVzWycqJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKGxpYi50b0pOdW1iZXIoeCkgKiBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcbiAgdmFyaWFibGVzWydtdWx0aXBseSddID0gdmFyaWFibGVzWycmJ11cblxuICB2YXJpYWJsZXNbJ25vdCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbYm9vbF0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4oIWxpYi50b0pCb29sZWFuKGJvb2wpKVxuICB9KSlcbiAgdmFyaWFibGVzWychJ10gPSB2YXJpYWJsZXNbJ25vdCddXG5cbiAgdmFyaWFibGVzWydhbmQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2IxLCBiMl0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSkJvb2xlYW4oYjEpICYmIGxpYi50b0pCb29sZWFuKGIyKSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snJiddID0gdmFyaWFibGVzWydhbmQnXVxuXG4gIHZhcmlhYmxlc1snb3InXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2IxLCBiMl0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSkJvb2xlYW4oYjEpIHx8IGxpYi50b0pCb29sZWFuKGIyKSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snfCddID0gdmFyaWFibGVzWydvciddXG5cbiAgdmFyaWFibGVzWydsdCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSk51bWJlcih4KSA8IGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJzwnXSA9IHZhcmlhYmxlc1snbHQnXVxuXG4gIHZhcmlhYmxlc1snZ3QnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pOdW1iZXIoeCkgPiBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcbiAgdmFyaWFibGVzWyc+J10gPSB2YXJpYWJsZXNbJ2d0J11cblxuICB2YXJpYWJsZXNbJ2VxJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KTnVtYmVyKHgpID09PSBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcbiAgdmFyaWFibGVzWyc9J10gPSB2YXJpYWJsZXNbJ2VxJ11cblxuICB2YXJpYWJsZXNbJ2lzJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBPYmplY3QuaXMoeCwgeSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydsb29wJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtmbl0pIHtcbiAgICB3aGlsZSAobGliLnRvSkJvb2xlYW4obGliLmNhbGwoZm4sIFtdKSkpIHsgLyogZW1wdHkgKi8gfVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ3VzZSddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbcGF0aFN0cl0pIHtcbiAgICBsZXQgcCA9IGxpYi50b0pTdHJpbmcocGF0aFN0cilcbiAgICBsZXQgbG9jYXRpb25JbkJ1aWx0aW5zID0gYCR7X19kaXJuYW1lfS9idWlsdGluX2xpYi8ke3B9YFxuICAgIGNvbnNvbGUubG9nKCdsb2NhdGlvbiBpbiBidWxpdGluczonLCBsb2NhdGlvbkluQnVpbHRpbnMpXG4gICAgbGV0IGV4dCA9IHBhdGgucGFyc2UocCkuZXh0XG4gICAgaWYgKGV4aXN0cyhsb2NhdGlvbkluQnVpbHRpbnMpKSB7XG4gICAgICBpZiAoZXh0ID09PSAnLmpzJykge1xuICAgICAgICBsZXQgdXNlZCA9IHJlcXVpcmUobG9jYXRpb25JbkJ1aWx0aW5zKVxuICAgICAgICBsZXQgdXNlZE9iaiA9IGxpYi50b0xPYmplY3QodXNlZClcbiAgICAgICAgcmV0dXJuIHVzZWRPYmpcbiAgICAgIH0gZWxzZSBpZiAoZXh0ID09PSAnLnR1bCcpIHtcbiAgICAgICAgbGV0IHByb2dyYW0gPSBmcy5yZWFkRmlsZVN5bmMobG9jYXRpb25JbkJ1aWx0aW5zKS50b1N0cmluZygpXG4gICAgICAgIGxldCByZXN1bHQgPSBydW4ucnVuKHByb2dyYW0pXG4gICAgICAgIGlmICgnZXhwb3J0cycgaW4gcmVzdWx0LnZhcmlhYmxlcykge1xuICAgICAgICAgIHJldHVybiByZXN1bHQudmFyaWFibGVzLmV4cG9ydHMudmFsdWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV3IGxpYi5MT2JqZWN0KClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgYEludmFsaWQgdXNlIGV4dGVuc2lvbiBvZiAke3B9YFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnRmlsZSBub3QgZm91bmQnKVxuICAgIH1cbiAgfSkpXG5cbiAgbGV0IHZhcmlhYmxlT2JqZWN0ID0gbmV3IGxpYi5MT2JqZWN0KClcblxuICBsaWIuc2V0KHZhcmlhYmxlT2JqZWN0LCAnbWFrZScsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtlbnYsIG5hbWUsIHZhbHVlXSkge1xuICAgIGxldCB2ID0gbmV3IGxpYi5WYXJpYWJsZSh2YWx1ZSlcbiAgICBlbnYudmFyc1tsaWIudG9KU3RyaW5nKG5hbWUpXSA9IHZcbiAgICByZXR1cm4gdlxuICB9KSlcblxuICBsaWIuc2V0KHZhcmlhYmxlT2JqZWN0LCAnY2hhbmdlJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3ZhcmlhYmxlLCBuZXdWYWx1ZV0pIHtcbiAgICB2YXJpYWJsZS52YWx1ZSA9IG5ld1ZhbHVlXG4gIH0pKVxuXG4gIGxpYi5zZXQodmFyaWFibGVPYmplY3QsICd2YWx1ZScsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt2YXJpYWJsZV0pIHtcbiAgICByZXR1cm4gdmFyaWFibGUudmFsdWVcbiAgfSkpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ2Zyb20nLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbZW52LCBuYW1lXSkge1xuICAgIG5hbWUgPSBsaWIudG9KU3RyaW5nKG5hbWUpXG4gICAgbGV0IHZhcmlhYmxlID0gZW52LnZhcnNbbmFtZV1cbiAgICBpZiAodHlwZW9mIHZhcmlhYmxlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCBhY2Nlc3MgdmFyaWFibGUgJHtuYW1lfSBiZWNhdXNlIGl0IGRvZXNuJ3QgZXhpc3RgKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdmFyaWFibGVcbiAgICB9XG4gIH0pKVxuXG4gIGxpYi5zZXQodmFyaWFibGVPYmplY3QsICdleGlzdHMnLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbZW52LCBuYW1lXSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihlbnYudmFycy5oYXNPd25Qcm9wZXJ0eShsaWIudG9KU3RyaW5nKG5hbWUpKSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydWYXJpYWJsZSddID0gbmV3IGxpYi5WYXJpYWJsZSh2YXJpYWJsZU9iamVjdClcblxuICByZXR1cm4gdmFyaWFibGVzXG59XG4iXX0=