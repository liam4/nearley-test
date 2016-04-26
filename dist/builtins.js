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
//# sourceMappingURL=data:application/json;base64,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OztBQUFBLFFBQVosR0FBWTtBQUFBLFFBQVAsSUFBTzs7QUFDeEUsV0FBTyxJQUFJLFVBQUosQ0FBZSxJQUFJLElBQUosQ0FBUyxjQUFULENBQXdCLElBQUksU0FBSixDQUFjLElBQWQsQ0FBeEIsQ0FBZixDQUFQO0FBQ0QsR0FGaUMsQ0FBbEM7O0FBSUEsWUFBVSxVQUFWLElBQXdCLElBQUksSUFBSSxRQUFSLENBQWlCLGNBQWpCLENBQXhCOztBQUVBLFNBQU8sU0FBUDtBQUNEIiwiZmlsZSI6ImJ1aWx0aW5zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5jb25zdCBydW4gPSByZXF1aXJlKCcuL3J1bicpXG5jb25zdCBpbnRlcnAgPSByZXF1aXJlKCcuL2ludGVycCcpXG5jb25zdCBsaWIgPSByZXF1aXJlKCcuL2xpYicpXG5jb25zdCBDID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKVxuXG5mdW5jdGlvbiBleGlzdHMocCkge1xuICAvLyB3YXJuaW5nLCB0aGlzIGlzIHN5bmNocm9ub3VzXG4gIHRyeSB7XG4gICAgZnMuYWNjZXNzU3luYyhwLCBmcy5GX09LKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQnVpbHRpbnMoKSB7XG4gIGxldCB2YXJpYWJsZXMgPSB7fVxuXG4gIHZhcmlhYmxlc1sncHJpbnQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIGNvbnNvbGUubG9nKCd7UHJpbnR9JywgLi4uYXJncy5tYXAoYXJnID0+IGxpYi50b0pTdHJpbmcoYXJnKSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snY29uY2F0J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gbGliLnRvTFN0cmluZyhhcmdzLm1hcChsaWIudG9KU3RyaW5nKS5qb2luKCcnKSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydpZiddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgaWYgKGxpYi50b0pCb29sZWFuKGFyZ3NbMF0pKSB7XG4gICAgICBsaWIuY2FsbChhcmdzWzFdLCBbXSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gb3B0aW9uYWwgYGVsc2VgXG4gICAgICBpZiAoYXJnc1syXSkgbGliLmNhbGwoYXJnc1syXSwgW10pXG4gICAgfVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2lmZWwnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIGlmIChsaWIudG9KQm9vbGVhbihhcmdzWzBdKSkge1xuICAgICAgbGliLmNhbGwoYXJnc1sxXSwgW10pXG4gICAgfSBlbHNlIHtcbiAgICAgIGxpYi5jYWxsKGFyZ3NbMl0sIFtdKVxuICAgIH1cbiAgfSkpXG5cbiAgdmFyaWFibGVzWydvYmonXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBuZXcgbGliLkxPYmplY3QoKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2FycmF5J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gbmV3IGxpYi5MQXJyYXkoKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJysnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobGliLnRvSk51bWJlcih4KSArIGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJ2FkZCddID0gdmFyaWFibGVzWycrJ11cblxuICB2YXJpYWJsZXNbJy0nXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobGliLnRvSk51bWJlcih4KSAtIGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuICB2YXJpYWJsZXNbJ21pbnVzJ10gPSB2YXJpYWJsZXNbJy0nXVxuXG4gIHZhcmlhYmxlc1snLyddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihsaWIudG9KTnVtYmVyKHgpIC8gbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snZGl2aWRlJ10gPSB2YXJpYWJsZXNbJy8nXVxuXG4gIHZhcmlhYmxlc1snKiddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihsaWIudG9KTnVtYmVyKHgpICogbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snbXVsdGlwbHknXSA9IHZhcmlhYmxlc1snJiddXG5cbiAgdmFyaWFibGVzWydub3QnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2Jvb2xdKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKCFsaWIudG9KQm9vbGVhbihib29sKSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snISddID0gdmFyaWFibGVzWydub3QnXVxuXG4gIHZhcmlhYmxlc1snYW5kJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtiMSwgYjJdKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pCb29sZWFuKGIxKSAmJiBsaWIudG9KQm9vbGVhbihiMikpXG4gIH0pKVxuICB2YXJpYWJsZXNbJyYnXSA9IHZhcmlhYmxlc1snYW5kJ11cblxuICB2YXJpYWJsZXNbJ29yJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtiMSwgYjJdKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pCb29sZWFuKGIxKSB8fCBsaWIudG9KQm9vbGVhbihiMikpXG4gIH0pKVxuICB2YXJpYWJsZXNbJ3wnXSA9IHZhcmlhYmxlc1snb3InXVxuXG4gIHZhcmlhYmxlc1snbHQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pOdW1iZXIoeCkgPCBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcbiAgdmFyaWFibGVzWyc8J10gPSB2YXJpYWJsZXNbJ2x0J11cblxuICB2YXJpYWJsZXNbJ2d0J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KTnVtYmVyKHgpID4gbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snPiddID0gdmFyaWFibGVzWydndCddXG5cbiAgdmFyaWFibGVzWydlcSddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSk51bWJlcih4KSA9PT0gbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG4gIHZhcmlhYmxlc1snPSddID0gdmFyaWFibGVzWydlcSddXG5cbiAgdmFyaWFibGVzWydpcyddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gT2JqZWN0LmlzKHgsIHkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snbG9vcCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbZm5dKSB7XG4gICAgd2hpbGUgKGxpYi50b0pCb29sZWFuKGxpYi5jYWxsKGZuLCBbXSkpKSB7IC8qIGVtcHR5ICovIH1cbiAgfSkpXG5cbiAgdmFyaWFibGVzWyd1c2UnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3BhdGhTdHJdKSB7XG4gICAgbGV0IHAgPSBsaWIudG9KU3RyaW5nKHBhdGhTdHIpXG4gICAgbGV0IGxvY2F0aW9uSW5CdWlsdGlucyA9IGAke19fZGlybmFtZX0vYnVpbHRpbl9saWIvJHtwfWBcbiAgICBjb25zb2xlLmxvZygnbG9jYXRpb24gaW4gYnVsaXRpbnM6JywgbG9jYXRpb25JbkJ1aWx0aW5zKVxuICAgIGxldCBleHQgPSBwYXRoLnBhcnNlKHApLmV4dFxuICAgIGlmIChleGlzdHMobG9jYXRpb25JbkJ1aWx0aW5zKSkge1xuICAgICAgaWYgKGV4dCA9PT0gJy5qcycpIHtcbiAgICAgICAgbGV0IHVzZWQgPSByZXF1aXJlKGxvY2F0aW9uSW5CdWlsdGlucylcbiAgICAgICAgbGV0IHVzZWRPYmogPSBsaWIudG9MT2JqZWN0KHVzZWQpXG4gICAgICAgIHJldHVybiB1c2VkT2JqXG4gICAgICB9IGVsc2UgaWYgKGV4dCA9PT0gJy50dWwnKSB7XG4gICAgICAgIGxldCBwcm9ncmFtID0gZnMucmVhZEZpbGVTeW5jKGxvY2F0aW9uSW5CdWlsdGlucykudG9TdHJpbmcoKVxuICAgICAgICBsZXQgcmVzdWx0ID0gcnVuLnJ1bihwcm9ncmFtKVxuICAgICAgICBpZiAoJ2V4cG9ydHMnIGluIHJlc3VsdC52YXJpYWJsZXMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LnZhcmlhYmxlcy5leHBvcnRzLnZhbHVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBsaWIuTE9iamVjdCgpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGBJbnZhbGlkIHVzZSBleHRlbnNpb24gb2YgJHtwfWBcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ0ZpbGUgbm90IGZvdW5kJylcbiAgICB9XG4gIH0pKVxuXG4gIGxldCB2YXJpYWJsZU9iamVjdCA9IG5ldyBsaWIuTE9iamVjdCgpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ21ha2UnLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbZW52LCBuYW1lLCB2YWx1ZV0pIHtcbiAgICBsZXQgdiA9IG5ldyBsaWIuVmFyaWFibGUodmFsdWUpXG4gICAgZW52LnZhcnNbbGliLnRvSlN0cmluZyhuYW1lKV0gPSB2XG4gICAgcmV0dXJuIHZcbiAgfSkpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ2NoYW5nZScsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt2YXJpYWJsZSwgbmV3VmFsdWVdKSB7XG4gICAgdmFyaWFibGUudmFsdWUgPSBuZXdWYWx1ZVxuICB9KSlcblxuICBsaWIuc2V0KHZhcmlhYmxlT2JqZWN0LCAndmFsdWUnLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbdmFyaWFibGVdKSB7XG4gICAgcmV0dXJuIHZhcmlhYmxlLnZhbHVlXG4gIH0pKVxuXG4gIGxpYi5zZXQodmFyaWFibGVPYmplY3QsICdmcm9tJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2VudiwgbmFtZV0pIHtcbiAgICBuYW1lID0gbGliLnRvSlN0cmluZyhuYW1lKVxuICAgIGxldCB2YXJpYWJsZSA9IGVudi52YXJzW25hbWVdXG4gICAgaWYgKHR5cGVvZiB2YXJpYWJsZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgYWNjZXNzIHZhcmlhYmxlICR7bmFtZX0gYmVjYXVzZSBpdCBkb2Vzbid0IGV4aXN0YClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHZhcmlhYmxlXG4gICAgfVxuICB9KSlcblxuICBsaWIuc2V0KHZhcmlhYmxlT2JqZWN0LCAnZXhpc3RzJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2VudiwgbmFtZV0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4oZW52LnZhcnMuaGFzT3duUHJvcGVydHkobGliLnRvSlN0cmluZyhuYW1lKSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snVmFyaWFibGUnXSA9IG5ldyBsaWIuVmFyaWFibGUodmFyaWFibGVPYmplY3QpXG5cbiAgcmV0dXJuIHZhcmlhYmxlc1xufVxuIl19