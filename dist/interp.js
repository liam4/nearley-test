'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.interp = exports.evaluateEachExpression = exports.evaluateGetPropUsingIdentifier = exports.evaluateExpression = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var evaluateExpression = exports.evaluateExpression = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(expression, environment) {
    var returnVal;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
              var ret, fnExpression, argExpressions, fn, varName, args, takingArgs, name, _ret, _name, valueExpression, value, _name2, _valueExpression, _value, paramaters, code, isAsync, _fn, _paramaters, codeExpression, _fn2, string, bool, number, objExpression, key, _valueExpression2, obj, _value2, _objExpression, _key, _obj, _value3;

              return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      if (!(expression[0] === C.COMMENT)) {
                        _context.next = 4;
                        break;
                      }

                      return _context.abrupt('return');

                    case 4:
                      if (!(expression instanceof Array && expression.every(function (e) {
                        return e instanceof Array;
                      }))) {
                        _context.next = 9;
                        break;
                      }

                      _context.next = 7;
                      return evaluateEachExpression(expression, environment);

                    case 7:
                      ret = _context.sent;
                      return _context.abrupt('return', ret);

                    case 9:
                      if (!(expression[0] === C.VARIABLE_IDENTIFIER && expression[1] === 'environment')) {
                        _context.next = 13;
                        break;
                      }

                      return _context.abrupt('return', environment);

                    case 13:
                      if (!(expression[0] === C.FUNCTION_CALL)) {
                        _context.next = 30;
                        break;
                      }

                      // Call a function: "function(arg1, arg2, arg3...)"

                      // Get the function and argument expressions from the expression list.
                      fnExpression = expression[1];
                      argExpressions = expression[2];

                      // Evaluate the function expression to get the actual function.

                      _context.next = 18;
                      return evaluateExpression(fnExpression, environment);

                    case 18:
                      fn = _context.sent;
                      varName = fnExpression[1];

                      if (fn instanceof lib.LFunction) {
                        _context.next = 22;
                        break;
                      }

                      throw new Error(chalk.cyan(varName) + ' is not a function');

                    case 22:

                      fn.argumentScope = environment;
                      args = argExpressions;
                      takingArgs = fn.paramaterList || [];

                      // We need to discuss this... what's fn.builtin? This also should make sure
                      // that the called function is not a JS function, because you can't really
                      // get the number of paramaters from JS functions.
                      // if (args.length !== takingArgs.length && !fn.builtin) {
                      //   throw new Error(`Function ${chalk.cyan(varName)} expects ${chalk.bold(takingArgs.length)} arguments, was called with ${chalk.bold(args.length)}`)
                      // }

                      // Use lib.call to call the function with the evaluated arguments.

                      _context.next = 27;
                      return lib.call(fn, args);

                    case 27:
                      return _context.abrupt('return', _context.sent);

                    case 30:
                      if (!(expression[0] === C.VARIABLE_IDENTIFIER)) {
                        _context.next = 40;
                        break;
                      }

                      // Get a variable: "name"

                      // Get the name from the expression list.
                      name = expression[1];

                      // Return the variable's value, or, if the variable doesn't exist, throw an
                      // error.

                      if (!environment.vars.hasOwnProperty(name)) {
                        _context.next = 37;
                        break;
                      }

                      _ret = environment.vars[name].value;
                      return _context.abrupt('return', _ret);

                    case 37:
                      throw new Error(chalk.cyan(name) + ' is not defined in ' + (0, _keys2.default)(environment.vars));

                    case 38:
                      _context.next = 124;
                      break;

                    case 40:
                      if (!(expression[0] === C.VARIABLE_ASSIGN)) {
                        _context.next = 50;
                        break;
                      }

                      // Set a variable to a value: "name => value"

                      // Get the name and value expression from the expression list.
                      _name = expression[1];
                      valueExpression = expression[2];

                      // console.log(`Setting variable ${name}...`)

                      // Evaluate the value of the variable.

                      _context.next = 45;
                      return evaluateExpression(valueExpression, environment);

                    case 45:
                      value = _context.sent;


                      // console.log(`..value is ${value}`)

                      // Set the variable in the variables object to a new variable with the
                      // evaluated value.
                      environment.vars[_name] = new lib.Variable(value);
                      return _context.abrupt('return');

                    case 50:
                      if (!(expression[0] === C.VARIABLE_CHANGE)) {
                        _context.next = 60;
                        break;
                      }

                      // Change a variable to a new value: "name -> newValue"

                      // Get the name and value expression from the expression list.
                      _name2 = expression[1];
                      _valueExpression = expression[2];

                      // Evaluate the new value of the variable.

                      _context.next = 55;
                      return evaluateExpression(_valueExpression, environment);

                    case 55:
                      _value = _context.sent;


                      // Change the value of the already defined variable.
                      environment.vars[_name2].value = _value;
                      return _context.abrupt('return');

                    case 60:
                      if (!(expression[0] === C.FUNCTION_PRIM)) {
                        _context.next = 74;
                        break;
                      }

                      // A function literal: "[async] [(arg1, arg2, arg3...)] { code }"

                      // Get the code and paramaters from the expression list.
                      paramaters = expression[1];
                      code = expression[2];
                      isAsync = expression[3];

                      // Create the function using the given code.

                      _fn = new lib.LFunction(code);

                      // Set the scope variables for the function to a copy of the current
                      // variables.

                      _fn.environment = new lib.LEnvironment();
                      _fn.environment.parentEnvironment = environment;
                      _fn.environment.comment = 'Function environment';
                      _fn.environment.addVars(environment.vars);

                      // Set the paramaters for the function to the paramaters taken from the
                      // expression list.
                      _fn.setParamaters(paramaters);

                      _fn.isAsynchronous = isAsync;

                      // Return the function.
                      return _context.abrupt('return', _fn);

                    case 74:
                      if (!(expression[0] === C.SHORTHAND_FUNCTION_PRIM)) {
                        _context.next = 84;
                        break;
                      }

                      // >> OUTDATED CODE <<
                      _paramaters = expression[1];
                      codeExpression = expression[2];
                      _fn2 = new lib.LFunction(codeExpression);

                      _fn2.isShorthand = true;
                      _fn2.setScopeVariables((0, _assign2.default)({}, environment));
                      _fn2.setParamaters(_paramaters);
                      return _context.abrupt('return', _fn2);

                    case 84:
                      if (!(expression[0] === C.STRING_PRIM)) {
                        _context.next = 89;
                        break;
                      }

                      // String literal: "contents"

                      // Get string from expression list.
                      string = expression[1];

                      // Convert string to a language-usable string, and return.

                      return _context.abrupt('return', lib.toLString(string));

                    case 89:
                      if (!(expression[0] === C.BOOLEAN_PRIM)) {
                        _context.next = 94;
                        break;
                      }

                      // Boolean literal: true/false

                      // Get boolean value from expression list.
                      bool = expression[1];

                      // Convert boolean value to a language-usable boolean, and return.

                      return _context.abrupt('return', lib.toLBoolean(bool));

                    case 94:
                      if (!(expression[0] === C.NUMBER_PRIM)) {
                        _context.next = 99;
                        break;
                      }

                      // Number primitive: 1, 2, 3, 4, 7.25, -3, etc.

                      // Get number value from expression list.
                      number = expression[1];

                      // Convert number value to a language-usable number, and return.

                      return _context.abrupt('return', lib.toLNumber(number));

                    case 99:
                      if (!(expression[0] === C.SET_PROP_USING_IDENTIFIER)) {
                        _context.next = 113;
                        break;
                      }

                      // Set a property of an object using an identifier literal:
                      // "obj.key > value"

                      // Get object expression, key, and value expression from expression list.
                      objExpression = expression[1];
                      key = expression[2];
                      _valueExpression2 = expression[3];

                      // Evaluate the object and value expressions.

                      _context.next = 105;
                      return evaluateExpression(objExpression, environment);

                    case 105:
                      obj = _context.sent;
                      _context.next = 108;
                      return evaluateExpression(_valueExpression2, environment);

                    case 108:
                      _value2 = _context.sent;


                      // Use lib.set to set the property of the evaluated object.
                      lib.set(obj, key, _value2);

                      return _context.abrupt('return');

                    case 113:
                      if (!(expression[0] === C.GET_PROP_USING_IDENTIFIER)) {
                        _context.next = 123;
                        break;
                      }

                      // Get a property of an object using an identifier literal: "obj.key"

                      // Get object expression and key from the expression list.
                      _objExpression = expression[1];
                      _key = expression[2];

                      // Evaluate the object expression.

                      _context.next = 118;
                      return evaluateExpression(_objExpression, environment);

                    case 118:
                      _obj = _context.sent;


                      // Get the value from lib.get.
                      _value3 = lib.get(_obj, _key);

                      // Return the gotten value.

                      return _context.abrupt('return', _value3);

                    case 123:
                      throw new Error('Invalid expression: ' + chalk.cyan(expression[0]));

                    case 124:
                    case 'end':
                      return _context.stop();
                  }
                }
              }, _callee, this);
            }))();

          case 2:
            returnVal = _context2.sent;
            return _context2.abrupt('return', returnVal);

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return function evaluateExpression(_x, _x2) {
    return ref.apply(this, arguments);
  };
}();

