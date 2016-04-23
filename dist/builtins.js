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

  variables['loop'] = new lib.Variable(new lib.LFunction(function (_ref21) {
    var _ref22 = _slicedToArray(_ref21, 1);

    var fn = _ref22[0];

    while (lib.toJBoolean(lib.call(fn, []))) {}
  }));

  variables['use'] = new lib.Variable(new lib.LFunction(function (_ref23) {
    var _ref24 = _slicedToArray(_ref23, 1);

    var pathStr = _ref24[0];

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

  return variables;
}
//# sourceMappingURL=data:application/json;base64,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SixDQUFRLE9BQVIsQ0FBYjtBQUNBLFlBQUcsYUFBYSxPQUFPLFNBQXZCLEVBQWtDO0FBQ2hDLGlCQUFPLE9BQU8sU0FBUCxDQUFpQixPQUFqQixDQUF5QixLQUFoQztBQUNELFNBRkQsTUFFTztBQUNMLGlCQUFPLElBQUksSUFBSSxPQUFSLEVBQVA7QUFDRDtBQUNGLE9BUk0sTUFRQTtBQUNMLDRDQUFrQyxDQUFsQztBQUNEO0FBQ0YsS0FoQkQsTUFnQk87QUFDTCxjQUFRLEdBQVIsQ0FBWSxnQkFBWjtBQUNEO0FBQ0YsR0F4Qm1DLENBQWpCLENBQW5COztBQTBCQSxTQUFPLFNBQVA7QUFDRCIsImZpbGUiOiJidWlsdGlucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuY29uc3QgcnVuID0gcmVxdWlyZSgnLi9ydW4nKVxuY29uc3QgaW50ZXJwID0gcmVxdWlyZSgnLi9pbnRlcnAnKVxuY29uc3QgbGliID0gcmVxdWlyZSgnLi9saWInKVxuY29uc3QgQyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJylcblxuZnVuY3Rpb24gZXhpc3RzKHApIHtcbiAgLy8gd2FybmluZywgdGhpcyBpcyBzeW5jaHJvbm91c1xuICB0cnkge1xuICAgIGZzLmFjY2Vzc1N5bmMocCwgZnMuRl9PSylcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGNhdGNoKGVycikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQnVpbHRpbnMoKSB7XG4gIGxldCB2YXJpYWJsZXMgPSB7fVxuXG4gIHZhcmlhYmxlc1sncHJpbnQnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIGNvbnNvbGUubG9nKCd7UHJpbnR9JywgLi4uYXJncy5tYXAoYXJnID0+IGxpYi50b0pTdHJpbmcoYXJnKSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snY29uY2F0J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gbGliLnRvTFN0cmluZyhhcmdzLm1hcChsaWIudG9KU3RyaW5nKS5qb2luKCcnKSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydpZiddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihhcmdzKSB7XG4gICAgaWYobGliLnRvSkJvb2xlYW4oYXJnc1swXSkpIHtcbiAgICAgIGxpYi5jYWxsKGFyZ3NbMV0sIFtdKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBvcHRpb25hbCBgZWxzZWBcbiAgICAgIGlmKGFyZ3NbMl0pIGxpYi5jYWxsKGFyZ3NbMl0sIFtdKVxuICAgIH1cbiAgfSkpXG5cbiAgdmFyaWFibGVzWydpZmVsJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBpZihsaWIudG9KQm9vbGVhbihhcmdzWzBdKSkge1xuICAgICAgbGliLmNhbGwoYXJnc1sxXSwgW10pXG4gICAgfSBlbHNlIHtcbiAgICAgIGxpYi5jYWxsKGFyZ3NbMl0sIFtdKVxuICAgIH1cbiAgfSkpXG5cbiAgdmFyaWFibGVzWydvYmonXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oYXJncykge1xuICAgIHJldHVybiBuZXcgbGliLkxPYmplY3QoKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2FycmF5J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gbmV3IGxpYi5MQXJyYXkoKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJysnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobGliLnRvSk51bWJlcih4KSArIGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snLSddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTE51bWJlcihsaWIudG9KTnVtYmVyKHgpIC0gbGliLnRvSk51bWJlcih5KSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWycvJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKGxpYi50b0pOdW1iZXIoeCkgLyBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJyonXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobGliLnRvSk51bWJlcih4KSAqIGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snbm90J10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtib29sXSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbighbGliLnRvSkJvb2xlYW4oYm9vbCkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snYW5kJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtiMSwgYjJdKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pCb29sZWFuKGIxKSAmJiBsaWIudG9KQm9vbGVhbihiMikpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snb3InXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2IxLCBiMl0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSkJvb2xlYW4oYjEpIHx8IGxpYi50b0pCb29sZWFuKGIyKSlcbiAgfSkpXG5cbiAgdmFyaWFibGVzWydsdCddID0gbmV3IGxpYi5WYXJpYWJsZShuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbeCwgeV0pIHtcbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4obGliLnRvSk51bWJlcih4KSA8IGxpYi50b0pOdW1iZXIoeSkpXG4gIH0pKVxuXG4gIHZhcmlhYmxlc1snZ3QnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3gsIHldKSB7XG4gICAgcmV0dXJuIGxpYi50b0xCb29sZWFuKGxpYi50b0pOdW1iZXIoeCkgPiBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2VxJ10gPSBuZXcgbGliLlZhcmlhYmxlKG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFt4LCB5XSkge1xuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihsaWIudG9KTnVtYmVyKHgpID09PSBsaWIudG9KTnVtYmVyKHkpKVxuICB9KSlcblxuICB2YXJpYWJsZXNbJ2xvb3AnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW2ZuXSkge1xuICAgIHdoaWxlKGxpYi50b0pCb29sZWFuKGxpYi5jYWxsKGZuLCBbXSkpKTtcbiAgfSkpXG5cbiAgdmFyaWFibGVzWyd1c2UnXSA9IG5ldyBsaWIuVmFyaWFibGUobmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW3BhdGhTdHJdKSB7XG4gICAgbGV0IHAgPSBsaWIudG9KU3RyaW5nKHBhdGhTdHIpXG4gICAgbGV0IGxvY2F0aW9uSW5CdWlsdGlucyA9IGAke19fZGlybmFtZX0vYnVpbHRpbl9saWIvJHtwfWBcbiAgICBjb25zb2xlLmxvZygnbG9jYXRpb24gaW4gYnVsaXRpbnM6JywgbG9jYXRpb25JbkJ1aWx0aW5zKVxuICAgIGxldCBleHQgPSBwYXRoLnBhcnNlKHApLmV4dFxuICAgIGlmKGV4aXN0cyhsb2NhdGlvbkluQnVpbHRpbnMpKSB7XG4gICAgICBpZihleHQgPT09ICcuanMnKSB7XG4gICAgICAgIGxldCB1c2VkID0gcmVxdWlyZShsb2NhdGlvbkluQnVpbHRpbnMpXG4gICAgICAgIGxldCB1c2VkT2JqID0gbGliLnRvTE9iamVjdCh1c2VkKVxuICAgICAgICByZXR1cm4gdXNlZE9ialxuICAgICAgfSBlbHNlIGlmKGV4dCA9PT0gJy50dWwnKSB7XG4gICAgICAgIGxldCBwcm9ncmFtID0gZnMucmVhZEZpbGVTeW5jKGxvY2F0aW9uSW5CdWlsdGlucykudG9TdHJpbmcoKVxuICAgICAgICBsZXQgcmVzdWx0ID0gcnVuLnJ1bihwcm9ncmFtKVxuICAgICAgICBpZignZXhwb3J0cycgaW4gcmVzdWx0LnZhcmlhYmxlcykge1xuICAgICAgICAgIHJldHVybiByZXN1bHQudmFyaWFibGVzLmV4cG9ydHMudmFsdWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV3IGxpYi5MT2JqZWN0KClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgYEludmFsaWQgdXNlIGV4dGVuc2lvbiBvZiAke3B9YFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnRmlsZSBub3QgZm91bmQnKVxuICAgIH1cbiAgfSkpXG5cbiAgcmV0dXJuIHZhcmlhYmxlc1xufVxuIl19