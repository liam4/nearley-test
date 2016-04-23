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
    var scope = Object.assign({}, fnToken.scopeletiables);
    var returnValue = null;
    scope.return = new letiable(new LFunction(function (_ref) {
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
        scope[paramater.name] = new letiable(evaluatedValue);
      } else if (paramater.type === 'unevaluated') {
        scope[paramater.name] = new letiable(new LFunction(function () {
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

// letiable class -------------------------------------------------------------
// * this should never *ever* be accessed through anywhere except set/get
//   letiable functions
// * takes one paramater, value, which is stored in inst.value and represents
//   the value of the letiable

var letiable = exports.letiable = function letiable(value) {
  _classCallCheck(this, letiable);

  this.value = value;
};

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
// * you can also set scopeletiables (using setScopeletiables), which is
//     generally only used for internal creation of function expressions; it
//     represents the closure letiables that can be accessed from within the
//     function
// * you can also set fnArguments (using setArguments), which is generally also
//     only used for internal creation of function expressions; it tells what
//     call arguments should be mapped to in the letiables context of running
//     the code block
// * use inst.__call__ to call the function (with optional arguments)

var LFunction = exports.LFunction = function (_LObject2) {
  _inherits(LFunction, _LObject2);

  function LFunction(fn) {
    _classCallCheck(this, LFunction);

    var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(LFunction).call(this));

    _this3['__constructor__'] = LFunction;
    _this3.fn = fn;
    _this3.scopeletiables = null;

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
    key: 'setScopeletiables',
    value: function setScopeletiables(scopeletiables) {
      this.scopeletiables = scopeletiables;
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
//# sourceMappingURL=data:application/json;base64,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Q0FEcUI7QUFLM0IsT0FBSyxJQUFJLFNBQUosQ0FBYyxVQUFTLElBQVQsRUFBZTtBQUNoQyxXQUFPLEtBQUssSUFBTCxDQUFVLEtBQUssSUFBTCxDQUFVLE1BQVYsR0FBbUIsQ0FBN0IsQ0FBUDtBQUNBLFNBQUssSUFBTCxDQUFVLE1BQVYsR0FBbUIsS0FBSyxJQUFMLENBQVUsTUFBVixHQUFtQixDQUF0QztBQUNELEdBSEk7QUFMc0IsQ0FBdEI7O0FBV0EsSUFBSSxrREFBcUI7QUFDOUIsU0FBTyxJQUFJLFNBQUosQ0FBYyxVQUFTLElBQVQsRUFBZTtBQUNsQyxZQUFRLEdBQVIsQ0FBWSxhQUFaO0FBQ0EsWUFBUSxHQUFSLENBQVksS0FBSyxFQUFMLENBQVEsUUFBUixFQUFaO0FBQ0QsR0FITTtBQUR1QixDQUF6Qjs7QUFPUCxRQUFRLGVBQVIsSUFBMkIsZ0JBQTNCO0FBQ0EsUUFBUSxXQUFSLElBQXVCLElBQXZCOztBQUVBLE9BQU8sZUFBUCxJQUEwQixlQUExQjtBQUNBLE9BQU8sV0FBUCxJQUFzQixPQUF0Qjs7QUFFQSxVQUFVLGVBQVYsSUFBNkIsa0JBQTdCO0FBQ0EsVUFBVSxXQUFWLElBQXlCLE9BQXpCIiwiZmlsZSI6ImxpYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGludGVycCA9IHJlcXVpcmUoJy4vaW50ZXJwJylcbmNvbnN0IEMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpXG5cbmV4cG9ydCBjbGFzcyBTdHJpbmdQcmltIHtcbiAgY29uc3RydWN0b3Ioc3RyKSB7XG4gICAgdGhpcy5zdHIgPSBzdHJcbiAgfVxuXG4gIHNldCBzdHIoc3RyKSB7XG4gICAgdGhpcy5fc3RyID0gU3RyaW5nKHN0cilcbiAgfVxuXG4gIGdldCBzdHIoKSB7XG4gICAgcmV0dXJuIFN0cmluZyh0aGlzLl9zdHIpXG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5zdHJcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQm9vbGVhblByaW0ge1xuICBjb25zdHJ1Y3Rvcihib29sKSB7XG4gICAgdGhpcy5ib29sID0gYm9vbFxuICB9XG5cbiAgc2V0IGJvb2woYm9vbCkge1xuICAgIHRoaXMuX2Jvb2wgPSBCb29sZWFuKGJvb2wpXG4gIH1cblxuICBnZXQgYm9vbCgpIHtcbiAgICByZXR1cm4gQm9vbGVhbih0aGlzLl9ib29sKVxuICB9XG5cbiAgdmFsdWVPZigpIHtcbiAgICByZXR1cm4gdGhpcy5ib29sXG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gYDxCb29sZWFuICR7dGhpcy5ib29sfT5gXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE51bWJlclByaW0ge1xuICBjb25zdHJ1Y3RvcihudW0pIHtcbiAgICB0aGlzLm51bSA9IG51bVxuICB9XG5cbiAgc2V0IG51bShudW0pIHtcbiAgICB0aGlzLl9udW0gPSBOdW1iZXIobnVtKVxuICB9XG5cbiAgZ2V0IG51bSgpIHtcbiAgICByZXR1cm4gTnVtYmVyKHRoaXMuX251bSlcbiAgfVxuXG4gIHZhbHVlT2YoKSB7XG4gICAgcmV0dXJuIHRoaXMubnVtXG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5udW1cbiAgfVxufVxuXG4vLyBDb252ZXJ0aW5nIGxhbmd1YWdlIHByaW1hdGl2ZXMgdG8gSlMgcHJpbXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBmdW5jdGlvbiB0b0pTdHJpbmcoc3RyKSB7XG4gIGlmKHN0ciBpbnN0YW5jZW9mIFN0cmluZ1ByaW0pIHtcbiAgICByZXR1cm4gc3RyLnN0clxuICB9IGVsc2Uge1xuICAgIHJldHVybiBTdHJpbmcoc3RyKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0pCb29sZWFuKGJvb2wpIHtcbiAgaWYoYm9vbCBpbnN0YW5jZW9mIEJvb2xlYW5QcmltICYmIGJvb2wuYm9vbCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiB0cnVlXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvSk51bWJlcihudW0pIHtcbiAgaWYobnVtIGluc3RhbmNlb2YgTnVtYmVyUHJpbSkge1xuICAgIHJldHVybiBudW0ubnVtXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIE51bWJlcihudW0pXG4gIH1cbn1cblxuLy8gQ29udmVydGluZyBKUyBwcmltcyB0byBsYW5ndWFnZSBwcmltaXRpdmVzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgZnVuY3Rpb24gdG9MU3RyaW5nKHN0cikge1xuICByZXR1cm4gbmV3IFN0cmluZ1ByaW0oc3RyKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9MQm9vbGVhbihib29sKSB7XG4gIHJldHVybiBuZXcgQm9vbGVhblByaW0oYm9vbClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvTE51bWJlcihudW0pIHtcbiAgcmV0dXJuIG5ldyBOdW1iZXJQcmltKG51bSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvTE9iamVjdChkYXRhKSB7XG4gIGxldCBvYmogPSBuZXcgTE9iamVjdCgpXG4gIGZvcihsZXQga2V5IGluIGRhdGEpIHtcbiAgICBzZXQob2JqLCBrZXksIGRhdGFba2V5XSlcbiAgfVxuICByZXR1cm4gb2JqXG59XG5cbi8vIENhbGwgZnVuY3Rpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGwoZm4sIGFyZ3MpIHtcbiAgcmV0dXJuIGZuWydfX2NhbGxfXyddKGFyZ3MpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0Q2FsbChmblRva2VuLCBhcmdzKSB7XG4gIGlmKGZuVG9rZW4uZm4gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgIC8vIGl0J3MgYSBqYXZhc2NyaXB0IGZ1bmN0aW9uIHNvIGp1c3QgY2FsbCBpdFxuICAgIHJldHVybiBmblRva2VuLmZuKGFyZ3MubWFwKFxuICAgICAgYXJnID0+IGludGVycC5ldmFsdWF0ZUV4cHJlc3Npb24oYXJnLCBmblRva2VuLmFyZ3VtZW50U2NvcGUpKSlcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBzY29wZSA9IE9iamVjdC5hc3NpZ24oe30sIGZuVG9rZW4uc2NvcGVsZXRpYWJsZXMpXG4gICAgbGV0IHJldHVyblZhbHVlID0gbnVsbFxuICAgIHNjb3BlLnJldHVybiA9IG5ldyBsZXRpYWJsZShuZXcgTEZ1bmN0aW9uKGZ1bmN0aW9uKFt2YWxdKSB7XG4gICAgICByZXR1cm5WYWx1ZSA9IHZhbFxuICAgIH0pKVxuICAgIGNvbnN0IHBhcmFtYXRlcnMgPSBmblRva2VuLnBhcmFtYXRlckxpc3RcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgcGFyYW1hdGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdmFsdWUgPSBhcmdzW2ldXG4gICAgICBjb25zdCBwYXJhbWF0ZXIgPSBwYXJhbWF0ZXJzW2ldXG4gICAgICBpZihwYXJhbWF0ZXIudHlwZSA9PT0gJ25vcm1hbCcpIHtcbiAgICAgICAgY29uc3QgZXZhbHVhdGVkVmFsdWUgPSBpbnRlcnAuZXZhbHVhdGVFeHByZXNzaW9uKHZhbHVlKVxuICAgICAgICBzY29wZVtwYXJhbWF0ZXIubmFtZV0gPSBuZXcgbGV0aWFibGUoZXZhbHVhdGVkVmFsdWUpXG4gICAgICB9IGVsc2UgaWYocGFyYW1hdGVyLnR5cGUgPT09ICd1bmV2YWx1YXRlZCcpIHtcbiAgICAgICAgc2NvcGVbcGFyYW1hdGVyLm5hbWVdID0gbmV3IGxldGlhYmxlKG5ldyBMRnVuY3Rpb24oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGludGVycC5ldmFsdWF0ZUV4cHJlc3Npb24odmFsdWUsIGZuVG9rZW4uYXJndW1lbnRTY29wZSlcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfVxuICAgIGludGVycC5ldmFsdWF0ZUVhY2hFeHByZXNzaW9uKHNjb3BlLCBmblRva2VuLmZuKVxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG59XG5cbi8vIEhhcyBmdW5jdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhcyhvYmosIGtleSkge1xuICByZXR1cm4ga2V5IGluIG9ialxufVxuXG4vLyBHZXQgZnVuY3Rpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQob2JqLCBrZXkpIHtcbiAgcmV0dXJuIG9ialsnX19nZXRfXyddKGtleSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRHZXQob2JqLCBrZXkpIHtcbiAgbGV0IGtleVN0cmluZyA9IHRvSlN0cmluZyhrZXkpXG4gIGlmKGtleVN0cmluZyBpbiBvYmouZGF0YSkge1xuICAgIHJldHVybiBvYmouZGF0YVtrZXlTdHJpbmddXG4gIH0gZWxzZSB7XG4gICAgbGV0IGNvbnN0cnVjdG9yID0gb2JqWydfX2NvbnN0cnVjdG9yX18nXVxuICAgIGxldCBwcm90b3R5cGUgPSBjb25zdHJ1Y3RvclsnX19wcm90b3R5cGVfXyddXG4gICAgbGV0IGN1cnJlbnQgPSBjb25zdHJ1Y3RvclxuICAgIHdoaWxlKGN1cnJlbnQgJiYgcHJvdG90eXBlICYmICEoa2V5IGluIHByb3RvdHlwZSkpIHtcbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50WydfX3N1cGVyX18nXVxuICAgICAgcHJvdG90eXBlID0gY3VycmVudCA/IGN1cnJlbnRbJ19fcHJvdG90eXBlX18nXSA6IG51bGxcbiAgICB9XG4gICAgaWYoY3VycmVudCkge1xuICAgICAgbGV0IHZhbHVlID0gcHJvdG90eXBlW2tleVN0cmluZ11cbiAgICAgIGlmKHZhbHVlIGluc3RhbmNlb2YgTEZ1bmN0aW9uKSB7XG4gICAgICAgIC8vIEkgd2FzIGdvaW5nIHRvIGp1c3QgYmluZCB0byBvYmosIGJ1dCB0aGF0IGdlbmVyYWxseSBpbnZvbHZlcyB1c2luZ1xuICAgICAgICAvLyB0aGUgb2ggc28gdGVycmlibGUgYHRoaXNgLlxuICAgICAgICAvLyBJbnN0ZWFkIGl0IHJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGNhbGxzIHRoZSBnaXZlbiBmdW5jdGlvbiB3aXRoXG4gICAgICAgIC8vIG9iaiBhcyB0aGUgZmlyc3QgcGFyYW1hdGVyLlxuICAgICAgICByZXR1cm4gbmV3IExGdW5jdGlvbihmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlLmZuKG9iaiwgLi4uYXJncylcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBTZXQgZnVuY3Rpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQob2JqLCBrZXksIHZhbHVlKSB7XG4gIHJldHVybiBvYmpbJ19fc2V0X18nXShrZXksIHZhbHVlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdFNldChvYmosIGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIG9iai5kYXRhW3RvSlN0cmluZyhrZXkpXSA9IHZhbHVlXG59XG5cbi8vIGxldGlhYmxlIGNsYXNzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vICogdGhpcyBzaG91bGQgbmV2ZXIgKmV2ZXIqIGJlIGFjY2Vzc2VkIHRocm91Z2ggYW55d2hlcmUgZXhjZXB0IHNldC9nZXRcbi8vICAgbGV0aWFibGUgZnVuY3Rpb25zXG4vLyAqIHRha2VzIG9uZSBwYXJhbWF0ZXIsIHZhbHVlLCB3aGljaCBpcyBzdG9yZWQgaW4gaW5zdC52YWx1ZSBhbmQgcmVwcmVzZW50c1xuLy8gICB0aGUgdmFsdWUgb2YgdGhlIGxldGlhYmxlXG5leHBvcnQgY2xhc3MgbGV0aWFibGUge1xuICBjb25zdHJ1Y3Rvcih2YWx1ZSkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICB9XG59XG5cbi8vIEJhc2UgdG9rZW4gY2xhc3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vICogZG9lc24ndCBkbyBhbnl0aGluZyBvbiBpdHMgb3duXG4vLyAqIHVzZSB4IGluc3RhbmNlb2YgVG9rZW4gdG8gY2hlY2sgaWYgeCBpcyBhbnkga2luZCBvZiB0b2tlblxuXG5leHBvcnQgY2xhc3MgVG9rZW4ge1xuICBjb25zdHJ1Y3RvcigpIHt9XG59XG5cbi8vIE9iamVjdCB0b2tlbiBjbGFzcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGNsYXNzIExPYmplY3QgZXh0ZW5kcyBUb2tlbiB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmRhdGEgPSB7fVxuICAgIHRoaXNbJ19fY29uc3RydWN0b3JfXyddID0gTE9iamVjdFxuICB9XG5cbiAgX19nZXRfXyhrZXkpIHtcbiAgICByZXR1cm4gZGVmYXVsdEdldCh0aGlzLCBrZXkpXG4gIH1cblxuICBfX3NldF9fKGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gZGVmYXVsdFNldCh0aGlzLCBrZXksIHZhbHVlKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMQXJyYXkgZXh0ZW5kcyBMT2JqZWN0IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXNbJ19fY29uc3RydWN0b3JfXyddID0gTEFycmF5XG4gICAgdGhpcy5kYXRhLmxlbmd0aCA9IDBcbiAgfVxufVxuXG4vLyBGdW5jdGlvbiB0b2tlbiBjbGFzcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbW3RoaXMgbmVlZHMgdG8gYmUgcmV3cml0dGVuXV1cbi8vICogdGFrZXMgb25lIHBhcmFtYXRlciwgZm4sIHdoaWNoIGlzIHN0b3JlZCBpbiBpbnN0LmZuIGFuZCByZXByZXNlbnRzIHRoZVxuLy8gICAgIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWRcbi8vICogeW91IGNhbiBhbHNvIHNldCBzY29wZWxldGlhYmxlcyAodXNpbmcgc2V0U2NvcGVsZXRpYWJsZXMpLCB3aGljaCBpc1xuLy8gICAgIGdlbmVyYWxseSBvbmx5IHVzZWQgZm9yIGludGVybmFsIGNyZWF0aW9uIG9mIGZ1bmN0aW9uIGV4cHJlc3Npb25zOyBpdFxuLy8gICAgIHJlcHJlc2VudHMgdGhlIGNsb3N1cmUgbGV0aWFibGVzIHRoYXQgY2FuIGJlIGFjY2Vzc2VkIGZyb20gd2l0aGluIHRoZVxuLy8gICAgIGZ1bmN0aW9uXG4vLyAqIHlvdSBjYW4gYWxzbyBzZXQgZm5Bcmd1bWVudHMgKHVzaW5nIHNldEFyZ3VtZW50cyksIHdoaWNoIGlzIGdlbmVyYWxseSBhbHNvXG4vLyAgICAgb25seSB1c2VkIGZvciBpbnRlcm5hbCBjcmVhdGlvbiBvZiBmdW5jdGlvbiBleHByZXNzaW9uczsgaXQgdGVsbHMgd2hhdFxuLy8gICAgIGNhbGwgYXJndW1lbnRzIHNob3VsZCBiZSBtYXBwZWQgdG8gaW4gdGhlIGxldGlhYmxlcyBjb250ZXh0IG9mIHJ1bm5pbmdcbi8vICAgICB0aGUgY29kZSBibG9ja1xuLy8gKiB1c2UgaW5zdC5fX2NhbGxfXyB0byBjYWxsIHRoZSBmdW5jdGlvbiAod2l0aCBvcHRpb25hbCBhcmd1bWVudHMpXG5cbmV4cG9ydCBjbGFzcyBMRnVuY3Rpb24gZXh0ZW5kcyBMT2JqZWN0IHtcbiAgY29uc3RydWN0b3IoZm4pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpc1snX19jb25zdHJ1Y3Rvcl9fJ10gPSBMRnVuY3Rpb25cbiAgICB0aGlzLmZuID0gZm5cbiAgICB0aGlzLnNjb3BlbGV0aWFibGVzID0gbnVsbFxuXG4gICAgdGhpcy51bmV2YWx1YXRlZEFyZ3MgPSBbXVxuICAgIHRoaXMubm9ybWFsQXJncyA9IFtdXG4gIH1cblxuICBfX2NhbGxfXyhhcmdzKSB7XG4gICAgLy8gQ2FsbCB0aGlzIGZ1bmN0aW9uLiBCeSBkZWZhdWx0IHVzZXMgZGVmYXVsdENhbGwsIGJ1dCBjYW4gYmUgb3ZlcnJpZGVuXG4gICAgLy8gYnkgc3ViY2xhc3Nlcy5cbiAgICByZXR1cm4gZGVmYXVsdENhbGwodGhpcywgYXJncylcbiAgfVxuXG4gIHNldFNjb3BlbGV0aWFibGVzKHNjb3BlbGV0aWFibGVzKSB7XG4gICAgdGhpcy5zY29wZWxldGlhYmxlcyA9IHNjb3BlbGV0aWFibGVzXG4gIH1cblxuICBzZXRQYXJhbWF0ZXJzKHBhcmFtYXRlckxpc3QpIHtcbiAgICB0aGlzLnBhcmFtYXRlckxpc3QgPSBwYXJhbWF0ZXJMaXN0XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gJzxPYmplY3QgRnVuY3Rpb24+J1xuICB9XG59XG5cbi8vIEVUQy4gdGhhdCByZXF1aXJlcyBhYm92ZSBkZWZpbml0aW9ucyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGxldCBMT2JqZWN0UHJvdG90eXBlID0ge31cblxuZXhwb3J0IGxldCBMQXJyYXlQcm90b3R5cGUgPSB7XG4gIHB1c2g6IG5ldyBMRnVuY3Rpb24oZnVuY3Rpb24oc2VsZiwgd2hhdCkge1xuICAgIHNlbGYuZGF0YVtzZWxmLmRhdGEubGVuZ3RoXSA9IHdoYXRcbiAgICBzZWxmLmRhdGEubGVuZ3RoID0gc2VsZi5kYXRhLmxlbmd0aCArIDFcbiAgfSksXG4gIHBvcDogbmV3IExGdW5jdGlvbihmdW5jdGlvbihzZWxmKSB7XG4gICAgZGVsZXRlIHNlbGYuZGF0YVtzZWxmLmRhdGEubGVuZ3RoIC0gMV1cbiAgICBzZWxmLmRhdGEubGVuZ3RoID0gc2VsZi5kYXRhLmxlbmd0aCAtIDFcbiAgfSlcbn1cblxuZXhwb3J0IGxldCBMRnVuY3Rpb25Qcm90b3R5cGUgPSB7XG4gIGRlYnVnOiBuZXcgTEZ1bmN0aW9uKGZ1bmN0aW9uKHNlbGYpIHtcbiAgICBjb25zb2xlLmxvZygnKiogREVCVUcgKionKVxuICAgIGNvbnNvbGUubG9nKHNlbGYuZm4udG9TdHJpbmcoKSlcbiAgfSlcbn1cblxuTE9iamVjdFsnX19wcm90b3R5cGVfXyddID0gTE9iamVjdFByb3RvdHlwZVxuTE9iamVjdFsnX19zdXBlcl9fJ10gPSBudWxsXG5cbkxBcnJheVsnX19wcm90b3R5cGVfXyddID0gTEFycmF5UHJvdG90eXBlXG5MQXJyYXlbJ19fc3VwZXJfXyddID0gTE9iamVjdFxuXG5MRnVuY3Rpb25bJ19fcHJvdG90eXBlX18nXSA9IExGdW5jdGlvblByb3RvdHlwZVxuTEZ1bmN0aW9uWydfX3N1cGVyX18nXSA9IExPYmplY3RcbiJdfQ==