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
//# sourceMappingURL=data:application/json;base64,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QUFaLEVBQStCLElBQUksU0FBSixDQUFjLEtBQUssTUFBbkIsQ0FBL0I7QUFDRDtBQUNGLEtBTkQsTUFNTyxJQUFHLEVBQUUsUUFBRixLQUFlLFFBQWxCLEVBQTRCO0FBQ2pDLFVBQUcsS0FBSCxFQUFVO0FBQ1IsY0FBTSxHQUFOLENBQVUsSUFBSSxTQUFKLENBQWMsS0FBSyxHQUFuQixDQUFWLEVBQW1DLE1BQW5DO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsZ0JBQVEsR0FBUixDQUFZLGlCQUFaLEVBQStCLElBQUksU0FBSixDQUFjLEtBQUssTUFBbkIsQ0FBL0I7QUFDRDtBQUNGLEtBTk0sTUFNQTtBQUNMLGNBQVEsR0FBUixDQUFZLG1CQUFaLEVBQWlDLEVBQUUsUUFBbkM7QUFDRDtBQUNGLEdBN0JLO0FBRG9CLENBQTVCOztBQWlDQSxhQUFhLGVBQWIsSUFBZ0MscUJBQWhDO0FBQ0EsYUFBYSxXQUFiLElBQTRCLElBQUksT0FBaEM7O0FBRU8sSUFBSSwwQkFBUyxJQUFJLElBQUksU0FBUixDQUFrQixpQkFBbUI7QUFBQTs7QUFBQSxNQUFULE1BQVM7O0FBQ3ZELFNBQU8sSUFBSSxXQUFKLENBQWdCLE1BQWhCLENBQVA7QUFDRCxDQUZtQixDQUFiOztBQUlBLElBQUksNEJBQVUsSUFBSSxJQUFJLFNBQVIsQ0FBa0IsaUJBQWtDO0FBQUE7O0FBQUEsTUFBeEIsTUFBd0I7QUFBQSxNQUFoQixHQUFnQjtBQUFBLE1BQVgsUUFBVzs7QUFDdkUsU0FBTyxJQUFJLFlBQUosQ0FBaUIsTUFBakIsRUFBeUIsR0FBekIsRUFBOEIsUUFBOUIsQ0FBUDtBQUNELENBRm9CLENBQWQiLCJmaWxlIjoiYnVpbHRpbl9saWIvaHR0cC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGxpYiA9IHJlcXVpcmUoJy4uL2xpYicpXG5jb25zdCBodHRwID0gcmVxdWlyZSgnaHR0cCcpXG5jb25zdCBodHRwcyA9IHJlcXVpcmUoJ2h0dHBzJylcbmNvbnN0IHVybCA9IHJlcXVpcmUoJ3VybCcpXG5cbmV4cG9ydCBjbGFzcyBMSFRUUFNlcnZlclJlc3BvbnNlIGV4dGVuZHMgbGliLkxPYmplY3Qge1xuICBjb25zdHJ1Y3RvcihyZXMpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpc1snX19jb25zdHJ1Y3Rvcl9fJ10gPSBMSFRUUFNlcnZlclJlc3BvbnNlXG4gICAgdGhpcy5yZXMgPSByZXNcbiAgfVxufVxuXG5sZXQgTEhUVFBTZXJ2ZXJSZXNwb25zZVByb3RvdHlwZSA9IHtcbiAgd3JpdGU6IG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKHNlbGYsIFt3aGF0XSkge1xuICAgIHNlbGYucmVzLndyaXRlKGxpYi50b0pTdHJpbmcod2hhdCkpXG4gIH0pLFxuICBlbmQ6IG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKHNlbGYpIHtcbiAgICBzZWxmLnJlcy5lbmQoKVxuICB9KVxufVxuXG5MSFRUUFNlcnZlclJlc3BvbnNlWydfX3Byb3RvdHlwZV9fJ10gPSBMSFRUUFNlcnZlclJlc3BvbnNlUHJvdG90eXBlXG5MSFRUUFNlcnZlclJlc3BvbnNlWydfX3N1cGVyX18nXSA9IGxpYi5MT2JqZWN0XG5cbmV4cG9ydCBjbGFzcyBMSFRUUFNlcnZlclJlcXVlc3QgZXh0ZW5kcyBsaWIuTE9iamVjdCB7XG4gIGNvbnN0cnVjdG9yKHJlcSkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzWydfX2NvbnN0cnVjdG9yX18nXSA9IExIVFRQU2VydmVyUmVxdWVzdFxuICAgIHRoaXMucmVxID0gcmVxXG4gIH1cbn1cblxubGV0IExIVFRQU2VydmVyUmVxdWVzdFByb3RvdHlwZSA9IHtcbiAgdXJsOiBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihzZWxmKSB7XG4gICAgcmV0dXJuIGxpYi50b0xTdHJpbmcoc2VsZi5yZXEudXJsKVxuICB9KSxcbiAgbWV0aG9kOiBuZXcgbGliLkxGdW5jdGlvbihmdW5jdGlvbihzZWxmKSB7XG4gICAgcmV0dXJuIGxpYi50b0xTdHJpbmcoc2VsZi5yZXEubWV0aG9kKVxuICB9KVxufVxuXG5MSFRUUFNlcnZlclJlcXVlc3RbJ19fcHJvdG90eXBlX18nXSA9IExIVFRQU2VydmVyUmVxdWVzdFByb3RvdHlwZVxuTEhUVFBTZXJ2ZXJSZXF1ZXN0WydfX3N1cGVyX18nXSA9IGxpYi5MT2JqZWN0XG5cbmV4cG9ydCBjbGFzcyBMSFRUUFNlcnZlciBleHRlbmRzIGxpYi5MT2JqZWN0IHtcbiAgY29uc3RydWN0b3IoaGFuZGxlKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXNbJ19fY29uc3RydWN0b3JfXyddID0gTEhUVFBTZXJ2ZXJcblxuICAgIHRoaXMuc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoZnVuY3Rpb24ocmVxLCByZXMpIHtcbiAgICAgIGxpYi5jYWxsKGhhbmRsZSwgW1xuICAgICAgICBuZXcgTEhUVFBTZXJ2ZXJSZXF1ZXN0KHJlcSksIG5ldyBMSFRUUFNlcnZlclJlc3BvbnNlKHJlcyldKVxuICAgIH0pXG4gIH1cbn1cblxubGV0IExIVFRQU2VydmVyUHJvdG90eXBlID0ge1xuICBsaXN0ZW46IG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKHNlbGYsIFtwb3J0XSkge1xuICAgIHBvcnQgPSBsaWIudG9KTnVtYmVyKHBvcnQpXG4gICAgc2VsZi5zZXJ2ZXIubGlzdGVuKHBvcnQpXG4gIH0pXG59XG5cbkxIVFRQU2VydmVyWydfX3Byb3RvdHlwZV9fJ10gPSBMSFRUUFNlcnZlclByb3RvdHlwZVxuTEhUVFBTZXJ2ZXJbJ19fc3VwZXJfXyddID0gbGliLkxPYmplY3RcblxuZXhwb3J0IGNsYXNzIExIVFRQUmVxdWVzdCBleHRlbmRzIGxpYi5MT2JqZWN0IHtcbiAgY29uc3RydWN0b3IobWV0aG9kLCB1cmwsIGNhbGxiYWNrKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXNbJ19fY29uc3RydWN0b3JfXyddID0gTEhUVFBSZXF1ZXN0XG4gICAgdGhpcy5tZXRob2QgPSBtZXRob2RcbiAgICB0aGlzLnVybCA9IHVybFxuICAgIHRoaXMuY2IgPSBjYWxsYmFja1xuICB9XG59XG5cblxubGV0IExIVFRQUmVxdWVzdFByb3RvdHlwZSA9IHtcbiAgc2VuZDogbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oc2VsZikge1xuICAgIGxldCBoYW5kbGUgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgbGV0IGJvZHkgPSAnJ1xuICAgICAgcmVzcG9uc2Uuc2V0RW5jb2RpbmcoJ3V0ZjgnKVxuICAgICAgcmVzcG9uc2Uub24oJ2RhdGEnLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIGJvZHkgKz0gZC50b1N0cmluZygpXG4gICAgICB9KVxuICAgICAgcmVzcG9uc2Uub24oJ2VuZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBsaWIuY2FsbChzZWxmLmNiLCBbbGliLnRvTFN0cmluZyhib2R5KV0pXG4gICAgICB9KVxuICAgIH1cblxuICAgIGxldCB1ID0gdXJsLnBhcnNlKGxpYi50b0pTdHJpbmcoc2VsZi51cmwpKVxuICAgIGxldCBpc0dldCA9IGxpYi50b0pTdHJpbmcoc2VsZi5tZXRob2QpLnRvTG93ZXJDYXNlKCkgPT09ICdnZXQnXG4gICAgaWYodS5wcm90b2NvbCA9PT0gJ2h0dHA6Jykge1xuICAgICAgaWYoaXNHZXQpIHtcbiAgICAgICAgaHR0cC5nZXQobGliLnRvSlN0cmluZyhzZWxmLnVybCksIGhhbmRsZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdJbnZhbGlkIG1ldGhvZDonLCBsaWIudG9KU3RyaW5nKHNlbGYubWV0aG9kKSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYodS5wcm90b2NvbCA9PT0gJ2h0dHBzOicpIHtcbiAgICAgIGlmKGlzR2V0KSB7XG4gICAgICAgIGh0dHBzLmdldChsaWIudG9KU3RyaW5nKHNlbGYudXJsKSwgaGFuZGxlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0ludmFsaWQgbWV0aG9kOicsIGxpYi50b0pTdHJpbmcoc2VsZi5tZXRob2QpKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBwcm90b2NvbDonLCB1LnByb3RvY29sKVxuICAgIH1cbiAgfSlcbn1cblxuTEhUVFBSZXF1ZXN0WydfX3Byb3RvdHlwZV9fJ10gPSBMSFRUUFJlcXVlc3RQcm90b3R5cGVcbkxIVFRQUmVxdWVzdFsnX19zdXBlcl9fJ10gPSBsaWIuTE9iamVjdFxuXG5leHBvcnQgbGV0IHNlcnZlciA9IG5ldyBsaWIuTEZ1bmN0aW9uKGZ1bmN0aW9uKFtoYW5kbGVdKSB7XG4gIHJldHVybiBuZXcgTEhUVFBTZXJ2ZXIoaGFuZGxlKVxufSlcblxuZXhwb3J0IGxldCByZXF1ZXN0ID0gbmV3IGxpYi5MRnVuY3Rpb24oZnVuY3Rpb24oW21ldGhvZCwgdXJsLCBjYWxsYmFja10pIHtcbiAgcmV0dXJuIG5ldyBMSFRUUFJlcXVlc3QobWV0aG9kLCB1cmwsIGNhbGxiYWNrKVxufSlcbiJdfQ==