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

  variables['-'] = new lib.Variable(new lib.LFunction(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2);

    var x = _ref4[0];
    var y = _ref4[1];

    return lib.toLNumber(lib.toJNumber(x) - lib.toJNumber(y));
  }));

  variables['/'] = new lib.Variable(new lib.LFunction(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2);

    var x = _ref6[0];
    var y = _ref6[1];

    return lib.toLNumber(lib.toJNumber(x) / lib.toJNumber(y));
  }));

  variables['*'] = new lib.Variable(new lib.LFunction(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2);

    var x = _ref8[0];
    var y = _ref8[1];

    return lib.toLNumber(lib.toJNumber(x) * lib.toJNumber(y));
  }));

  variables['not'] = new lib.Variable(new lib.LFunction(function (_ref9) {
    var _ref10 = _slicedToArray(_ref9, 1);

    var bool = _ref10[0];

    return lib.toLBoolean(!lib.toJBoolean(bool));
  }));

  variables['and'] = new lib.Variable(new lib.LFunction(function (_ref11) {
    var _ref12 = _slicedToArray(_ref11, 2);

    var b1 = _ref12[0];
    var b2 = _ref12[1];

    return lib.toLBoolean(lib.toJBoolean(b1) && lib.toJBoolean(b2));
  }));

  variables['or'] = new lib.Variable(new lib.LFunction(function (_ref13) {
    var _ref14 = _slicedToArray(_ref13, 2);

    var b1 = _ref14[0];
    var b2 = _ref14[1];

    return lib.toLBoolean(lib.toJBoolean(b1) || lib.toJBoolean(b2));
  }));

  variables['lt'] = new lib.Variable(new lib.LFunction(function (_ref15) {
    var _ref16 = _slicedToArray(_ref15, 2);

    var x = _ref16[0];
    var y = _ref16[1];

    return lib.toLBoolean(lib.toJNumber(x) < lib.toJNumber(y));
  }));

  variables['gt'] = new lib.Variable(new lib.LFunction(function (_ref17) {
    var _ref18 = _slicedToArray(_ref17, 2);

    var x = _ref18[0];
    var y = _ref18[1];

    return lib.toLBoolean(lib.toJNumber(x) > lib.toJNumber(y));
  }));

  variables['eq'] = new lib.Variable(new lib.LFunction(function (_ref19) {
    var _ref20 = _slicedToArray(_ref19, 2);

    var x = _ref20[0];
    var y = _ref20[1];

    return lib.toLBoolean(lib.toJNumber(x) === lib.toJNumber(y));
  }));

  variables['is'] = new lib.Variable(new lib.LFunction(function (_ref21) {
    var _ref22 = _slicedToArray(_ref21, 2);

    var x = _ref22[0];
    var y = _ref22[1];

    return Object.is(x, y);
  }));

  variables['loop'] = new lib.Variable(new lib.LFunction(function (_ref23) {
    var _ref24 = _slicedToArray(_ref23, 1);

    var fn = _ref24[0];

    while (lib.toJBoolean(lib.call(fn, []))) {}
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

    var name = lib.toJString(name);
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
//# sourceMappingURL=data:application/json;base64,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akIsQ0FEaUY7R0FBL0IsQ0FBcEQsRUF0SDZCOztBQTBIN0IsTUFBSSxHQUFKLENBQVEsY0FBUixFQUF3QixPQUF4QixFQUFpQyxJQUFJLElBQUksU0FBSixDQUFjLGtCQUFxQjs7O1FBQVgscUJBQVc7O0FBQ3RFLFdBQU8sU0FBUyxLQUFULENBRCtEO0dBQXJCLENBQW5ELEVBMUg2Qjs7QUE4SDdCLE1BQUksR0FBSixDQUFRLGNBQVIsRUFBd0IsTUFBeEIsRUFBZ0MsSUFBSSxJQUFJLFNBQUosQ0FBYyxrQkFBc0I7OztRQUFaLGdCQUFZO1FBQVAsaUJBQU87O0FBQ3RFLFFBQUksT0FBTyxJQUFJLFNBQUosQ0FBYyxJQUFkLENBQVAsQ0FEa0U7QUFFdEUsUUFBSSxXQUFXLElBQUksSUFBSixDQUFTLElBQVQsQ0FBWCxDQUZrRTtBQUd0RSxRQUFJLE9BQU8sUUFBUCxLQUFvQixXQUFwQixFQUFpQztBQUNuQyxZQUFNLElBQUksS0FBSiw2QkFBbUMsbUNBQW5DLENBQU4sQ0FEbUM7S0FBckMsTUFFTztBQUNMLGFBQU8sUUFBUCxDQURLO0tBRlA7R0FIZ0QsQ0FBbEQsRUE5SDZCOztBQXdJN0IsTUFBSSxHQUFKLENBQVEsY0FBUixFQUF3QixRQUF4QixFQUFrQyxJQUFJLElBQUksU0FBSixDQUFjLGtCQUFzQjs7O1FBQVosZ0JBQVk7UUFBUCxpQkFBTzs7QUFDeEUsV0FBTyxJQUFJLFVBQUosQ0FBZSxJQUFJLElBQUosQ0FBUyxjQUFULENBQXdCLElBQUksU0FBSixDQUFjLElBQWQsQ0FBeEIsQ0FBZixDQUFQLENBRHdFO0dBQXRCLENBQXBELEVBeEk2Qjs7QUE0STdCLFlBQVUsVUFBVixJQUF3QixJQUFJLElBQUksUUFBSixDQUFhLGNBQWpCLENBQXhCLENBNUk2Qjs7QUE4STdCLFNBQU8sU0FBUCxDQTlJNkI7Q0FBeEIiLCJmaWxlIjoiYnVpbHRpbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmNvbnN0IHJ1biA9IHJlcXVpcmUoJy4vcnVuJylcbmNvbnN0IGludGVycCA9IHJlcXVpcmUoJy4vaW50ZXJwJylcbmNvbnN0IGxpYiA9IHJlcXVpcmUoJy4vbGliJylcbmNvbnN0IEMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpXG5cbmZ1bmN0aW9uIGV4aXN0cyhwKSB7XG4gIC8vIHdhcm5pbmcsIHRoaXMgaXMgc3luY2hyb25vdXNcbiAgdHJ5IHtcbiAgICBmcy5hY2Nlc3NTeW5jKHAsIGZzLkZfT0spXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaChlcnIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUJ1aWx0aW5zKCkge1xuICBsZXQgdmFyaWFibGVzID0ge31cblxuICB2YXJpYWJsZXNbJ3ByaW50J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBjb25zb2xlLmxvZygne1ByaW50fScsIC4uLmFyZ3MubWFwKGFyZyA9PiBsaWIudG9KU3RyaW5nKGFyZykpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2NvbmNhdCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGxpYi50b0xTdHJpbmcoYXJncy5tYXAobGliLnRvSlN0cmluZykuam9pbignJykpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snaWYnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIGlmKGxpYi50b0pCb29sZWFuKGFyZ3NbMF0pKSB7XG4gICAgICBsaWIuY2FsbChhcmdzWzFdLCBbXSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gb3B0aW9uYWwgYGVsc2VgXG4gICAgICBpZihhcmdzWzJdKSBsaWIuY2FsbChhcmdzWzJdLCBbXSlcbiAgICB9XG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snaWZlbCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgaWYobGliLnRvSkJvb2xlYW4oYXJnc1swXSkpIHtcbiAgICAgIGxpYi5jYWxsKGFyZ3NbMV0sIFtdKVxuICAgIH0gZWxzZSB7XG4gICAgICBsaWIuY2FsbChhcmdzWzJdLCBbXSlcbiAgICB9XG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snb2JqJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gbmV3IGxpYi5MT2JqZWN0KClcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydhcnJheSddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIG5ldyBsaWIuTEFycmF5KClcbiAgfSkpXG5cbiAgdmFyaWFibGVzWycrJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKGxpYi50b0pOdW1iZXIoeCkgKyBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJy0nXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobGliLnRvSk51bWJlcih4KSAtIGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snLyddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihsaWIudG9KTnVtYmVyKHgpIC8gbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWycqJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKGxpYi50b0pOdW1iZXIoeCkgKiBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ25vdCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbYm9vbF0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4oIWxpYi50b0pCb29sZWFuKGJvb2wpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2FuZCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbYjEsIGIyXSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KQm9vbGVhbihiMSkgJiYgbGliLnRvSkJvb2xlYW4oYjIpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ29yJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtiMSwgYjJdKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pCb29sZWFuKGIxKSB8fCBsaWIudG9KQm9vbGVhbihiMikpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snbHQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pOdW1iZXIoeCkgPCBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2d0J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KTnVtYmVyKHgpID4gbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydlcSddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSk51bWJlcih4KSA9PT0gbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydpcyddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gT2JqZWN0LmlzKHgsIHkpO1xuICB9KSk7XG5cbiAgdmFyaWFibGVzWydsb29wJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtmbl0pIHtcbiAgICB3aGlsZShsaWIudG9KQm9vbGVhbihsaWIuY2FsbChmbiwgW10pKSk7XG4gIH0pKVxuXG4gIHZhcmlhYmxlc1sndXNlJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtwYXRoU3RyXSkge1xuICAgIGxldCBwID0gbGliLnRvSlN0cmluZyhwYXRoU3RyKVxuICAgIGxldCBsb2NhdGlvbkluQnVpbHRpbnMgPSBgJHtfX2Rpcm5hbWV9L2J1aWx0aW5fbGliLyR7cH1gXG4gICAgY29uc29sZS5sb2coJ2xvY2F0aW9uIGluIGJ1bGl0aW5zOicsIGxvY2F0aW9uSW5CdWlsdGlucylcbiAgICBsZXQgZXh0ID0gcGF0aC5wYXJzZShwKS5leHRcbiAgICBpZihleGlzdHMobG9jYXRpb25JbkJ1aWx0aW5zKSkge1xuICAgICAgaWYoZXh0ID09PSAnLmpzJykge1xuICAgICAgICBsZXQgdXNlZCA9IHJlcXVpcmUobG9jYXRpb25JbkJ1aWx0aW5zKVxuICAgICAgICBsZXQgdXNlZE9iaiA9IGxpYi50b0xPYmplY3QodXNlZClcbiAgICAgICAgcmV0dXJuIHVzZWRPYmpcbiAgICAgIH0gZWxzZSBpZihleHQgPT09ICcudHVsJykge1xuICAgICAgICBsZXQgcHJvZ3JhbSA9IGZzLnJlYWRGaWxlU3luYyhsb2NhdGlvbkluQnVpbHRpbnMpLnRvU3RyaW5nKClcbiAgICAgICAgbGV0IHJlc3VsdCA9IHJ1bi5ydW4ocHJvZ3JhbSlcbiAgICAgICAgaWYoJ2V4cG9ydHMnIGluIHJlc3VsdC52YXJpYWJsZXMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LnZhcmlhYmxlcy5leHBvcnRzLnZhbHVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBsaWIuTE9iamVjdCgpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGBJbnZhbGlkIHVzZSBleHRlbnNpb24gb2YgJHtwfWBcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ0ZpbGUgbm90IGZvdW5kJylcbiAgICB9XG4gIH0pKVxuXG4gIGxldCB2YXJpYWJsZU9iamVjdCA9IG5ldyBsaWIuTE9iamVjdCgpO1xuXG4gIGxpYi5zZXQodmFyaWFibGVPYmplY3QsICdtYWtlJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2VudiwgbmFtZSwgdmFsdWVdKSB7XG4gICAgbGV0IHYgPSBuZXcgbGliLlZhcmlhYmxlKHZhbHVlKVxuICAgIGVudi52YXJzW2xpYi50b0pTdHJpbmcobmFtZSldID0gdlxuICAgIHJldHVybiB2XG4gIH0pKVxuXG4gIGxpYi5zZXQodmFyaWFibGVPYmplY3QsICdjaGFuZ2UnLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbdmFyaWFibGUsIG5ld1ZhbHVlXSkge1xuICAgIHZhcmlhYmxlLnZhbHVlID0gbmV3VmFsdWVcbiAgfSkpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ3ZhbHVlJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3ZhcmlhYmxlXSkge1xuICAgIHJldHVybiB2YXJpYWJsZS52YWx1ZVxuICB9KSlcblxuICBsaWIuc2V0KHZhcmlhYmxlT2JqZWN0LCAnZnJvbScsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtlbnYsIG5hbWVdKSB7XG4gICAgdmFyIG5hbWUgPSBsaWIudG9KU3RyaW5nKG5hbWUpXG4gICAgdmFyIHZhcmlhYmxlID0gZW52LnZhcnNbbmFtZV1cbiAgICBpZiAodHlwZW9mIHZhcmlhYmxlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCBhY2Nlc3MgdmFyaWFibGUgJHtuYW1lfSBiZWNhdXNlIGl0IGRvZXNuJ3QgZXhpc3RgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHZhcmlhYmxlXG4gICAgfVxuICB9KSlcblxuICBsaWIuc2V0KHZhcmlhYmxlT2JqZWN0LCAnZXhpc3RzJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2VudiwgbmFtZV0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4oZW52LnZhcnMuaGFzT3duUHJvcGVydHkobGliLnRvSlN0cmluZyhuYW1lKSkpO1xuICB9KSlcblxuICB2YXJpYWJsZXNbJ1ZhcmlhYmxlJ10gPSBuZXcgbGliLlZhcmlhYmxlKHZhcmlhYmxlT2JqZWN0KTtcblxuICByZXR1cm4gdmFyaWFibGVzXG59XG4iXX0=