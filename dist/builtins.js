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
//# sourceMappingURL=data:application/json;base64,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QWlCLFFBQWpCLENBRGlGO0dBQS9CLENBQXBELEVBdEg2Qjs7QUEwSDdCLE1BQUksR0FBSixDQUFRLGNBQVIsRUFBd0IsT0FBeEIsRUFBaUMsSUFBSSxJQUFJLFNBQUosQ0FBYyxrQkFBcUI7OztRQUFYLHFCQUFXOztBQUN0RSxXQUFPLFNBQVMsS0FBVCxDQUQrRDtHQUFyQixDQUFuRCxFQTFINkI7O0FBOEg3QixNQUFJLEdBQUosQ0FBUSxjQUFSLEVBQXdCLE1BQXhCLEVBQWdDLElBQUksSUFBSSxTQUFKLENBQWMsa0JBQXNCOzs7UUFBWixnQkFBWTtRQUFQLGlCQUFPOztBQUN0RSxRQUFJLE9BQU8sSUFBSSxTQUFKLENBQWMsSUFBZCxDQUFQLENBRGtFO0FBRXRFLFFBQUksV0FBVyxJQUFJLElBQUosQ0FBUyxJQUFULENBQVgsQ0FGa0U7QUFHdEUsUUFBSSxPQUFPLFFBQVAsS0FBb0IsV0FBcEIsRUFBaUM7QUFDbkMsWUFBTSxJQUFJLEtBQUosNkJBQW1DLG1DQUFuQyxDQUFOLENBRG1DO0tBQXJDLE1BRU87QUFDTCxhQUFPLFFBQVAsQ0FESztLQUZQO0dBSGdELENBQWxELEVBOUg2Qjs7QUF3STdCLE1BQUksR0FBSixDQUFRLGNBQVIsRUFBd0IsUUFBeEIsRUFBa0MsSUFBSSxJQUFJLFNBQUosQ0FBYyxrQkFBc0I7OztRQUFaLGdCQUFZO1FBQVAsaUJBQU87O0FBQ3hFLFdBQU8sSUFBSSxVQUFKLENBQWUsSUFBSSxJQUFKLENBQVMsY0FBVCxDQUF3QixJQUFJLFNBQUosQ0FBYyxJQUFkLENBQXhCLENBQWYsQ0FBUCxDQUR3RTtHQUF0QixDQUFwRCxFQXhJNkI7O0FBNEk3QixZQUFVLFVBQVYsSUFBd0IsSUFBSSxJQUFJLFFBQUosQ0FBYSxjQUFqQixDQUF4QixDQTVJNkI7O0FBOEk3QixTQUFPLFNBQVAsQ0E5STZCO0NBQXhCIiwiZmlsZSI6ImJ1aWx0aW5zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5jb25zdCBydW4gPSByZXF1aXJlKCcuL3J1bicpXG5jb25zdCBpbnRlcnAgPSByZXF1aXJlKCcuL2ludGVycCcpXG5jb25zdCBsaWIgPSByZXF1aXJlKCcuL2xpYicpXG5jb25zdCBDID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKVxuXG5mdW5jdGlvbiBleGlzdHMocCkge1xuICAvLyB3YXJuaW5nLCB0aGlzIGlzIHN5bmNocm9ub3VzXG4gIHRyeSB7XG4gICAgZnMuYWNjZXNzU3luYyhwLCBmcy5GX09LKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2goZXJyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VCdWlsdGlucygpIHtcbiAgbGV0IHZhcmlhYmxlcyA9IHt9XG5cbiAgdmFyaWFibGVzWydwcmludCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgY29uc29sZS5sb2coJ3tQcmludH0nLCAuLi5hcmdzLm1hcChhcmcgPT4gbGliLnRvSlN0cmluZyhhcmcpKSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydjb25jYXQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBsaWIudG9MU3RyaW5nKGFyZ3MubWFwKGxpYi50b0pTdHJpbmcpLmpvaW4oJycpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2lmJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBpZihsaWIudG9KQm9vbGVhbihhcmdzWzBdKSkge1xuICAgICAgbGliLmNhbGwoYXJnc1sxXSwgW10pXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG9wdGlvbmFsIGBlbHNlYFxuICAgICAgaWYoYXJnc1syXSkgbGliLmNhbGwoYXJnc1syXSwgW10pXG4gICAgfVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2lmZWwnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIGlmKGxpYi50b0pCb29sZWFuKGFyZ3NbMF0pKSB7XG4gICAgICBsaWIuY2FsbChhcmdzWzFdLCBbXSlcbiAgICB9IGVsc2Uge1xuICAgICAgbGliLmNhbGwoYXJnc1syXSwgW10pXG4gICAgfVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ29iaiddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIG5ldyBsaWIuTE9iamVjdCgpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snYXJyYXknXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBuZXcgbGliLkxBcnJheSgpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snKyddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihsaWIudG9KTnVtYmVyKHgpICsgbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWyctJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKGxpYi50b0pOdW1iZXIoeCkgLSBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJy8nXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobGliLnRvSk51bWJlcih4KSAvIGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snKiddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihsaWIudG9KTnVtYmVyKHgpICogbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydub3QnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2Jvb2xdKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKCFsaWIudG9KQm9vbGVhbihib29sKSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydhbmQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2IxLCBiMl0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSkJvb2xlYW4oYjEpICYmIGxpYi50b0pCb29sZWFuKGIyKSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydvciddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbYjEsIGIyXSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KQm9vbGVhbihiMSkgfHwgbGliLnRvSkJvb2xlYW4oYjIpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2x0J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KTnVtYmVyKHgpIDwgbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydndCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSk51bWJlcih4KSA+IGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snZXEnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pOdW1iZXIoeCkgPT09IGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snaXMnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIE9iamVjdC5pcyh4LCB5KVxuICB9KSk7XG5cbiAgdmFyaWFibGVzWydsb29wJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtmbl0pIHtcbiAgICB3aGlsZShsaWIudG9KQm9vbGVhbihsaWIuY2FsbChmbiwgW10pKSkge31cbiAgfSkpXG5cbiAgdmFyaWFibGVzWyd1c2UnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3BhdGhTdHJdKSB7XG4gICAgbGV0IHAgPSBsaWIudG9KU3RyaW5nKHBhdGhTdHIpXG4gICAgbGV0IGxvY2F0aW9uSW5CdWlsdGlucyA9IGAke19fZGlybmFtZX0vYnVpbHRpbl9saWIvJHtwfWBcbiAgICBjb25zb2xlLmxvZygnbG9jYXRpb24gaW4gYnVsaXRpbnM6JywgbG9jYXRpb25JbkJ1aWx0aW5zKVxuICAgIGxldCBleHQgPSBwYXRoLnBhcnNlKHApLmV4dFxuICAgIGlmKGV4aXN0cyhsb2NhdGlvbkluQnVpbHRpbnMpKSB7XG4gICAgICBpZihleHQgPT09ICcuanMnKSB7XG4gICAgICAgIGxldCB1c2VkID0gcmVxdWlyZShsb2NhdGlvbkluQnVpbHRpbnMpXG4gICAgICAgIGxldCB1c2VkT2JqID0gbGliLnRvTE9iamVjdCh1c2VkKVxuICAgICAgICByZXR1cm4gdXNlZE9ialxuICAgICAgfSBlbHNlIGlmKGV4dCA9PT0gJy50dWwnKSB7XG4gICAgICAgIGxldCBwcm9ncmFtID0gZnMucmVhZEZpbGVTeW5jKGxvY2F0aW9uSW5CdWlsdGlucykudG9TdHJpbmcoKVxuICAgICAgICBsZXQgcmVzdWx0ID0gcnVuLnJ1bihwcm9ncmFtKVxuICAgICAgICBpZignZXhwb3J0cycgaW4gcmVzdWx0LnZhcmlhYmxlcykge1xuICAgICAgICAgIHJldHVybiByZXN1bHQudmFyaWFibGVzLmV4cG9ydHMudmFsdWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV3IGxpYi5MT2JqZWN0KClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgYEludmFsaWQgdXNlIGV4dGVuc2lvbiBvZiAke3B9YFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnRmlsZSBub3QgZm91bmQnKVxuICAgIH1cbiAgfSkpXG5cbiAgbGV0IHZhcmlhYmxlT2JqZWN0ID0gbmV3IGxpYi5MT2JqZWN0KCk7XG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ21ha2UnLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbZW52LCBuYW1lLCB2YWx1ZV0pIHtcbiAgICBsZXQgdiA9IG5ldyBsaWIuVmFyaWFibGUodmFsdWUpXG4gICAgZW52LnZhcnNbbGliLnRvSlN0cmluZyhuYW1lKV0gPSB2XG4gICAgcmV0dXJuIHZcbiAgfSkpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ2NoYW5nZScsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt2YXJpYWJsZSwgbmV3VmFsdWVdKSB7XG4gICAgdmFyaWFibGUudmFsdWUgPSBuZXdWYWx1ZVxuICB9KSlcblxuICBsaWIuc2V0KHZhcmlhYmxlT2JqZWN0LCAndmFsdWUnLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbdmFyaWFibGVdKSB7XG4gICAgcmV0dXJuIHZhcmlhYmxlLnZhbHVlXG4gIH0pKVxuXG4gIGxpYi5zZXQodmFyaWFibGVPYmplY3QsICdmcm9tJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2VudiwgbmFtZV0pIHtcbiAgICB2YXIgbmFtZSA9IGxpYi50b0pTdHJpbmcobmFtZSlcbiAgICB2YXIgdmFyaWFibGUgPSBlbnYudmFyc1tuYW1lXVxuICAgIGlmICh0eXBlb2YgdmFyaWFibGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGFjY2VzcyB2YXJpYWJsZSAke25hbWV9IGJlY2F1c2UgaXQgZG9lc24ndCBleGlzdGApXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YXJpYWJsZVxuICAgIH1cbiAgfSkpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ2V4aXN0cycsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtlbnYsIG5hbWVdKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGVudi52YXJzLmhhc093blByb3BlcnR5KGxpYi50b0pTdHJpbmcobmFtZSkpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ1ZhcmlhYmxlJ10gPSBuZXcgbGliLlZhcmlhYmxlKHZhcmlhYmxlT2JqZWN0KVxuXG4gIHJldHVybiB2YXJpYWJsZXNcbn1cbiJdfQ==