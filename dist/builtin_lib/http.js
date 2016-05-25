'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = exports.server = exports.LHTTPRequest = exports.LHTTPServer = exports.LHTTPServerRequest = exports.LHTTPServerResponse = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lib = require('../lib');
var http = require('http');
var https = require('https');
var url = require('url');

var LHTTPServerResponse = exports.LHTTPServerResponse = function (_lib$LObject) {
  (0, _inherits3.default)(LHTTPServerResponse, _lib$LObject);

  function LHTTPServerResponse(res) {
    (0, _classCallCheck3.default)(this, LHTTPServerResponse);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LHTTPServerResponse).call(this));

    _this['__constructor__'] = LHTTPServerResponse;
    _this.res = res;
    return _this;
  }

  return LHTTPServerResponse;
}(lib.LObject);

var LHTTPServerResponsePrototype = {
  write: new lib.LFunction(function (self, _ref) {
    var _ref2 = (0, _slicedToArray3.default)(_ref, 1);

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
  (0, _inherits3.default)(LHTTPServerRequest, _lib$LObject2);

  function LHTTPServerRequest(req) {
    (0, _classCallCheck3.default)(this, LHTTPServerRequest);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LHTTPServerRequest).call(this));

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
  (0, _inherits3.default)(LHTTPServer, _lib$LObject3);

  function LHTTPServer(handle) {
    (0, _classCallCheck3.default)(this, LHTTPServer);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LHTTPServer).call(this));

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
    var _ref4 = (0, _slicedToArray3.default)(_ref3, 1);

    var port = _ref4[0];

    port = lib.toJNumber(port);
    self.server.listen(port);
  })
};

LHTTPServer['__prototype__'] = LHTTPServerPrototype;
LHTTPServer['__super__'] = lib.LObject;

var LHTTPRequest = exports.LHTTPRequest = function (_lib$LObject4) {
  (0, _inherits3.default)(LHTTPRequest, _lib$LObject4);

  function LHTTPRequest(method, url, callback) {
    (0, _classCallCheck3.default)(this, LHTTPRequest);

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LHTTPRequest).call(this));

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
  var _ref6 = (0, _slicedToArray3.default)(_ref5, 1);

  var handle = _ref6[0];

  return new LHTTPServer(handle);
});

var request = exports.request = new lib.LFunction(function (_ref7) {
  var _ref8 = (0, _slicedToArray3.default)(_ref7, 3);

  var method = _ref8[0];
  var url = _ref8[1];
  var callback = _ref8[2];

  return new LHTTPRequest(method, url, callback);
});
//# sourceMappingURL=http.js.map
