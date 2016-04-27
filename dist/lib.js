'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LFunctionPrototype = exports.LArrayPrototype = exports.LObjectPrototype = exports.LEnvironment = exports.LFunction = exports.LArray = exports.LObject = exports.Token = exports.Variable = exports.defaultCall = exports.call = exports.NumberPrim = exports.BooleanPrim = exports.StringPrim = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

// Call function --------------------------------------------------------------

var call = exports.call = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(fn, args) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fn['__call__'](args);

          case 2:
            return _context.abrupt('return', _context.sent);

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return function call(_x, _x2) {
    return ref.apply(this, arguments);
  };
}();

var defaultCall = exports.defaultCall = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(fnToken, args) {
    var _this = this;

    var scope, returnValue, paramaters, _loop, i;

    return _regenerator2.default.wrap(function _callee3$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!(fnToken.fn instanceof Function)) {
              _context4.next = 8;
              break;
            }

            _context4.t0 = fnToken;
            _context4.next = 4;
            return _promise2.default.all(args.map(function (arg) {
              return interp.evaluateExpression(arg, fnToken.argumentScope);
            }));

          case 4:
            _context4.t1 = _context4.sent;
            return _context4.abrupt('return', _context4.t0.fn.call(_context4.t0, _context4.t1));

          case 8:
            scope = (0, _assign2.default)({}, fnToken.scopeVariables);
            returnValue = null;

            scope.return = new Variable(new LFunction(function (_ref) {
              var _ref2 = (0, _slicedToArray3.default)(_ref, 1);

              var val = _ref2[0];

              returnValue = val;
            }));
            paramaters = fnToken.paramaterList;
            _loop = _regenerator2.default.mark(function _loop(i) {
              var value, paramater, evaluatedValue;
              return _regenerator2.default.wrap(function _loop$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      value = args[i];
                      paramater = paramaters[i];

                      if (!(paramater.type === 'normal')) {
                        _context3.next = 9;
                        break;
                      }

                      _context3.next = 5;
                      return interp.evaluateExpression(value);

                    case 5:
                      evaluatedValue = _context3.sent;

                      scope[paramater.name] = new Variable(evaluatedValue);
                      _context3.next = 10;
                      break;

                    case 9:
                      if (paramater.type === 'unevaluated') {
                        scope[paramater.name] = new Variable(new LFunction((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                          return _regenerator2.default.wrap(function _callee2$(_context2) {
                            while (1) {
                              switch (_context2.prev = _context2.next) {
                                case 0:
                                  _context2.next = 2;
                                  return interp.evaluateExpression(value, fnToken.argumentScope);

                                case 2:
                                  return _context2.abrupt('return', _context2.sent);

                                case 3:
                                case 'end':
                                  return _context2.stop();
                              }
                            }
                          }, _callee2, this);
                        }))));
                      }

                    case 10:
                    case 'end':
                      return _context3.stop();
                  }
                }
              }, _loop, _this);
            });
            i = 0;

          case 14:
            if (!(i < paramaters.length)) {
              _context4.next = 19;
              break;
            }

            return _context4.delegateYield(_loop(i), 't2', 16);

          case 16:
            i++;
            _context4.next = 14;
            break;

          case 19:
            if (!fnToken.isShorthand) {
              _context4.next = 25;
              break;
            }

            _context4.next = 22;
            return interp.evaluateExpression(fnToken.fn, scope);

          case 22:
            return _context4.abrupt('return', _context4.sent);

          case 25:
            _context4.next = 27;
            return interp.evaluateEachExpression(scope, fnToken.fn);

          case 27:
            return _context4.abrupt('return', returnValue);

          case 28:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee3, this);
  }));
  return function defaultCall(_x3, _x4) {
    return ref.apply(this, arguments);
  };
}();

// Has function ---------------------------------------------------------------

exports.toJString = toJString;
exports.toJBoolean = toJBoolean;
exports.toJNumber = toJNumber;
exports.toLString = toLString;
exports.toLBoolean = toLBoolean;
exports.toLNumber = toLNumber;
exports.toLObject = toLObject;
exports.has = has;
exports.get = get;
exports.defaultGet = defaultGet;
exports.set = set;
exports.defaultSet = defaultSet;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var interp = require('./interp');
var C = require('./constants');

