'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var lib = require('../lib');
var http = require('http');
var https = require('https');
var url = require('url');

var LHTTPServerResponse = exports.LHTTPServerResponse = function (_lib$LObject) {
  _inherits(LHTTPServerResponse, _lib$LObject);

  function LHTTPServerResponse(res) {
    _classCallCheck(this, LHTTPServerResponse);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LHTTPServerResponse).call(this));

    _this['__constructor__'] = LHTTPServerResponse;
    _this.res = res;
    return _this;
  }

  return LHTTPServerResponse;
}(lib.LObject);

var LHTTPServerResponsePrototype = {
  write: new lib.LFunction(function (self, _ref) {
    var _ref2 = _slicedToArray(_ref, 1);

    var what = _ref2[0];

    self.res.write(lib.toJString(what));
  }),
  end: new lib.LFunction(function (self) {
    self.res.end();
  })
};

LHTTPServerResponse['__prototype__'] = LHTTPServerResponsePrototype;
LHTTPServerResponse['__super__'] = lib.LObject;

var LHTTPServerRequest = exports.LHTTPServerRequest = function (_lib$LObject2) {
  _inherits(LHTTPServerRequest, _lib$LObject2);

  function LHTTPServerRequest(req) {
    _classCallCheck(this, LHTTPServerRequest);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(LHTTPServerRequest).call(this));

    _this2['__constructor__'] = LHTTPServerRequest;
    _this2.req = req;
    return _this2;
  }

  return LHTTPServerRequest;
}(lib.LObject);

var LHTTPServerRequestPrototype = {
  url: new lib.LFunction(function (self) {
    return lib.toLString(self.req.url);
  }),
  method: new lib.LFunction(function (self) {
    return lib.toLString(self.req.method);
  })
};

LHTTPServerRequest['__prototype__'] = LHTTPServerRequestPrototype;
LHTTPServerRequest['__super__'] = lib.LObject;

var LHTTPServer = exports.LHTTPServer = function (_lib$LObject3) {
  _inherits(LHTTPServer, _lib$LObject3);

  function LHTTPServer(handle) {
    _classCallCheck(this, LHTTPServer);

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(LHTTPServer).call(this));

    _this3['__constructor__'] = LHTTPServer;

    _this3.server = http.createServer(function (req, res) {
      lib.call(handle, [new LHTTPServerRequest(req), new LHTTPServerResponse(res)]);
    });
    return _this3;
  }

  return LHTTPServer;
}(lib.LObject);

var LHTTPServerPrototype = {
  listen: new lib.LFunction(function (self, _ref3) {
    var _ref4 = _slicedToArray(_ref3, 1);

    var port = _ref4[0];

    port = lib.toJNumber(port);
    self.server.listen(port);
  })
};

LHTTPServer['__prototype__'] = LHTTPServerPrototype;
LHTTPServer['__super__'] = lib.LObject;

var LHTTPRequest = exports.LHTTPRequest = function (_lib$LObject4) {
  _inherits(LHTTPRequest, _lib$LObject4);

  function LHTTPRequest(method, url, callback) {
    _classCallCheck(this, LHTTPRequest);

    var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(LHTTPRequest).call(this));

    _this4['__constructor__'] = LHTTPRequest;
    _this4.method = method;
    _this4.url = url;
    _this4.cb = callback;
    return _this4;
  }

  return LHTTPRequest;
}(lib.LObject);

var LHTTPRequestPrototype = {
  send: new lib.LFunction(function (self) {
    var handle = function handle(response) {
      var body = '';
      response.setEncoding('utf8');
      response.on('data', function (d) {
        body += d.toString();
      });
      response.on('end', function () {
        lib.call(self.cb, [lib.toLString(body)]);
      });
    };

    var u = url.parse(lib.toJString(self.url));
    var isGet = lib.toJString(self.method).toLowerCase() === 'get';
    if (u.protocol === 'http:') {
      if (isGet) {
        http.get(lib.toJString(self.url), handle);
      } else {
        console.log('Invalid method:', lib.toJString(self.method));
      }
    } else if (u.protocol === 'https:') {
      if (isGet) {
        https.get(lib.toJString(self.url), handle);
      } else {
        console.log('Invalid method:', lib.toJString(self.method));
      }
    } else {
      console.log('Invalid protocol:', u.protocol);
    }
  })
};

