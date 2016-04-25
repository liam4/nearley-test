'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.toJString = toJString;
exports.toJBoolean = toJBoolean;
exports.toJNumber = toJNumber;
exports.toLString = toLString;
exports.toLBoolean = toLBoolean;
exports.toLNumber = toLNumber;
exports.toLObject = toLObject;
exports.call = call;
exports.defaultCall = defaultCall;
exports.has = has;
exports.get = get;
exports.defaultGet = defaultGet;
exports.set = set;
exports.defaultSet = defaultSet;

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var interp = require('./interp');
var C = require('./constants');

var StringPrim = exports.StringPrim = function () {
  function StringPrim(str) {
    _classCallCheck(this, StringPrim);

    this.str = str;
  }

  _createClass(StringPrim, [{
    key: 'toString',
    value: function toString() {
      return this.str;
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
    _classCallCheck(this, BooleanPrim);

    this.bool = bool;
  }

  _createClass(BooleanPrim, [{
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
    _classCallCheck(this, NumberPrim);

    this.num = num;
  }

  _createClass(NumberPrim, [{
    key: 'valueOf',
    value: function valueOf() {
      return this.num;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return this.num;
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
}

// Call function --------------------------------------------------------------

function call(fn, args) {
  return fn['__call__'](args);
}

function defaultCall(fnToken, args) {
  if (fnToken.fn instanceof Function) {
    // it's a javascript function so just call it
    return fnToken.fn(args.map(function (arg) {
      return interp.evaluateExpression(arg, fnToken.argumentScope);
    }));
  } else {
    var scope = Object.assign({}, fnToken.scopeVariables);
    var returnValue = null;
    scope.return = new Variable(new LFunction(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 1);

      var val = _ref2[0];

      returnValue = val;
    }));
    var paramaters = fnToken.paramaterList;

    var _loop = function _loop(i) {
      var value = args[i];
      var paramater = paramaters[i];
      if (paramater.type === 'normal') {
        var evaluatedValue = interp.evaluateExpression(value);
        scope[paramater.name] = new Variable(evaluatedValue);
      } else if (paramater.type === 'unevaluated') {
        scope[paramater.name] = new Variable(new LFunction(function () {
          return interp.evaluateExpression(value, fnToken.argumentScope);
        }));
      }
    };

    for (var i = 0; i < paramaters.length; i++) {
      _loop(i);
    }
    interp.evaluateEachExpression(scope, fnToken.fn);
    return returnValue;
  }
}

// Has function ---------------------------------------------------------------

function has(obj, key) {
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

      if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
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
    _classCallCheck(this, Variable);

    this.value = value;
  }

  _createClass(Variable, [{
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
  _classCallCheck(this, Token);
};

// Object token class ---------------------------------------------------------

var LObject = exports.LObject = function (_Token) {
  _inherits(LObject, _Token);

  function LObject() {
    _classCallCheck(this, LObject);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LObject).call(this));

    _this.data = {};
    _this['__constructor__'] = LObject;
    return _this;
  }

  _createClass(LObject, [{
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
  _inherits(LArray, _LObject);

  function LArray() {
    _classCallCheck(this, LArray);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(LArray).call(this));

    _this2['__constructor__'] = LArray;
    _this2.data.length = 0;
    return _this2;
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
  _inherits(LFunction, _LObject2);

  function LFunction(fn) {
    _classCallCheck(this, LFunction);

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(LFunction).call(this));

    _this3['__constructor__'] = LFunction;
    _this3.fn = fn;
    _this3.scopeVariables = null;

    _this3.unevaluatedArgs = [];
    _this3.normalArgs = [];
    return _this3;
  }

  _createClass(LFunction, [{
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
      return '<Object Function>';
    }
  }]);

  return LFunction;
}(LObject);

var LEnvironment = exports.LEnvironment = function () {
  function LEnvironment(variables) {
    _classCallCheck(this, LEnvironment);

    this['__constructor__'] = LEnvironment;
    this.vars = variables;
  }

  _createClass(LEnvironment, [{
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
      return JSON.stringify(Object.keys(this.vars));
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
//# sourceMappingURL=data:application/json;base64,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LFVBQVUsV0FBVixJQUF5QixPQUF6QiIsImZpbGUiOiJsaWIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBpbnRlcnAgPSByZXF1aXJlKCcuL2ludGVycCcpXG5jb25zdCBDID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKVxuXG5leHBvcnQgY2xhc3MgU3RyaW5nUHJpbSB7XG4gIGNvbnN0cnVjdG9yKHN0cikge1xuICAgIHRoaXMuc3RyID0gc3RyXG4gIH1cblxuICBzZXQgc3RyKHN0cikge1xuICAgIHRoaXMuX3N0ciA9IFN0cmluZyhzdHIpXG4gIH1cblxuICBnZXQgc3RyKCkge1xuICAgIHJldHVybiBTdHJpbmcodGhpcy5fc3RyKVxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RyXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJvb2xlYW5QcmltIHtcbiAgY29uc3RydWN0b3IoYm9vbCkge1xuICAgIHRoaXMuYm9vbCA9IGJvb2xcbiAgfVxuXG4gIHNldCBib29sKGJvb2wpIHtcbiAgICB0aGlzLl9ib29sID0gQm9vbGVhbihib29sKVxuICB9XG5cbiAgZ2V0IGJvb2woKSB7XG4gICAgcmV0dXJuIEJvb2xlYW4odGhpcy5fYm9vbClcbiAgfVxuXG4gIHZhbHVlT2YoKSB7XG4gICAgcmV0dXJuIHRoaXMuYm9vbFxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIGA8Qm9vbGVhbiAke3RoaXMuYm9vbH0+YFxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOdW1iZXJQcmltIHtcbiAgY29uc3RydWN0b3IobnVtKSB7XG4gICAgdGhpcy5udW0gPSBudW1cbiAgfVxuXG4gIHNldCBudW0obnVtKSB7XG4gICAgdGhpcy5fbnVtID0gTnVtYmVyKG51bSlcbiAgfVxuXG4gIGdldCBudW0oKSB7XG4gICAgcmV0dXJuIE51bWJlcih0aGlzLl9udW0pXG4gIH1cblxuICB2YWx1ZU9mKCkge1xuICAgIHJldHVybiB0aGlzLm51bVxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubnVtXG4gIH1cbn1cblxuLy8gQ29udmVydGluZyBsYW5ndWFnZSBwcmltYXRpdmVzIHRvIEpTIHByaW1zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgZnVuY3Rpb24gdG9KU3RyaW5nKHN0cikge1xuICBpZiAoc3RyIGluc3RhbmNlb2YgU3RyaW5nUHJpbSkge1xuICAgIHJldHVybiBzdHIuc3RyXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFN0cmluZyhzdHIpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvSkJvb2xlYW4oYm9vbCkge1xuICBpZiAoYm9vbCBpbnN0YW5jZW9mIEJvb2xlYW5QcmltICYmIGJvb2wuYm9vbCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiB0cnVlXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvSk51bWJlcihudW0pIHtcbiAgaWYgKG51bSBpbnN0YW5jZW9mIE51bWJlclByaW0pIHtcbiAgICByZXR1cm4gbnVtLm51bVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBOdW1iZXIobnVtKVxuICB9XG59XG5cbi8vIENvbnZlcnRpbmcgSlMgcHJpbXMgdG8gbGFuZ3VhZ2UgcHJpbWl0aXZlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvTFN0cmluZyhzdHIpIHtcbiAgcmV0dXJuIG5ldyBTdHJpbmdQcmltKHN0cilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvTEJvb2xlYW4oYm9vbCkge1xuICByZXR1cm4gbmV3IEJvb2xlYW5QcmltKGJvb2wpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0xOdW1iZXIobnVtKSB7XG4gIHJldHVybiBuZXcgTnVtYmVyUHJpbShudW0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0xPYmplY3QoZGF0YSkge1xuICBsZXQgb2JqID0gbmV3IExPYmplY3QoKVxuICBmb3IgKGxldCBrZXkgaW4gZGF0YSkge1xuICAgIHNldChvYmosIGtleSwgZGF0YVtrZXldKVxuICB9XG4gIHJldHVybiBvYmpcbn1cblxuLy8gQ2FsbCBmdW5jdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsbChmbiwgYXJncykge1xuICByZXR1cm4gZm5bJ19fY2FsbF9fJ10oYXJncylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRDYWxsKGZuVG9rZW4sIGFyZ3MpIHtcbiAgaWYgKGZuVG9rZW4uZm4gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgIC8vIGl0J3MgYSBqYXZhc2NyaXB0IGZ1bmN0aW9uIHNvIGp1c3QgY2FsbCBpdFxuICAgIHJldHVybiBmblRva2VuLmZuKGFyZ3MubWFwKFxuICAgICAgYXJnID0+IGludGVycC5ldmFsdWF0ZUV4cHJlc3Npb24oYXJnLCBmblRva2VuLmFyZ3VtZW50U2NvcGUpKSlcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBzY29wZSA9IE9iamVjdC5hc3NpZ24oe30sIGZuVG9rZW4uc2NvcGVWYXJpYWJsZXMpXG4gICAgbGV0IHJldHVyblZhbHVlID0gbnVsbFxuICAgIHNjb3BlLnJldHVybiA9IG5ldyBWYXJpYWJsZShuZXcgTEZ1bmN0aW9uKGZ1bmN0aW9uKFt2YWxdKSB7XG4gICAgICByZXR1cm5WYWx1ZSA9IHZhbFxuICAgIH0pKVxuICAgIGNvbnN0IHBhcmFtYXRlcnMgPSBmblRva2VuLnBhcmFtYXRlckxpc3RcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcmFtYXRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gYXJnc1tpXVxuICAgICAgY29uc3QgcGFyYW1hdGVyID0gcGFyYW1hdGVyc1tpXVxuICAgICAgaWYgKHBhcmFtYXRlci50eXBlID09PSAnbm9ybWFsJykge1xuICAgICAgICBjb25zdCBldmFsdWF0ZWRWYWx1ZSA9IGludGVycC5ldmFsdWF0ZUV4cHJlc3Npb24odmFsdWUpXG4gICAgICAgIHNjb3BlW3BhcmFtYXRlci5uYW1lXSA9IG5ldyBWYXJpYWJsZShldmFsdWF0ZWRWYWx1ZSlcbiAgICAgIH0gZWxzZSBpZiAocGFyYW1hdGVyLnR5cGUgPT09ICd1bmV2YWx1YXRlZCcpIHtcbiAgICAgICAgc2NvcGVbcGFyYW1hdGVyLm5hbWVdID0gbmV3IFZhcmlhYmxlKG5ldyBMRnVuY3Rpb24oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGludGVycC5ldmFsdWF0ZUV4cHJlc3Npb24odmFsdWUsIGZuVG9rZW4uYXJndW1lbnRTY29wZSlcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfVxuICAgIGludGVycC5ldmFsdWF0ZUVhY2hFeHByZXNzaW9uKHNjb3BlLCBmblRva2VuLmZuKVxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG59XG5cbi8vIEhhcyBmdW5jdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhcyhvYmosIGtleSkge1xuICByZXR1cm4ga2V5IGluIG9ialxufVxuXG4vLyBHZXQgZnVuY3Rpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQob2JqLCBrZXkpIHtcbiAgcmV0dXJuIG9ialsnX19nZXRfXyddKGtleSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRHZXQob2JqLCBrZXkpIHtcbiAgbGV0IGtleVN0cmluZyA9IHRvSlN0cmluZyhrZXkpXG4gIGlmIChrZXlTdHJpbmcgaW4gb2JqLmRhdGEpIHtcbiAgICByZXR1cm4gb2JqLmRhdGFba2V5U3RyaW5nXVxuICB9IGVsc2Uge1xuICAgIGxldCBjb25zdHJ1Y3RvciA9IG9ialsnX19jb25zdHJ1Y3Rvcl9fJ11cbiAgICBsZXQgcHJvdG90eXBlID0gY29uc3RydWN0b3JbJ19fcHJvdG90eXBlX18nXVxuICAgIGxldCBjdXJyZW50ID0gY29uc3RydWN0b3JcbiAgICB3aGlsZSAoY3VycmVudCAmJiBwcm90b3R5cGUgJiYgIShrZXkgaW4gcHJvdG90eXBlKSkge1xuICAgICAgY3VycmVudCA9IGN1cnJlbnRbJ19fc3VwZXJfXyddXG4gICAgICBwcm90b3R5cGUgPSBjdXJyZW50ID8gY3VycmVudFsnX19wcm90b3R5cGVfXyddIDogbnVsbFxuICAgIH1cbiAgICBpZiAoY3VycmVudCkge1xuICAgICAgbGV0IHZhbHVlID0gcHJvdG90eXBlW2tleVN0cmluZ11cbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIExGdW5jdGlvbikge1xuICAgICAgICAvLyBJIHdhcyBnb2luZyB0byBqdXN0IGJpbmQgdG8gb2JqLCBidXQgdGhhdCBnZW5lcmFsbHkgaW52b2x2ZXMgdXNpbmdcbiAgICAgICAgLy8gdGhlIG9oIHNvIHRlcnJpYmxlIGB0aGlzYC5cbiAgICAgICAgLy8gSW5zdGVhZCBpdCByZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBjYWxscyB0aGUgZ2l2ZW4gZnVuY3Rpb24gd2l0aFxuICAgICAgICAvLyBvYmogYXMgdGhlIGZpcnN0IHBhcmFtYXRlci5cbiAgICAgICAgcmV0dXJuIG5ldyBMRnVuY3Rpb24oZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgIHJldHVybiB2YWx1ZS5mbihvYmosIC4uLmFyZ3MpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9XG4gIH1cbn1cblxuLy8gU2V0IGZ1bmN0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0KG9iaiwga2V5LCB2YWx1ZSkge1xuICByZXR1cm4gb2JqWydfX3NldF9fJ10oa2V5LCB2YWx1ZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRTZXQob2JqLCBrZXksIHZhbHVlKSB7XG4gIHJldHVybiBvYmouZGF0YVt0b0pTdHJpbmcoa2V5KV0gPSB2YWx1ZVxufVxuXG4vLyBWYXJpYWJsZSBjbGFzcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyAqIHRoaXMgc2hvdWxkIG5ldmVyICpldmVyKiBiZSBhY2Nlc3NlZCB0aHJvdWdoIGFueXdoZXJlIGV4Y2VwdCBzZXQvZ2V0XG4vLyAgIFZhcmlhYmxlIGZ1bmN0aW9uc1xuLy8gKiB0YWtlcyBvbmUgcGFyYW1hdGVyLCB2YWx1ZSwgd2hpY2ggaXMgc3RvcmVkIGluIGluc3QudmFsdWUgYW5kIHJlcHJlc2VudHNcbi8vICAgdGhlIHZhbHVlIG9mIHRoZSBWYXJpYWJsZVxuZXhwb3J0IGNsYXNzIFZhcmlhYmxlIHtcbiAgY29uc3RydWN0b3IodmFsdWUpIHtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWVcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiAnPFZhcmlhYmxlPidcbiAgfVxufVxuXG4vLyBCYXNlIHRva2VuIGNsYXNzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyAqIGRvZXNuJ3QgZG8gYW55dGhpbmcgb24gaXRzIG93blxuLy8gKiB1c2UgeCBpbnN0YW5jZW9mIFRva2VuIHRvIGNoZWNrIGlmIHggaXMgYW55IGtpbmQgb2YgdG9rZW5cblxuZXhwb3J0IGNsYXNzIFRva2VuIHtcbiAgY29uc3RydWN0b3IoKSB7fVxufVxuXG4vLyBPYmplY3QgdG9rZW4gY2xhc3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBjbGFzcyBMT2JqZWN0IGV4dGVuZHMgVG9rZW4ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5kYXRhID0ge31cbiAgICB0aGlzWydfX2NvbnN0cnVjdG9yX18nXSA9IExPYmplY3RcbiAgfVxuXG4gIF9fZ2V0X18oa2V5KSB7XG4gICAgcmV0dXJuIGRlZmF1bHRHZXQodGhpcywga2V5KVxuICB9XG5cbiAgX19zZXRfXyhrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRTZXQodGhpcywga2V5LCB2YWx1ZSlcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTEFycmF5IGV4dGVuZHMgTE9iamVjdCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzWydfX2NvbnN0cnVjdG9yX18nXSA9IExBcnJheVxuICAgIHRoaXMuZGF0YS5sZW5ndGggPSAwXG4gIH1cbn1cblxuLy8gRnVuY3Rpb24gdG9rZW4gY2xhc3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gW1t0aGlzIG5lZWRzIHRvIGJlIHJld3JpdHRlbl1dXG4vLyAqIHRha2VzIG9uZSBwYXJhbWF0ZXIsIGZuLCB3aGljaCBpcyBzdG9yZWQgaW4gaW5zdC5mbiBhbmQgcmVwcmVzZW50cyB0aGVcbi8vICAgICBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgY2FsbGVkXG4vLyAqIHlvdSBjYW4gYWxzbyBzZXQgc2NvcGVWYXJpYWJsZXMgKHVzaW5nIHNldFNjb3BlVmFyaWFibGVzKSwgd2hpY2ggaXNcbi8vICAgICBnZW5lcmFsbHkgb25seSB1c2VkIGZvciBpbnRlcm5hbCBjcmVhdGlvbiBvZiBmdW5jdGlvbiBleHByZXNzaW9uczsgaXRcbi8vICAgICByZXByZXNlbnRzIHRoZSBjbG9zdXJlIFZhcmlhYmxlcyB0aGF0IGNhbiBiZSBhY2Nlc3NlZCBmcm9tIHdpdGhpbiB0aGVcbi8vICAgICBmdW5jdGlvblxuLy8gKiB5b3UgY2FuIGFsc28gc2V0IGZuQXJndW1lbnRzICh1c2luZyBzZXRBcmd1bWVudHMpLCB3aGljaCBpcyBnZW5lcmFsbHkgYWxzb1xuLy8gICAgIG9ubHkgdXNlZCBmb3IgaW50ZXJuYWwgY3JlYXRpb24gb2YgZnVuY3Rpb24gZXhwcmVzc2lvbnM7IGl0IHRlbGxzIHdoYXRcbi8vICAgICBjYWxsIGFyZ3VtZW50cyBzaG91bGQgYmUgbWFwcGVkIHRvIGluIHRoZSBWYXJpYWJsZXMgY29udGV4dCBvZiBydW5uaW5nXG4vLyAgICAgdGhlIGNvZGUgYmxvY2tcbi8vICogdXNlIGluc3QuX19jYWxsX18gdG8gY2FsbCB0aGUgZnVuY3Rpb24gKHdpdGggb3B0aW9uYWwgYXJndW1lbnRzKVxuXG5leHBvcnQgY2xhc3MgTEZ1bmN0aW9uIGV4dGVuZHMgTE9iamVjdCB7XG4gIGNvbnN0cnVjdG9yKGZuKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXNbJ19fY29uc3RydWN0b3JfXyddID0gTEZ1bmN0aW9uXG4gICAgdGhpcy5mbiA9IGZuXG4gICAgdGhpcy5zY29wZVZhcmlhYmxlcyA9IG51bGxcblxuICAgIHRoaXMudW5ldmFsdWF0ZWRBcmdzID0gW11cbiAgICB0aGlzLm5vcm1hbEFyZ3MgPSBbXVxuICB9XG5cbiAgX19jYWxsX18oYXJncykge1xuICAgIC8vIENhbGwgdGhpcyBmdW5jdGlvbi4gQnkgZGVmYXVsdCB1c2VzIGRlZmF1bHRDYWxsLCBidXQgY2FuIGJlIG92ZXJyaWRlblxuICAgIC8vIGJ5IHN1YmNsYXNzZXMuXG4gICAgcmV0dXJuIGRlZmF1bHRDYWxsKHRoaXMsIGFyZ3MpXG4gIH1cblxuICBzZXRTY29wZVZhcmlhYmxlcyhzY29wZVZhcmlhYmxlcykge1xuICAgIHRoaXMuc2NvcGVWYXJpYWJsZXMgPSBzY29wZVZhcmlhYmxlc1xuICB9XG5cbiAgc2V0UGFyYW1hdGVycyhwYXJhbWF0ZXJMaXN0KSB7XG4gICAgdGhpcy5wYXJhbWF0ZXJMaXN0ID0gcGFyYW1hdGVyTGlzdFxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICc8T2JqZWN0IEZ1bmN0aW9uPidcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTEVudmlyb25tZW50IHtcbiAgY29uc3RydWN0b3IodmFyaWFibGVzKSB7XG4gICAgdGhpc1snX19jb25zdHJ1Y3Rvcl9fJ10gPSBMRW52aXJvbm1lbnRcbiAgICB0aGlzLnZhcnMgPSB2YXJpYWJsZXNcbiAgfVxuXG4gIF9fc2V0X18odmFyaWFibGVOYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMudmFyc1t2YXJpYWJsZU5hbWVdID0gbmV3IFZhcmlhYmxlKHZhbHVlKVxuICB9XG5cbiAgX19nZXRfXyh2YXJpYWJsZU5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy52YXJzW3ZhcmlhYmxlTmFtZV0udmFsdWVcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShPYmplY3Qua2V5cyh0aGlzLnZhcnMpKVxuICB9XG59XG5cbi8vIEVUQy4gdGhhdCByZXF1aXJlcyBhYm92ZSBkZWZpbml0aW9ucyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGxldCBMT2JqZWN0UHJvdG90eXBlID0ge31cblxuZXhwb3J0IGxldCBMQXJyYXlQcm90b3R5cGUgPSB7XG4gIHB1c2g6IG5ldyBMRnVuY3Rpb24oZnVuY3Rpb24oc2VsZiwgd2hhdCkge1xuICAgIHNlbGYuZGF0YVtzZWxmLmRhdGEubGVuZ3RoXSA9IHdoYXRcbiAgICBzZWxmLmRhdGEubGVuZ3RoID0gc2VsZi5kYXRhLmxlbmd0aCArIDFcbiAgfSksXG4gIHBvcDogbmV3IExGdW5jdGlvbihmdW5jdGlvbihzZWxmKSB7XG4gICAgZGVsZXRlIHNlbGYuZGF0YVtzZWxmLmRhdGEubGVuZ3RoIC0gMV1cbiAgICBzZWxmLmRhdGEubGVuZ3RoID0gc2VsZi5kYXRhLmxlbmd0aCAtIDFcbiAgfSlcbn1cblxuZXhwb3J0IGxldCBMRnVuY3Rpb25Qcm90b3R5cGUgPSB7XG4gIGRlYnVnOiBuZXcgTEZ1bmN0aW9uKGZ1bmN0aW9uKHNlbGYpIHtcbiAgICBjb25zb2xlLmxvZygnKiogREVCVUcgKionKVxuICAgIGNvbnNvbGUubG9nKHNlbGYuZm4udG9TdHJpbmcoKSlcbiAgfSlcbn1cblxuTE9iamVjdFsnX19wcm90b3R5cGVfXyddID0gTE9iamVjdFByb3RvdHlwZVxuTE9iamVjdFsnX19zdXBlcl9fJ10gPSBudWxsXG5cbkxBcnJheVsnX19wcm90b3R5cGVfXyddID0gTEFycmF5UHJvdG90eXBlXG5MQXJyYXlbJ19fc3VwZXJfXyddID0gTE9iamVjdFxuXG5MRnVuY3Rpb25bJ19fcHJvdG90eXBlX18nXSA9IExGdW5jdGlvblByb3RvdHlwZVxuTEZ1bmN0aW9uWydfX3N1cGVyX18nXSA9IExPYmplY3RcbiJdfQ==