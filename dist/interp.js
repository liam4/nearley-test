'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.interp = exports.evaluateEachExpression = exports.evaluateGetPropUsingIdentifier = exports.evaluateExpression = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var evaluateExpression = exports.evaluateExpression = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(expression, variables) {
    var fnExpression, argExpressions, fn, args, name, ret, _name, valueExpression, value, _name2, _valueExpression, _value, paramaters, code, _fn, _paramaters, codeExpression, _fn2, string, bool, number, objExpression, key, _valueExpression2, obj, _value2, _objExpression, _key, _obj, _value3;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log('evaluating expression', expression);

            if (!(expression[0] === C.COMMENT)) {
              _context.next = 5;
              break;
            }

            return _context.abrupt('return');

          case 5:
            if (!(expression instanceof Array && expression.every(function (e) {
              return e instanceof Array;
            }))) {
              _context.next = 7;
              break;
            }

            return _context.abrupt('return', evaluateEachExpression(variables, expression));

          case 7:
            if (!(expression[0] === C.VARIABLE_IDENTIFIER && expression[1] === 'environment')) {
              _context.next = 11;
              break;
            }

            return _context.abrupt('return', new lib.LEnvironment(variables));

          case 11:
            if (!(expression[0] === C.FUNCTION_CALL)) {
              _context.next = 26;
              break;
            }

            // Call a function: "function(arg1, arg2, arg3...)"

            // Get the function and argument expressions from the expression list.
            fnExpression = expression[1];
            argExpressions = expression[2];

            // Evaluate the function expression to get the actual function.

            _context.next = 16;
            return evaluateExpression(fnExpression, variables);

          case 16:
            fn = _context.sent;

            if (fn instanceof lib.LFunction) {
              _context.next = 19;
              break;
            }

            throw new Error('Can\'t call ' + chalk.cyan(fn) + ' because it\'s not a function');

          case 19:

            /* This code *used* to work but it doesn't any more, because some
             * parameters of the function could be unevaluated. Now argument evaluation
             * is done from within the call method of the function.
             */
            // Evaluate all of the arguments passed to the function.
            //const args = argExpressions.map(arg => evaluateExpression(arg, variables));
            fn.argumentScope = variables;
            args = argExpressions;

            // Use lib.call to call the function with the evaluated arguments.

            _context.next = 23;
            return lib.call(fn, args);

          case 23:
            return _context.abrupt('return', _context.sent);

          case 26:
            if (!(expression[0] === C.VARIABLE_IDENTIFIER)) {
              _context.next = 39;
              break;
            }

            // Get a variable: "name"

            // Get the name from the expression list.
            name = expression[1];


            console.log('Getting variable ' + name + '...');
            console.log(name in variables);

            // Return the variable's value, or, if the variable doesn't exist, throw an
            // error.

            if (!(name in variables)) {
              _context.next = 36;
              break;
            }

            console.log('Return:', variables[name]);
            ret = variables[name].value;
            return _context.abrupt('return', ret);

          case 36:
            throw new Error(chalk.cyan(name) + ' is not defined.');

          case 37:
            _context.next = 120;
            break;

          case 39:
            if (!(expression[0] === C.VARIABLE_ASSIGN)) {
              _context.next = 51;
              break;
            }

            // Set a variable to a value: "name => value"

            // Get the name and value expression from the expression list.
            _name = expression[1];
            valueExpression = expression[2];


            console.log('Setting variable ' + _name + '...');

            // Evaluate the value of the variable.
            _context.next = 45;
            return evaluateExpression(valueExpression, variables);

          case 45:
            value = _context.sent;


            console.log('..value is ' + value);

            // Set the variable in the variables object to a new variable with the
            // evaluated value.
            variables[_name] = new lib.Variable(value);
            return _context.abrupt('return');

          case 51:
            if (!(expression[0] === C.VARIABLE_CHANGE)) {
              _context.next = 61;
              break;
            }

            // Change a variable to a new value: "name -> newValue"

            // Get the name and value expression from the expression list.
            _name2 = expression[1];
            _valueExpression = expression[2];

            // Evaluate the new value of the variable.

            _context.next = 56;
            return evaluateExpression(_valueExpression, variables);

          case 56:
            _value = _context.sent;


            // Change the value of the already defined variable.
            variables[_name2].value = _value;
            return _context.abrupt('return');

          case 61:
            if (!(expression[0] === C.FUNCTION_PRIM)) {
              _context.next = 70;
              break;
            }

            // A function literal: "fn(arg1, arg2, arg3...) { code }"

            // Get the code and paramaters from the expression list.
            paramaters = expression[1];
            code = expression[2];

            // Create the function using the given code.

            _fn = new lib.LFunction(code);

            // Set the scope variables for the function to a copy of the current
            // variables.

            _fn.setScopeVariables((0, _assign2.default)({}, variables));

            // Set the paramaters for the function to the paramaters taken from the
            // expression list.
            _fn.setParamaters(paramaters);

            // Return the function.
            return _context.abrupt('return', _fn);

          case 70:
            if (!(expression[0] === C.SHORTHAND_FUNCTION_PRIM)) {
              _context.next = 80;
              break;
            }

            _paramaters = expression[1];
            codeExpression = expression[2];
            _fn2 = new lib.LFunction(codeExpression);

            _fn2.isShorthand = true;
            _fn2.setScopeVariables((0, _assign2.default)({}, variables));
            _fn2.setParamaters(_paramaters);
            return _context.abrupt('return', _fn2);

          case 80:
            if (!(expression[0] === C.STRING_PRIM)) {
              _context.next = 85;
              break;
            }

            // String literal: "contents"

            // Get string from expression list.
            string = expression[1];

            // Convert string to a language-usable string, and return.

            return _context.abrupt('return', lib.toLString(string));

          case 85:
            if (!(expression[0] === C.BOOLEAN_PRIM)) {
              _context.next = 90;
              break;
            }

            // Boolean literal: true/false

            // Get boolean value from expression list.
            bool = expression[1];

            // Convert boolean value to a language-usable boolean, and return.

            return _context.abrupt('return', lib.toLBoolean(bool));

          case 90:
            if (!(expression[0] === C.NUMBER_PRIM)) {
              _context.next = 95;
              break;
            }

            // Number primitive: 1, 2, 3, 4, 7.25, -3, etc.

            // Get number value from expression list.
            number = expression[1];

            // Convert number value to a language-usable number, and return.

            return _context.abrupt('return', lib.toLNumber(number));

          case 95:
            if (!(expression[0] === C.SET_PROP_USING_IDENTIFIER)) {
              _context.next = 109;
              break;
            }

            // Set a property of an object using an identifier literal:
            // "obj.key > value"

            // Get object expression, key, and value expression from expression list.
            objExpression = expression[1];
            key = expression[2];
            _valueExpression2 = expression[3];

            // Evaluate the object and value expressions.

            _context.next = 101;
            return evaluateExpression(objExpression, variables);

          case 101:
            obj = _context.sent;
            _context.next = 104;
            return evaluateExpression(_valueExpression2, variables);

          case 104:
            _value2 = _context.sent;


            // Use lib.set to set the property of the evaluated object.
            lib.set(obj, key, _value2);
            return _context.abrupt('return');

          case 109:
            if (!(expression[0] === C.GET_PROP_USING_IDENTIFIER)) {
              _context.next = 119;
              break;
            }

            // Get a property of an object using an identifier literal: "obj.key"

            // Get object expression and key from the expression list.
            _objExpression = expression[1];
            _key = expression[2];

            // Evaluate the object expression.

            _context.next = 114;
            return evaluateExpression(_objExpression, variables);

          case 114:
            _obj = _context.sent;


            // Get the value from lib.get.
            _value3 = lib.get(_obj, _key);

            // Return the gotten value.

            return _context.abrupt('return', _value3);

          case 119:
            throw new Error('Invalid expression: ' + chalk.cyan(expression[0]));

          case 120:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return function evaluateExpression(_x, _x2) {
    return ref.apply(this, arguments);
  };
}();