LHTTPRequest['__prototype__'] = LHTTPRequestPrototype;
LHTTPRequest['__super__'] = lib.LObject;

var server = exports.server = new lib.LFunction(function (_ref5) {
  var _ref6 = _slicedToArray(_ref5, 1);

  var handle = _ref6[0];

  return new LHTTPServer(handle);
});

var request = exports.request = new lib.LFunction(function (_ref7) {
  var _ref8 = _slicedToArray(_ref7, 3);

  var method = _ref8[0];
  var url = _ref8[1];
  var callback = _ref8[2];

  return new LHTTPRequest(method, url, callback);
});
//# sourceMappingURL=data:application/json;base64,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QUFJLFNBQUosQ0FBYyxLQUFLLE1BQUwsQ0FBN0MsRUFESztPQUZQO0tBREYsTUFNTyxJQUFJLEVBQUUsUUFBRixLQUFlLFFBQWYsRUFBeUI7QUFDbEMsVUFBSSxLQUFKLEVBQVc7QUFDVCxjQUFNLEdBQU4sQ0FBVSxJQUFJLFNBQUosQ0FBYyxLQUFLLEdBQUwsQ0FBeEIsRUFBbUMsTUFBbkMsRUFEUztPQUFYLE1BRU87QUFDTCxnQkFBUSxHQUFSLENBQVksaUJBQVosRUFBK0IsSUFBSSxTQUFKLENBQWMsS0FBSyxNQUFMLENBQTdDLEVBREs7T0FGUDtLQURLLE1BTUE7QUFDTCxjQUFRLEdBQVIsQ0FBWSxtQkFBWixFQUFpQyxFQUFFLFFBQUYsQ0FBakMsQ0FESztLQU5BO0dBcEJlLENBQXhCO0NBREU7O0FBaUNKLGFBQWEsZUFBYixJQUFnQyxxQkFBaEM7QUFDQSxhQUFhLFdBQWIsSUFBNEIsSUFBSSxPQUFKOztBQUVyQixJQUFJLDBCQUFTLElBQUksSUFBSSxTQUFKLENBQWMsaUJBQW1COzs7TUFBVCxrQkFBUzs7QUFDdkQsU0FBTyxJQUFJLFdBQUosQ0FBZ0IsTUFBaEIsQ0FBUCxDQUR1RDtDQUFuQixDQUEzQjs7QUFJSixJQUFJLDRCQUFVLElBQUksSUFBSSxTQUFKLENBQWMsaUJBQWtDOzs7TUFBeEIsa0JBQXdCO01BQWhCLGVBQWdCO01BQVgsb0JBQVc7O0FBQ3ZFLFNBQU8sSUFBSSxZQUFKLENBQWlCLE1BQWpCLEVBQXlCLEdBQXpCLEVBQThCLFFBQTlCLENBQVAsQ0FEdUU7Q0FBbEMsQ0FBNUIiLCJmaWxlIjoiYnVpbHRpbl9saWIvaHR0cC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGxpYiA9IHJlcXVpcmUoJy4uL2xpYicpXG5jb25zdCBodHRwID0gcmVxdWlyZSgnaHR0cCcpXG5jb25zdCBodHRwcyA9IHJlcXVpcmUoJ2h0dHBzJylcbmNvbnN0IHVybCA9IHJlcXVpcmUoJ3VybCcpXG5cbmV4cG9ydCBjbGFzcyBMSFRUUFNlcnZlclJlc3BvbnNlIGV4dGVuZHMgbGliLkxPYmplY3Qge1xuICBjb25zdHJ1Y3RvcihyZXMpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpc1snX19jb25zdHJ1Y3Rvcl9fJ10gPSBMSFRUUFNlcnZlclJlc3BvbnNlXG4gICAgdGhpcy5yZXMgPSByZXNcbiAgfVxufVxuXG5sZXQgTEhUVFBTZXJ2ZXJSZXNwb25zZVByb3RvdHlwZSA9IHtcbiAgd3JpdGU6IG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKHNlbGYsIFt3aGF0XSkge1xuICAgIHNlbGYucmVzLndyaXRlKGxpYi50b0pTdHJpbmcod2hhdCkpXG4gIH0pLFxuICBlbmQ6IG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKHNlbGYpIHtcbiAgICBzZWxmLnJlcy5lbmQoKVxuICB9KVxufVxuXG5MSFRUUFNlcnZlclJlc3BvbnNlWydfX3Byb3RvdHlwZV9fJ10gPSBMSFRUUFNlcnZlclJlc3BvbnNlUHJvdG90eXBlXG5MSFRUUFNlcnZlclJlc3BvbnNlWydfX3N1cGVyX18nXSA9IGxpYi5MT2JqZWN0XG5cbmV4cG9ydCBjbGFzcyBMSFRUUFNlcnZlclJlcXVlc3QgZXh0ZW5kcyBsaWIuTE9iamVjdCB7XG4gIGNvbnN0cnVjdG9yKHJlcSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzWydfX2NvbnN0cnVjdG9yX18nXSA9IExIVFRQU2VydmVyUmVxdWVzdFxuICAgIHRoaXMucmVxID0gcmVxXG4gIH1cbn1cblxubGV0IExIVFRQU2VydmVyUmVxdWVzdFByb3RvdHlwZSA9IHtcbiAgdXJsOiBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihzZWxmKSB7XG4gICAgcmV0dXJuIGxpYi50b0xTdHJpbmcoc2VsZi5yZXEudXJsKVxuICB9KSxcbiAgbWV0aG9kOiBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihzZWxmKSB7XG4gICAgcmV0dXJuIGxpYi50b0xTdHJpbmcoc2VsZi5yZXEubWV0aG9kKVxuICB9KVxufVxuXG5MSFRUUFNlcnZlclJlcXVlc3RbJ19fcHJvdG90eXBlX18nXSA9IExIVFRQU2VydmVyUmVxdWVzdFByb3RvdHlwZVxuTEhUVFBTZXJ2ZXJSZXF1ZXN0WydfX3N1cGVyX18nXSA9IGxpYi5MT2JqZWN0XG5cbmV4cG9ydCBjbGFzcyBMSFRUUFNlcnZlciBleHRlbmRzIGxpYi5MT2JqZWN0IHtcbiAgY29uc3RydWN0b3IoaGFuZGxlKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXNbJ19fY29uc3RydWN0b3JfXyddID0gTEhUVFBTZXJ2ZXJcblxuICAgIHRoaXMuc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoZnVuY3Rpb24ocmVxLCByZXMpIHtcbiAgICAgIGxpYi5jYWxsKGhhbmRsZSwgW1xuICAgICAgICBuZXcgTEhUVFBTZXJ2ZXJSZXF1ZXN0KHJlcSksIG5ldyBMSFRUUFNlcnZlclJlc3BvbnNlKHJlcyldKVxuICAgIH0pXG4gIH1cbn1cblxubGV0IExIVFRQU2VydmVyUHJvdG90eXBlID0ge1xuICBsaXN0ZW46IG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKHNlbGYsIFtwb3J0XSkge1xuICAgIHBvcnQgPSBsaWIudG9KTnVtYmVyKHBvcnQpXG4gICAgc2VsZi5zZXJ2ZXIubGlzdGVuKHBvcnQpXG4gIH0pXG59XG5cbkxIVFRQU2VydmVyWydfX3Byb3RvdHlwZV9fJ10gPSBMSFRUUFNlcnZlclByb3RvdHlwZVxuTEhUVFBTZXJ2ZXJbJ19fc3VwZXJfXyddID0gbGliLkxPYmplY3RcblxuZXhwb3J0IGNsYXNzIExIVFRQUmVxdWVzdCBleHRlbmRzIGxpYi5MT2JqZWN0IHtcbiAgY29uc3RydWN0b3IobWV0aG9kLCB1cmwsIGNhbGxiYWNrKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXNbJ19fY29uc3RydWN0b3JfXyddID0gTEhUVFBSZXF1ZXN0XG4gICAgdGhpcy5tZXRob2QgPSBtZXRob2RcbiAgICB0aGlzLnVybCA9IHVybFxuICAgIHRoaXMuY2IgPSBjYWxsYmFja1xuICB9XG59XG5cblxubGV0IExIVFRQUmVxdWVzdFByb3RvdHlwZSA9IHtcbiAgc2VuZDogbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oc2VsZikge1xuICAgIGxldCBoYW5kbGUgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgbGV0IGJvZHkgPSAnJ1xuICAgICAgcmVzcG9uc2Uuc2V0RW5jb2RpbmcoJ3V0ZjgnKVxuICAgICAgcmVzcG9uc2Uub24oJ2RhdGEnLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIGJvZHkgKz0gZC50b1N0cmluZygpXG4gICAgICB9KVxuICAgICAgcmVzcG9uc2Uub24oJ2VuZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBsaWIuY2FsbChzZWxmLmNiLCBbbGliLnRvTFN0cmluZyhib2R5KV0pXG4gICAgICB9KVxuICAgIH1cblxuICAgIGxldCB1ID0gdXJsLnBhcnNlKGxpYi50b0pTdHJpbmcoc2VsZi51cmwpKVxuICAgIGxldCBpc0dldCA9IGxpYi50b0pTdHJpbmcoc2VsZi5tZXRob2QpLnRvTG93ZXJDYXNlKCkgPT09ICdnZXQnXG4gICAgaWYgKHUucHJvdG9jb2wgPT09ICdodHRwOicpIHtcbiAgICAgIGlmIChpc0dldCkge1xuICAgICAgICBodHRwLmdldChsaWIudG9KU3RyaW5nKHNlbGYudXJsKSwgaGFuZGxlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0ludmFsaWQgbWV0aG9kOicsIGxpYi50b0pTdHJpbmcoc2VsZi5tZXRob2QpKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodS5wcm90b2NvbCA9PT0gJ2h0dHBzOicpIHtcbiAgICAgIGlmIChpc0dldCkge1xuICAgICAgICBodHRwcy5nZXQobGliLnRvSlN0cmluZyhzZWxmLnVybCksIGhhbmRsZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdJbnZhbGlkIG1ldGhvZDonLCBsaWIudG9KU3RyaW5nKHNlbGYubWV0aG9kKSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ0ludmFsaWQgcHJvdG9jb2w6JywgdS5wcm90b2NvbClcbiAgICB9XG4gIH0pXG59XG5cbkxIVFRQUmVxdWVzdFsnX19wcm90b3R5cGVfXyddID0gTEhUVFBSZXF1ZXN0UHJvdG90eXBlXG5MSFRUUFJlcXVlc3RbJ19fc3VwZXJfXyddID0gbGliLkxPYmplY3RcblxuZXhwb3J0IGxldCBzZXJ2ZXIgPSBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihbaGFuZGxlXSkge1xuICByZXR1cm4gbmV3IExIVFRQU2VydmVyKGhhbmRsZSlcbn0pXG5cbmV4cG9ydCBsZXQgcmVxdWVzdCA9IG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFttZXRob2QsIHVybCwgY2FsbGJhY2tdKSB7XG4gIHJldHVybiBuZXcgTEhUVFBSZXF1ZXN0KG1ldGhvZCwgdXJsLCBjYWxsYmFjaylcbn0pXG4iXX0=