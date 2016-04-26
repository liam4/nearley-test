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

    if (fnToken.isShorthand) {
      return interp.evaluateExpression(fnToken.fn, scope);
    } else {
      interp.evaluateEachExpression(scope, fnToken.fn);
      return returnValue;
    }
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
//# sourceMappingURL=data:application/json;base64,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QVIsSUFBdUIsSUFBdkI7O0FBRUEsT0FBTyxlQUFQLElBQTBCLGVBQTFCO0FBQ0EsT0FBTyxXQUFQLElBQXNCLE9BQXRCOztBQUVBLFVBQVUsZUFBVixJQUE2QixrQkFBN0I7QUFDQSxVQUFVLFdBQVYsSUFBeUIsT0FBekIiLCJmaWxlIjoibGliLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgaW50ZXJwID0gcmVxdWlyZSgnLi9pbnRlcnAnKVxuY29uc3QgQyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJylcblxuZXhwb3J0IGNsYXNzIFN0cmluZ1ByaW0ge1xuICBjb25zdHJ1Y3RvcihzdHIpIHtcbiAgICB0aGlzLnN0ciA9IHN0clxuICB9XG5cbiAgc2V0IHN0cihzdHIpIHtcbiAgICB0aGlzLl9zdHIgPSBTdHJpbmcoc3RyKVxuICB9XG5cbiAgZ2V0IHN0cigpIHtcbiAgICByZXR1cm4gU3RyaW5nKHRoaXMuX3N0cilcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLnN0clxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCb29sZWFuUHJpbSB7XG4gIGNvbnN0cnVjdG9yKGJvb2wpIHtcbiAgICB0aGlzLmJvb2wgPSBib29sXG4gIH1cblxuICBzZXQgYm9vbChib29sKSB7XG4gICAgdGhpcy5fYm9vbCA9IEJvb2xlYW4oYm9vbClcbiAgfVxuXG4gIGdldCBib29sKCkge1xuICAgIHJldHVybiBCb29sZWFuKHRoaXMuX2Jvb2wpXG4gIH1cblxuICB2YWx1ZU9mKCkge1xuICAgIHJldHVybiB0aGlzLmJvb2xcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBgPEJvb2xlYW4gJHt0aGlzLmJvb2x9PmBcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTnVtYmVyUHJpbSB7XG4gIGNvbnN0cnVjdG9yKG51bSkge1xuICAgIHRoaXMubnVtID0gbnVtXG4gIH1cblxuICBzZXQgbnVtKG51bSkge1xuICAgIHRoaXMuX251bSA9IE51bWJlcihudW0pXG4gIH1cblxuICBnZXQgbnVtKCkge1xuICAgIHJldHVybiBOdW1iZXIodGhpcy5fbnVtKVxuICB9XG5cbiAgdmFsdWVPZigpIHtcbiAgICByZXR1cm4gdGhpcy5udW1cbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm51bVxuICB9XG59XG5cbi8vIENvbnZlcnRpbmcgbGFuZ3VhZ2UgcHJpbWF0aXZlcyB0byBKUyBwcmltcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvSlN0cmluZyhzdHIpIHtcbiAgaWYgKHN0ciBpbnN0YW5jZW9mIFN0cmluZ1ByaW0pIHtcbiAgICByZXR1cm4gc3RyLnN0clxuICB9IGVsc2Uge1xuICAgIHJldHVybiBTdHJpbmcoc3RyKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0pCb29sZWFuKGJvb2wpIHtcbiAgaWYgKGJvb2wgaW5zdGFuY2VvZiBCb29sZWFuUHJpbSAmJiBib29sLmJvb2wgPT09IHRydWUpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0pOdW1iZXIobnVtKSB7XG4gIGlmIChudW0gaW5zdGFuY2VvZiBOdW1iZXJQcmltKSB7XG4gICAgcmV0dXJuIG51bS5udW1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gTnVtYmVyKG51bSlcbiAgfVxufVxuXG4vLyBDb252ZXJ0aW5nIEpTIHByaW1zIHRvIGxhbmd1YWdlIHByaW1pdGl2ZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBmdW5jdGlvbiB0b0xTdHJpbmcoc3RyKSB7XG4gIHJldHVybiBuZXcgU3RyaW5nUHJpbShzdHIpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0xCb29sZWFuKGJvb2wpIHtcbiAgcmV0dXJuIG5ldyBCb29sZWFuUHJpbShib29sKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9MTnVtYmVyKG51bSkge1xuICByZXR1cm4gbmV3IE51bWJlclByaW0obnVtKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9MT2JqZWN0KGRhdGEpIHtcbiAgbGV0IG9iaiA9IG5ldyBMT2JqZWN0KClcbiAgZm9yIChsZXQga2V5IGluIGRhdGEpIHtcbiAgICBzZXQob2JqLCBrZXksIGRhdGFba2V5XSlcbiAgfVxuICByZXR1cm4gb2JqXG59XG5cbi8vIENhbGwgZnVuY3Rpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGwoZm4sIGFyZ3MpIHtcbiAgcmV0dXJuIGZuWydfX2NhbGxfXyddKGFyZ3MpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0Q2FsbChmblRva2VuLCBhcmdzKSB7XG4gIGlmIChmblRva2VuLmZuIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAvLyBpdCdzIGEgamF2YXNjcmlwdCBmdW5jdGlvbiBzbyBqdXN0IGNhbGwgaXRcbiAgICByZXR1cm4gZm5Ub2tlbi5mbihhcmdzLm1hcChcbiAgICAgIGFyZyA9PiBpbnRlcnAuZXZhbHVhdGVFeHByZXNzaW9uKGFyZywgZm5Ub2tlbi5hcmd1bWVudFNjb3BlKSkpXG4gIH0gZWxzZSB7XG4gICAgY29uc3Qgc2NvcGUgPSBPYmplY3QuYXNzaWduKHt9LCBmblRva2VuLnNjb3BlVmFyaWFibGVzKVxuICAgIGxldCByZXR1cm5WYWx1ZSA9IG51bGxcbiAgICBzY29wZS5yZXR1cm4gPSBuZXcgVmFyaWFibGUobmV3IExGdW5jdGlvbihmdW5jdGlvbihbdmFsXSkge1xuICAgICAgcmV0dXJuVmFsdWUgPSB2YWxcbiAgICB9KSlcbiAgICBjb25zdCBwYXJhbWF0ZXJzID0gZm5Ub2tlbi5wYXJhbWF0ZXJMaXN0XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJhbWF0ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGFyZ3NbaV1cbiAgICAgIGNvbnN0IHBhcmFtYXRlciA9IHBhcmFtYXRlcnNbaV1cbiAgICAgIGlmIChwYXJhbWF0ZXIudHlwZSA9PT0gJ25vcm1hbCcpIHtcbiAgICAgICAgY29uc3QgZXZhbHVhdGVkVmFsdWUgPSBpbnRlcnAuZXZhbHVhdGVFeHByZXNzaW9uKHZhbHVlKVxuICAgICAgICBzY29wZVtwYXJhbWF0ZXIubmFtZV0gPSBuZXcgVmFyaWFibGUoZXZhbHVhdGVkVmFsdWUpXG4gICAgICB9IGVsc2UgaWYgKHBhcmFtYXRlci50eXBlID09PSAndW5ldmFsdWF0ZWQnKSB7XG4gICAgICAgIHNjb3BlW3BhcmFtYXRlci5uYW1lXSA9IG5ldyBWYXJpYWJsZShuZXcgTEZ1bmN0aW9uKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBpbnRlcnAuZXZhbHVhdGVFeHByZXNzaW9uKHZhbHVlLCBmblRva2VuLmFyZ3VtZW50U2NvcGUpXG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmblRva2VuLmlzU2hvcnRoYW5kKSB7XG4gICAgICByZXR1cm4gaW50ZXJwLmV2YWx1YXRlRXhwcmVzc2lvbihmblRva2VuLmZuLCBzY29wZSlcbiAgICB9IGVsc2Uge1xuICAgICAgaW50ZXJwLmV2YWx1YXRlRWFjaEV4cHJlc3Npb24oc2NvcGUsIGZuVG9rZW4uZm4pXG4gICAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgICB9XG4gIH1cbn1cblxuLy8gSGFzIGZ1bmN0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzKG9iaiwga2V5KSB7XG4gIHJldHVybiBrZXkgaW4gb2JqXG59XG5cbi8vIEdldCBmdW5jdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldChvYmosIGtleSkge1xuICByZXR1cm4gb2JqWydfX2dldF9fJ10oa2V5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdEdldChvYmosIGtleSkge1xuICBsZXQga2V5U3RyaW5nID0gdG9KU3RyaW5nKGtleSlcbiAgaWYgKGtleVN0cmluZyBpbiBvYmouZGF0YSkge1xuICAgIHJldHVybiBvYmouZGF0YVtrZXlTdHJpbmddXG4gIH0gZWxzZSB7XG4gICAgbGV0IGNvbnN0cnVjdG9yID0gb2JqWydfX2NvbnN0cnVjdG9yX18nXVxuICAgIGxldCBwcm90b3R5cGUgPSBjb25zdHJ1Y3RvclsnX19wcm90b3R5cGVfXyddXG4gICAgbGV0IGN1cnJlbnQgPSBjb25zdHJ1Y3RvclxuICAgIHdoaWxlIChjdXJyZW50ICYmIHByb3RvdHlwZSAmJiAhKGtleSBpbiBwcm90b3R5cGUpKSB7XG4gICAgICBjdXJyZW50ID0gY3VycmVudFsnX19zdXBlcl9fJ11cbiAgICAgIHByb3RvdHlwZSA9IGN1cnJlbnQgPyBjdXJyZW50WydfX3Byb3RvdHlwZV9fJ10gOiBudWxsXG4gICAgfVxuICAgIGlmIChjdXJyZW50KSB7XG4gICAgICBsZXQgdmFsdWUgPSBwcm90b3R5cGVba2V5U3RyaW5nXVxuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTEZ1bmN0aW9uKSB7XG4gICAgICAgIC8vIEkgd2FzIGdvaW5nIHRvIGp1c3QgYmluZCB0byBvYmosIGJ1dCB0aGF0IGdlbmVyYWxseSBpbnZvbHZlcyB1c2luZ1xuICAgICAgICAvLyB0aGUgb2ggc28gdGVycmlibGUgYHRoaXNgLlxuICAgICAgICAvLyBJbnN0ZWFkIGl0IHJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGNhbGxzIHRoZSBnaXZlbiBmdW5jdGlvbiB3aXRoXG4gICAgICAgIC8vIG9iaiBhcyB0aGUgZmlyc3QgcGFyYW1hdGVyLlxuICAgICAgICByZXR1cm4gbmV3IExGdW5jdGlvbihmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlLmZuKG9iaiwgLi4uYXJncylcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBTZXQgZnVuY3Rpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQob2JqLCBrZXksIHZhbHVlKSB7XG4gIHJldHVybiBvYmpbJ19fc2V0X18nXShrZXksIHZhbHVlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdFNldChvYmosIGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIG9iai5kYXRhW3RvSlN0cmluZyhrZXkpXSA9IHZhbHVlXG59XG5cbi8vIFZhcmlhYmxlIGNsYXNzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vICogdGhpcyBzaG91bGQgbmV2ZXIgKmV2ZXIqIGJlIGFjY2Vzc2VkIHRocm91Z2ggYW55d2hlcmUgZXhjZXB0IHNldC9nZXRcbi8vICAgVmFyaWFibGUgZnVuY3Rpb25zXG4vLyAqIHRha2VzIG9uZSBwYXJhbWF0ZXIsIHZhbHVlLCB3aGljaCBpcyBzdG9yZWQgaW4gaW5zdC52YWx1ZSBhbmQgcmVwcmVzZW50c1xuLy8gICB0aGUgdmFsdWUgb2YgdGhlIFZhcmlhYmxlXG5leHBvcnQgY2xhc3MgVmFyaWFibGUge1xuICBjb25zdHJ1Y3Rvcih2YWx1ZSkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICc8VmFyaWFibGU+J1xuICB9XG59XG5cbi8vIEJhc2UgdG9rZW4gY2xhc3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vICogZG9lc24ndCBkbyBhbnl0aGluZyBvbiBpdHMgb3duXG4vLyAqIHVzZSB4IGluc3RhbmNlb2YgVG9rZW4gdG8gY2hlY2sgaWYgeCBpcyBhbnkga2luZCBvZiB0b2tlblxuXG5leHBvcnQgY2xhc3MgVG9rZW4ge1xuICBjb25zdHJ1Y3RvcigpIHt9XG59XG5cbi8vIE9iamVjdCB0b2tlbiBjbGFzcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZXhwb3J0IGNsYXNzIExPYmplY3QgZXh0ZW5kcyBUb2tlbiB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmRhdGEgPSB7fVxuICAgIHRoaXNbJ19fY29uc3RydWN0b3JfXyddID0gTE9iamVjdFxuICB9XG5cbiAgX19nZXRfXyhrZXkpIHtcbiAgICByZXR1cm4gZGVmYXVsdEdldCh0aGlzLCBrZXkpXG4gIH1cblxuICBfX3NldF9fKGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gZGVmYXVsdFNldCh0aGlzLCBrZXksIHZhbHVlKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMQXJyYXkgZXh0ZW5kcyBMT2JqZWN0IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXNbJ19fY29uc3RydWN0b3JfXyddID0gTEFycmF5XG4gICAgdGhpcy5kYXRhLmxlbmd0aCA9IDBcbiAgfVxufVxuXG4vLyBGdW5jdGlvbiB0b2tlbiBjbGFzcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBbW3RoaXMgbmVlZHMgdG8gYmUgcmV3cml0dGVuXV1cbi8vICogdGFrZXMgb25lIHBhcmFtYXRlciwgZm4sIHdoaWNoIGlzIHN0b3JlZCBpbiBpbnN0LmZuIGFuZCByZXByZXNlbnRzIHRoZVxuLy8gICAgIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWRcbi8vICogeW91IGNhbiBhbHNvIHNldCBzY29wZVZhcmlhYmxlcyAodXNpbmcgc2V0U2NvcGVWYXJpYWJsZXMpLCB3aGljaCBpc1xuLy8gICAgIGdlbmVyYWxseSBvbmx5IHVzZWQgZm9yIGludGVybmFsIGNyZWF0aW9uIG9mIGZ1bmN0aW9uIGV4cHJlc3Npb25zOyBpdFxuLy8gICAgIHJlcHJlc2VudHMgdGhlIGNsb3N1cmUgVmFyaWFibGVzIHRoYXQgY2FuIGJlIGFjY2Vzc2VkIGZyb20gd2l0aGluIHRoZVxuLy8gICAgIGZ1bmN0aW9uXG4vLyAqIHlvdSBjYW4gYWxzbyBzZXQgZm5Bcmd1bWVudHMgKHVzaW5nIHNldEFyZ3VtZW50cyksIHdoaWNoIGlzIGdlbmVyYWxseSBhbHNvXG4vLyAgICAgb25seSB1c2VkIGZvciBpbnRlcm5hbCBjcmVhdGlvbiBvZiBmdW5jdGlvbiBleHByZXNzaW9uczsgaXQgdGVsbHMgd2hhdFxuLy8gICAgIGNhbGwgYXJndW1lbnRzIHNob3VsZCBiZSBtYXBwZWQgdG8gaW4gdGhlIFZhcmlhYmxlcyBjb250ZXh0IG9mIHJ1bm5pbmdcbi8vICAgICB0aGUgY29kZSBibG9ja1xuLy8gKiB1c2UgaW5zdC5fX2NhbGxfXyB0byBjYWxsIHRoZSBmdW5jdGlvbiAod2l0aCBvcHRpb25hbCBhcmd1bWVudHMpXG5cbmV4cG9ydCBjbGFzcyBMRnVuY3Rpb24gZXh0ZW5kcyBMT2JqZWN0IHtcbiAgY29uc3RydWN0b3IoZm4pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpc1snX19jb25zdHJ1Y3Rvcl9fJ10gPSBMRnVuY3Rpb25cbiAgICB0aGlzLmZuID0gZm5cbiAgICB0aGlzLnNjb3BlVmFyaWFibGVzID0gbnVsbFxuXG4gICAgdGhpcy51bmV2YWx1YXRlZEFyZ3MgPSBbXVxuICAgIHRoaXMubm9ybWFsQXJncyA9IFtdXG4gIH1cblxuICBfX2NhbGxfXyhhcmdzKSB7XG4gICAgLy8gQ2FsbCB0aGlzIGZ1bmN0aW9uLiBCeSBkZWZhdWx0IHVzZXMgZGVmYXVsdENhbGwsIGJ1dCBjYW4gYmUgb3ZlcnJpZGVuXG4gICAgLy8gYnkgc3ViY2xhc3Nlcy5cbiAgICByZXR1cm4gZGVmYXVsdENhbGwodGhpcywgYXJncylcbiAgfVxuXG4gIHNldFNjb3BlVmFyaWFibGVzKHNjb3BlVmFyaWFibGVzKSB7XG4gICAgdGhpcy5zY29wZVZhcmlhYmxlcyA9IHNjb3BlVmFyaWFibGVzXG4gIH1cblxuICBzZXRQYXJhbWF0ZXJzKHBhcmFtYXRlckxpc3QpIHtcbiAgICB0aGlzLnBhcmFtYXRlckxpc3QgPSBwYXJhbWF0ZXJMaXN0XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gJzxPYmplY3QgRnVuY3Rpb24+J1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMRW52aXJvbm1lbnQge1xuICBjb25zdHJ1Y3Rvcih2YXJpYWJsZXMpIHtcbiAgICB0aGlzWydfX2NvbnN0cnVjdG9yX18nXSA9IExFbnZpcm9ubWVudFxuICAgIHRoaXMudmFycyA9IHZhcmlhYmxlc1xuICB9XG5cbiAgX19zZXRfXyh2YXJpYWJsZU5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy52YXJzW3ZhcmlhYmxlTmFtZV0gPSBuZXcgVmFyaWFibGUodmFsdWUpXG4gIH1cblxuICBfX2dldF9fKHZhcmlhYmxlTmFtZSkge1xuICAgIHJldHVybiB0aGlzLnZhcnNbdmFyaWFibGVOYW1lXS52YWx1ZVxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKHRoaXMudmFycykpXG4gIH1cbn1cblxuLy8gRVRDLiB0aGF0IHJlcXVpcmVzIGFib3ZlIGRlZmluaXRpb25zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgbGV0IExPYmplY3RQcm90b3R5cGUgPSB7fVxuXG5leHBvcnQgbGV0IExBcnJheVByb3RvdHlwZSA9IHtcbiAgcHVzaDogbmV3IExGdW5jdGlvbihmdW5jdGlvbihzZWxmLCB3aGF0KSB7XG4gICAgc2VsZi5kYXRhW3NlbGYuZGF0YS5sZW5ndGhdID0gd2hhdFxuICAgIHNlbGYuZGF0YS5sZW5ndGggPSBzZWxmLmRhdGEubGVuZ3RoICsgMVxuICB9KSxcbiAgcG9wOiBuZXcgTEZ1bmN0aW9uKGZ1bmN0aW9uKHNlbGYpIHtcbiAgICBkZWxldGUgc2VsZi5kYXRhW3NlbGYuZGF0YS5sZW5ndGggLSAxXVxuICAgIHNlbGYuZGF0YS5sZW5ndGggPSBzZWxmLmRhdGEubGVuZ3RoIC0gMVxuICB9KVxufVxuXG5leHBvcnQgbGV0IExGdW5jdGlvblByb3RvdHlwZSA9IHtcbiAgZGVidWc6IG5ldyBMRnVuY3Rpb24oZnVuY3Rpb24oc2VsZikge1xuICAgIGNvbnNvbGUubG9nKCcqKiBERUJVRyAqKicpXG4gICAgY29uc29sZS5sb2coc2VsZi5mbi50b1N0cmluZygpKVxuICB9KVxufVxuXG5MT2JqZWN0WydfX3Byb3RvdHlwZV9fJ10gPSBMT2JqZWN0UHJvdG90eXBlXG5MT2JqZWN0WydfX3N1cGVyX18nXSA9IG51bGxcblxuTEFycmF5WydfX3Byb3RvdHlwZV9fJ10gPSBMQXJyYXlQcm90b3R5cGVcbkxBcnJheVsnX19zdXBlcl9fJ10gPSBMT2JqZWN0XG5cbkxGdW5jdGlvblsnX19wcm90b3R5cGVfXyddID0gTEZ1bmN0aW9uUHJvdG90eXBlXG5MRnVuY3Rpb25bJ19fc3VwZXJfXyddID0gTE9iamVjdFxuIl19