var evaluateGetPropUsingIdentifier = exports.evaluateGetPropUsingIdentifier = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(variables, _ref) {
    var _ref2 = (0, _slicedToArray3.default)(_ref, 3);

    var _ = _ref2[0];
    var objExpr = _ref2[1];
    var key = _ref2[2];
    var obj;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return evaluateExpression(objExpr, variables);

          case 2:
            obj = _context2.sent;
            return _context2.abrupt('return', lib.get(obj, key));

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return function evaluateGetPropUsingIdentifier(_x3, _x4) {
    return ref.apply(this, arguments);
  };
}();

var evaluateEachExpression = exports.evaluateEachExpression = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(variables, expressions) {
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _promise2.default.all(expressions.map(function (e) {
              return evaluateExpression(e, variables);
            }));

          case 2:
            return _context3.abrupt('return', _context3.sent);

          case 3:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));
  return function evaluateEachExpression(_x5, _x6) {
    return ref.apply(this, arguments);
  };
}();

var interp = exports.interp = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(ast, dir) {
    var variables, result;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!ast) {
              _context4.next = 10;
              break;
            }

            variables = {};


            (0, _assign2.default)(variables, builtins.makeBuiltins(dir));

            _context4.next = 5;
            return evaluateEachExpression(variables, ast);

          case 5:
            result = _context4.sent;

            console.log('derrrp (THIS IS GOOD)');

            return _context4.abrupt('return', { result: result, variables: variables });

          case 10:
            throw new Error('Haha, you didn\'t pass me a tree!');

          case 11:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));
  return function interp(_x7, _x8) {
    return ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var C = require('./constants');
var lib = require('./lib');
var chalk = require('chalk');
var builtins = require('./builtins');