var StringPrim = exports.StringPrim = function () {
  function StringPrim(str) {
    (0, _classCallCheck3.default)(this, StringPrim);

    this.str = str;
  }

  (0, _createClass3.default)(StringPrim, [{
    key: 'toString',
    value: function toString() {
      return '<String ' + this.str + '>';
    }
  }, {
    key: 'str',
    set: function set(str) {
      this._str = String(str);
    },
    get: function get() {
      return String(this._str);
    }
  }]);
  return StringPrim;
}();

var BooleanPrim = exports.BooleanPrim = function () {
  function BooleanPrim(bool) {
    (0, _classCallCheck3.default)(this, BooleanPrim);

    this.bool = bool;
  }

  (0, _createClass3.default)(BooleanPrim, [{
    key: 'valueOf',
    value: function valueOf() {
      return this.bool;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '<Boolean ' + this.bool + '>';
    }
  }, {
    key: 'bool',
    set: function set(bool) {
      this._bool = Boolean(bool);
    },
    get: function get() {
      return Boolean(this._bool);
    }
  }]);
  return BooleanPrim;
}();

var NumberPrim = exports.NumberPrim = function () {
  function NumberPrim(num) {
    (0, _classCallCheck3.default)(this, NumberPrim);

    this.num = num;
  }

  (0, _createClass3.default)(NumberPrim, [{
    key: 'valueOf',
    value: function valueOf() {
      return this.num;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '<Number ' + this.num + '>';
    }
  }, {
    key: 'num',
    set: function set(num) {
      this._num = Number(num);
    },
    get: function get() {
      return Number(this._num);
    }
  }]);
  return NumberPrim;
}();

// Converting language primatives to JS prims ---------------------------------

function toJString(str) {
  if (str instanceof StringPrim) {
    return str.str;
  } else {
    return String(str);
  }
}

function toJBoolean(bool) {
  if (bool instanceof BooleanPrim && bool.bool === true) {
    return true;
  } else {
    return false;
  }
}

function toJNumber(num) {
  if (num instanceof NumberPrim) {
    return num.num;
  } else {
    return Number(num);
  }
}

// Converting JS prims to language primitives ---------------------------------

function toLString(str) {
  return new StringPrim(str);
}

function toLBoolean(bool) {
  return new BooleanPrim(bool);
}

function toLNumber(num) {
  return new NumberPrim(num);
}

function toLObject(data) {
  var obj = new LObject();
  for (var key in data) {
    set(obj, key, data[key]);
  }
  return obj;
}function has(obj, key) {
  return key in obj;
}

// Get function ---------------------------------------------------------------

function get(obj, key) {
  return obj['__get__'](key);
}

function defaultGet(obj, key) {
  var keyString = toJString(key);
  if (keyString in obj.data) {
    return obj.data[keyString];
  } else {
    var _constructor = obj['__constructor__'];
    var prototype = _constructor['__prototype__'];
    var current = _constructor;
    while (current && prototype && !(key in prototype)) {
      current = current['__super__'];
      prototype = current ? current['__prototype__'] : null;
    }
    if (current) {
      var _ret2 = function () {
        var value = prototype[keyString];
        if (value instanceof LFunction) {
          // I was going to just bind to obj, but that generally involves using
          // the oh so terrible `this`.
          // Instead it returns a function that calls the given function with
          // obj as the first paramater.
          return {
            v: new LFunction(function () {
              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              return value.fn.apply(value, [obj].concat(args));
            })
          };
        }
        return {
          v: value
        };
      }();

      if ((typeof _ret2 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret2)) === "object") return _ret2.v;
    }
  }
}

// Set function ---------------------------------------------------------------

function set(obj, key, value) {
  return obj['__set__'](key, value);
}

function defaultSet(obj, key, value) {
  return obj.data[toJString(key)] = value;
}

// Variable class -------------------------------------------------------------
// * this should never *ever* be accessed through anywhere except set/get
//   Variable functions
// * takes one paramater, value, which is stored in inst.value and represents
//   the value of the Variable

var Variable = exports.Variable = function () {
  function Variable(value) {
    (0, _classCallCheck3.default)(this, Variable);

    this.value = value;
  }

  (0, _createClass3.default)(Variable, [{
    key: 'toString',
    value: function toString() {
      return '<Variable>';
    }
  }]);
  return Variable;
}();

// Base token class -----------------------------------------------------------
// * doesn't do anything on its own
// * use x instanceof Token to check if x is any kind of token