var evaluateGetPropUsingIdentifier = exports.evaluateGetPropUsingIdentifier = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(variables, _ref) {
    var _ref2 = (0, _slicedToArray3.default)(_ref, 3);

    var _ = _ref2[0];
    var objExpr = _ref2[1];
    var key = _ref2[2];
    var obj;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return evaluateExpression(objExpr, variables);

          case 2:
            obj = _context3.sent;
            return _context3.abrupt('return', lib.get(obj, key));

          case 4:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));
  return function evaluateGetPropUsingIdentifier(_x3, _x4) {
    return ref.apply(this, arguments);
  };
}();

var evaluateEachExpression = exports.evaluateEachExpression = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(expressions, environment) {
    var checkBreak, results, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, expression;

    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            checkBreak = function checkBreak() {
              var breakEnv = environment.breakToEnvironment;
              if (breakEnv !== null) {
                if (breakEnv !== environment.parentEnvironment) {
                  environment.parentEnvironment.breakToEnvironment = breakEnv;
                }
                return true;
              }
              return false;
            };

            if (!checkBreak()) {
              _context4.next = 3;
              break;
            }

            return _context4.abrupt('return', []);

          case 3:
            results = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context4.prev = 7;
            _iterator = (0, _getIterator3.default)(expressions);

          case 9:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context4.next = 21;
              break;
            }

            expression = _step.value;
            _context4.t0 = results;
            _context4.next = 14;
            return evaluateExpression(expression, environment);

          case 14:
            _context4.t1 = _context4.sent;

            _context4.t0.push.call(_context4.t0, _context4.t1);

            if (!checkBreak()) {
              _context4.next = 18;
              break;
            }

            return _context4.abrupt('break', 21);

          case 18:
            _iteratorNormalCompletion = true;
            _context4.next = 9;
            break;

          case 21:
            _context4.next = 27;
            break;

          case 23:
            _context4.prev = 23;
            _context4.t2 = _context4['catch'](7);
            _didIteratorError = true;
            _iteratorError = _context4.t2;

          case 27:
            _context4.prev = 27;
            _context4.prev = 28;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 30:
            _context4.prev = 30;

            if (!_didIteratorError) {
              _context4.next = 33;
              break;
            }

            throw _iteratorError;

          case 33:
            return _context4.finish(30);

          case 34:
            return _context4.finish(27);

          case 35:
            return _context4.abrupt('return', results);

          case 36:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[7, 23, 27, 35], [28,, 30, 34]]);
  }));
  return function evaluateEachExpression(_x5, _x6) {
    return ref.apply(this, arguments);
  };
}();

var interp = exports.interp = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(ast, dir) {
    var environment, result;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (!ast) {
              _context5.next = 10;
              break;
            }

            environment = new lib.LEnvironment();


            environment.comment = 'Master environment';

            environment.addVars(builtins.makeBuiltins(dir));

            _context5.next = 6;
            return evaluateEachExpression(ast, environment);

          case 6:
            result = _context5.sent;
            return _context5.abrupt('return', { result: result, environment: environment });

          case 10:
            throw new Error('Haha, you didn\'t pass me a tree!');

          case 11:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
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

if (!console.group) {
  try {
    require('console-group').install();
  } catch (err) {
    console.group = function (msg) {
      console.log(chalk.cyan('Group: ' + msg));
    };
    console.groupEnd = function () {
      console.log(chalk.cyan('Group end'));
    };
  }
}
//# sourceMappingURL=interp.js.map
