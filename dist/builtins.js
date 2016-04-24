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
//# sourceMappingURL=data:application/json;base64,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QWxDOztBQUlBLE1BQUksR0FBSixDQUFRLGNBQVIsRUFBd0IsT0FBeEIsRUFBaUMsSUFBSSxJQUFJLFNBQVIsQ0FBa0Isa0JBQXFCO0FBQUE7O0FBQUEsUUFBWCxRQUFXOztBQUN0RSxXQUFPLFNBQVMsS0FBaEI7QUFDRCxHQUZnQyxDQUFqQzs7QUFJQSxNQUFJLEdBQUosQ0FBUSxjQUFSLEVBQXdCLE1BQXhCLEVBQWdDLElBQUksSUFBSSxTQUFSLENBQWtCLGtCQUFzQjtBQUFBOztBQUFBLFFBQVosR0FBWTtBQUFBLFFBQVAsSUFBTzs7QUFDdEUsUUFBSSxPQUFPLElBQUksU0FBSixDQUFjLElBQWQsQ0FBWDtBQUNBLFFBQUksV0FBVyxJQUFJLElBQUosQ0FBUyxJQUFULENBQWY7QUFDQSxRQUFJLE9BQU8sUUFBUCxLQUFvQixXQUF4QixFQUFxQztBQUNuQyxZQUFNLElBQUksS0FBSiw2QkFBbUMsSUFBbkMsZ0NBQU47QUFDRCxLQUZELE1BRU87QUFDTCxhQUFPLFFBQVA7QUFDRDtBQUNGLEdBUitCLENBQWhDOztBQVVBLE1BQUksR0FBSixDQUFRLGNBQVIsRUFBd0IsUUFBeEIsRUFBa0MsSUFBSSxJQUFJLFNBQVIsQ0FBa0Isa0JBQXNCO0FBQUE7O0FBQUEsUUFBWixHQUFZO0FBQUEsUUFBUCxJQUFPOztBQUN4RSxXQUFPLElBQUksVUFBSixDQUFlLElBQUksSUFBSixDQUFTLGNBQVQsQ0FBd0IsSUFBSSxTQUFKLENBQWMsSUFBZCxDQUF4QixDQUFmLENBQVA7QUFDRCxHQUZpQyxDQUFsQzs7QUFJQSxZQUFVLFVBQVYsSUFBd0IsSUFBSSxJQUFJLFFBQVIsQ0FBaUIsY0FBakIsQ0FBeEI7O0FBRUEsU0FBTyxTQUFQO0FBQ0QiLCJmaWxlIjoiYnVpbHRpbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbmNvbnN0IHJ1biA9IHJlcXVpcmUoJy4vcnVuJylcbmNvbnN0IGludGVycCA9IHJlcXVpcmUoJy4vaW50ZXJwJylcbmNvbnN0IGxpYiA9IHJlcXVpcmUoJy4vbGliJylcbmNvbnN0IEMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpXG5cbmZ1bmN0aW9uIGV4aXN0cyhwKSB7XG4gIC8vIHdhcm5pbmcsIHRoaXMgaXMgc3luY2hyb25vdXNcbiAgdHJ5IHtcbiAgICBmcy5hY2Nlc3NTeW5jKHAsIGZzLkZfT0spXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VCdWlsdGlucygpIHtcbiAgbGV0IHZhcmlhYmxlcyA9IHt9XG5cbiAgdmFyaWFibGVzWydwcmludCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgY29uc29sZS5sb2coJ3tQcmludH0nLCAuLi5hcmdzLm1hcChhcmcgPT4gbGliLnRvSlN0cmluZyhhcmcpKSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydjb25jYXQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBsaWIudG9MU3RyaW5nKGFyZ3MubWFwKGxpYi50b0pTdHJpbmcpLmpvaW4oJycpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2lmJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBpZiAobGliLnRvSkJvb2xlYW4oYXJnc1swXSkpIHtcbiAgICAgIGxpYi5jYWxsKGFyZ3NbMV0sIFtdKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBvcHRpb25hbCBgZWxzZWBcbiAgICAgIGlmIChhcmdzWzJdKSBsaWIuY2FsbChhcmdzWzJdLCBbXSlcbiAgICB9XG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snaWZlbCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgaWYgKGxpYi50b0pCb29sZWFuKGFyZ3NbMF0pKSB7XG4gICAgICBsaWIuY2FsbChhcmdzWzFdLCBbXSlcbiAgICB9IGVsc2Uge1xuICAgICAgbGliLmNhbGwoYXJnc1syXSwgW10pXG4gICAgfVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ29iaiddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIG5ldyBsaWIuTE9iamVjdCgpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snYXJyYXknXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBuZXcgbGliLkxBcnJheSgpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snKyddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihsaWIudG9KTnVtYmVyKHgpICsgbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWyctJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKGxpYi50b0pOdW1iZXIoeCkgLSBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJy8nXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobGliLnRvSk51bWJlcih4KSAvIGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snKiddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihsaWIudG9KTnVtYmVyKHgpICogbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydub3QnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2Jvb2xdKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKCFsaWIudG9KQm9vbGVhbihib29sKSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydhbmQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2IxLCBiMl0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSkJvb2xlYW4oYjEpICYmIGxpYi50b0pCb29sZWFuKGIyKSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydvciddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbYjEsIGIyXSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KQm9vbGVhbihiMSkgfHwgbGliLnRvSkJvb2xlYW4oYjIpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2x0J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KTnVtYmVyKHgpIDwgbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydndCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSk51bWJlcih4KSA+IGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snZXEnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pOdW1iZXIoeCkgPT09IGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snaXMnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIE9iamVjdC5pcyh4LCB5KVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2xvb3AnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2ZuXSkge1xuICAgIHdoaWxlIChsaWIudG9KQm9vbGVhbihsaWIuY2FsbChmbiwgW10pKSkge31cbiAgfSkpXG5cbiAgdmFyaWFibGVzWyd1c2UnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3BhdGhTdHJdKSB7XG4gICAgbGV0IHAgPSBsaWIudG9KU3RyaW5nKHBhdGhTdHIpXG4gICAgbGV0IGxvY2F0aW9uSW5CdWlsdGlucyA9IGAke19fZGlybmFtZX0vYnVpbHRpbl9saWIvJHtwfWBcbiAgICBjb25zb2xlLmxvZygnbG9jYXRpb24gaW4gYnVsaXRpbnM6JywgbG9jYXRpb25JbkJ1aWx0aW5zKVxuICAgIGxldCBleHQgPSBwYXRoLnBhcnNlKHApLmV4dFxuICAgIGlmIChleGlzdHMobG9jYXRpb25JbkJ1aWx0aW5zKSkge1xuICAgICAgaWYgKGV4dCA9PT0gJy5qcycpIHtcbiAgICAgICAgbGV0IHVzZWQgPSByZXF1aXJlKGxvY2F0aW9uSW5CdWlsdGlucylcbiAgICAgICAgbGV0IHVzZWRPYmogPSBsaWIudG9MT2JqZWN0KHVzZWQpXG4gICAgICAgIHJldHVybiB1c2VkT2JqXG4gICAgICB9IGVsc2UgaWYgKGV4dCA9PT0gJy50dWwnKSB7XG4gICAgICAgIGxldCBwcm9ncmFtID0gZnMucmVhZEZpbGVTeW5jKGxvY2F0aW9uSW5CdWlsdGlucykudG9TdHJpbmcoKVxuICAgICAgICBsZXQgcmVzdWx0ID0gcnVuLnJ1bihwcm9ncmFtKVxuICAgICAgICBpZiAoJ2V4cG9ydHMnIGluIHJlc3VsdC52YXJpYWJsZXMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LnZhcmlhYmxlcy5leHBvcnRzLnZhbHVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBsaWIuTE9iamVjdCgpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGBJbnZhbGlkIHVzZSBleHRlbnNpb24gb2YgJHtwfWBcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ0ZpbGUgbm90IGZvdW5kJylcbiAgICB9XG4gIH0pKVxuXG4gIGxldCB2YXJpYWJsZU9iamVjdCA9IG5ldyBsaWIuTE9iamVjdCgpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ21ha2UnLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbZW52LCBuYW1lLCB2YWx1ZV0pIHtcbiAgICBsZXQgdiA9IG5ldyBsaWIuVmFyaWFibGUodmFsdWUpXG4gICAgZW52LnZhcnNbbGliLnRvSlN0cmluZyhuYW1lKV0gPSB2XG4gICAgcmV0dXJuIHZcbiAgfSkpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ2NoYW5nZScsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt2YXJpYWJsZSwgbmV3VmFsdWVdKSB7XG4gICAgdmFyaWFibGUudmFsdWUgPSBuZXdWYWx1ZVxuICB9KSlcblxuICBsaWIuc2V0KHZhcmlhYmxlT2JqZWN0LCAndmFsdWUnLCBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbdmFyaWFibGVdKSB7XG4gICAgcmV0dXJuIHZhcmlhYmxlLnZhbHVlXG4gIH0pKVxuXG4gIGxpYi5zZXQodmFyaWFibGVPYmplY3QsICdmcm9tJywgbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2VudiwgbmFtZV0pIHtcbiAgICB2YXIgbmFtZSA9IGxpYi50b0pTdHJpbmcobmFtZSlcbiAgICB2YXIgdmFyaWFibGUgPSBlbnYudmFyc1tuYW1lXVxuICAgIGlmICh0eXBlb2YgdmFyaWFibGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGFjY2VzcyB2YXJpYWJsZSAke25hbWV9IGJlY2F1c2UgaXQgZG9lc24ndCBleGlzdGApXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YXJpYWJsZVxuICAgIH1cbiAgfSkpXG5cbiAgbGliLnNldCh2YXJpYWJsZU9iamVjdCwgJ2V4aXN0cycsIG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtlbnYsIG5hbWVdKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGVudi52YXJzLmhhc093blByb3BlcnR5KGxpYi50b0pTdHJpbmcobmFtZSkpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ1ZhcmlhYmxlJ10gPSBuZXcgbGliLlZhcmlhYmxlKHZhcmlhYmxlT2JqZWN0KVxuXG4gIHJldHVybiB2YXJpYWJsZXNcbn1cbiJdfQ==