var Token = exports.Token = function Token() {
  (0, _classCallCheck3.default)(this, Token);
};

// Object token class ---------------------------------------------------------

var LObject = exports.LObject = function (_Token) {
  (0, _inherits3.default)(LObject, _Token);

  function LObject() {
    (0, _classCallCheck3.default)(this, LObject);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LObject).call(this));

    _this2.data = {};
    _this2['__constructor__'] = LObject;
    return _this2;
  }

  (0, _createClass3.default)(LObject, [{
    key: '__get__',
    value: function __get__(key) {
      return defaultGet(this, key);
    }
  }, {
    key: '__set__',
    value: function __set__(key, value) {
      return defaultSet(this, key, value);
    }
  }]);
  return LObject;
}(Token);

var LArray = exports.LArray = function (_LObject) {
  (0, _inherits3.default)(LArray, _LObject);

  function LArray() {
    (0, _classCallCheck3.default)(this, LArray);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LArray).call(this));

    _this3['__constructor__'] = LArray;
    _this3.data.length = 0;
    return _this3;
  }

  return LArray;
}(LObject);

// Function token class -------------------------------------------------------
// [[this needs to be rewritten]]
// * takes one paramater, fn, which is stored in inst.fn and represents the
//     function that will be called
// * you can also set scopeVariables (using setScopeVariables), which is
//     generally only used for internal creation of function expressions; it
//     represents the closure Variables that can be accessed from within the
//     function
// * you can also set fnArguments (using setArguments), which is generally also
//     only used for internal creation of function expressions; it tells what
//     call arguments should be mapped to in the Variables context of running
//     the code block
// * use inst.__call__ to call the function (with optional arguments)

var LFunction = exports.LFunction = function (_LObject2) {
  (0, _inherits3.default)(LFunction, _LObject2);

  function LFunction(fn) {
    (0, _classCallCheck3.default)(this, LFunction);

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LFunction).call(this));

    _this4['__constructor__'] = LFunction;
    _this4.fn = fn;
    _this4.scopeVariables = null;

    _this4.unevaluatedArgs = [];
    _this4.normalArgs = [];
    return _this4;
  }

  (0, _createClass3.default)(LFunction, [{
    key: '__call__',
    value: function __call__(args) {
      // Call this function. By default uses defaultCall, but can be overriden
      // by subclasses.
      return defaultCall(this, args);
    }
  }, {
    key: 'setScopeVariables',
    value: function setScopeVariables(scopeVariables) {
      this.scopeVariables = scopeVariables;
    }
  }, {
    key: 'setParamaters',
    value: function setParamaters(paramaterList) {
      this.paramaterList = paramaterList;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '<Function>';
    }
  }]);
  return LFunction;
}(LObject);

var LEnvironment = exports.LEnvironment = function () {
  function LEnvironment(variables) {
    (0, _classCallCheck3.default)(this, LEnvironment);

    this['__constructor__'] = LEnvironment;
    this.vars = variables;
  }

  (0, _createClass3.default)(LEnvironment, [{
    key: '__set__',
    value: function __set__(variableName, value) {
      this.vars[variableName] = new Variable(value);
    }
  }, {
    key: '__get__',
    value: function __get__(variableName) {
      return this.vars[variableName].value;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return (0, _stringify2.default)((0, _keys2.default)(this.vars));
    }
  }]);
  return LEnvironment;
}();

// ETC. that requires above definitions ---------------------------------------

var LObjectPrototype = exports.LObjectPrototype = {};

var LArrayPrototype = exports.LArrayPrototype = {
  push: new LFunction(function (self, what) {
    self.data[self.data.length] = what;
    self.data.length = self.data.length + 1;
  }),
  pop: new LFunction(function (self) {
    delete self.data[self.data.length - 1];
    self.data.length = self.data.length - 1;
  })
};

var LFunctionPrototype = exports.LFunctionPrototype = {
  debug: new LFunction(function (self) {
    console.log('** DEBUG **');
    console.log(self.fn.toString());
  })
};

LObject['__prototype__'] = LObjectPrototype;
LObject['__super__'] = null;

LArray['__prototype__'] = LArrayPrototype;
LArray['__super__'] = LObject;

LFunction['__prototype__'] = LFunctionPrototype;
LFunction['__super__'] = LObject;