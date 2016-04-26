'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.evaluateExpression = evaluateExpression;
exports.evaluateGetPropUsingIdentifier = evaluateGetPropUsingIdentifier;
exports.evaluateEachExpression = evaluateEachExpression;
exports.interp = interp;
var C = require('./constants');
var lib = require('./lib');
var chalk = require('chalk');
var builtins = require('./builtins');

function evaluateExpression(expression, variables) {
  if (expression[0] === C.COMMENT) {
    return;
  } else if (expression instanceof Array && expression.every(function (e) {
    return e instanceof Array;
  })) {
    return evaluateEachExpression(variables, expression);
  }if (expression[0] === C.VARIABLE_IDENTIFIER && expression[1] === 'environment') {
    return new lib.LEnvironment(variables);
  } else if (expression[0] === C.FUNCTION_CALL) {
    // Call a function: "function(arg1, arg2, arg3...)"

    // Get the function and argument expressions from the expression list.
    var fnExpression = expression[1];
    var argExpressions = expression[2];

    // Evaluate the function expression to get the actual function.
    var fn = evaluateExpression(fnExpression, variables);

    if (!(fn instanceof lib.LFunction)) {
      throw new Error('Can\'t call ' + chalk.cyan(fn) + ' because it\'s not a function');
    }

    /* This code *used* to work but it doesn't any more, because some
     * parameters of the function could be unevaluated. Now argument evaluation
     * is done from within the call method of the function.
     */
    // Evaluate all of the arguments passed to the function.
    //const args = argExpressions.map(arg => evaluateExpression(arg, variables));
    fn.argumentScope = variables;
    var args = argExpressions;

    // Use lib.call to call the function with the evaluated arguments.
    return lib.call(fn, args);
  } else if (expression[0] === C.VARIABLE_IDENTIFIER) {
    // Get a variable: "name"

    // Get the name from the expression list.
    var name = expression[1];

    // Return the variable's value, or, if the variable doesn't exist, throw an
    // error.
    if (name in variables) {
      return variables[name].value;
    } else {
      // FIXME: Change this message not to include *all* the variables within
      // the scope; maybe just say "variable (name) not found"?
      throw 'variable ' + name + ' not in [' + Object.keys(variables) + ']';
    }
  } else if (expression[0] === C.VARIABLE_ASSIGN) {
    // Set a variable to a value: "name => value"

    // Get the name and value expression from the expression list.
    var _name = expression[1];
    var valueExpression = expression[2];

    // Evaluate the value of the variable.
    var value = evaluateExpression(valueExpression, variables);

    // Set the variable in the variables object to a new variable with the
    // evaluated value.
    variables[_name] = new lib.Variable(value);
    return;
  } else if (expression[0] === C.VARIABLE_CHANGE) {
    // Change a variable to a new value: "name -> newValue"

    // Get the name and value expression from the expression list.
    var _name2 = expression[1];
    var _valueExpression = expression[2];

    // Evaluate the new value of the variable.
    var _value = evaluateExpression(_valueExpression, variables);

    // Change the value of the already defined variable.
    variables[_name2].value = _value;
    return;
  } else if (expression[0] === C.FUNCTION_PRIM) {
    // A function literal: "fn(arg1, arg2, arg3...) { code }"

    // Get the code and paramaters from the expression list.
    var paramaters = expression[1];
    var code = expression[2];

    // Create the function using the given code.
    var _fn = new lib.LFunction(code);

    // Set the scope variables for the function to a copy of the current
    // variables.
    _fn.setScopeVariables(Object.assign({}, variables));

    // Set the paramaters for the function to the paramaters taken from the
    // expression list.
    _fn.setParamaters(paramaters);

    // Return the function.
    return _fn;
  } else if (expression[0] === C.SHORTHAND_FUNCTION_PRIM) {
    var _paramaters = expression[1];
    var codeExpression = expression[2];
    var _fn2 = new lib.LFunction(codeExpression);
    _fn2.isShorthand = true;
    _fn2.setScopeVariables(Object.assign({}, variables));
    _fn2.setParamaters(_paramaters);
    return _fn2;
  } else if (expression[0] === C.STRING_PRIM) {
    // String literal: "contents"

    // Get string from expression list.
    var string = expression[1];

    // Convert string to a language-usable string, and return.
    return lib.toLString(string);
  } else if (expression[0] === C.BOOLEAN_PRIM) {
    // Boolean literal: true/false

    // Get boolean value from expression list.
    var bool = expression[1];

    // Convert boolean value to a language-usable boolean, and return.
    return lib.toLBoolean(bool);
  } else if (expression[0] === C.NUMBER_PRIM) {
    // Number primitive: 1, 2, 3, 4, 7.25, -3, etc.

    // Get number value from expression list.
    var number = expression[1];

    // Convert number value to a language-usable number, and return.
    return lib.toLNumber(number);
  } else if (expression[0] === C.SET_PROP_USING_IDENTIFIER) {
    // Set a property of an object using an identifier literal:
    // "obj.key > value"

    // Get object expression, key, and value expression from expression list.
    var objExpression = expression[1];
    var key = expression[2];
    var _valueExpression2 = expression[3];

    // Evaluate the object and value expressions.
    var obj = evaluateExpression(objExpression, variables);
    var _value2 = evaluateExpression(_valueExpression2, variables);

    // Use lib.set to set the property of the evaluated object.
    lib.set(obj, key, _value2);
    return;
  } else if (expression[0] === C.GET_PROP_USING_IDENTIFIER) {
    // Get a property of an object using an identifier literal: "obj.key"

    // Get object expression and key from the expression list.
    var _objExpression = expression[1];
    var _key = expression[2];

    // Evaluate the object expression.
    var _obj = evaluateExpression(_objExpression, variables);

    // Get the value from lib.get.
    var _value3 = lib.get(_obj, _key);

    // Return the gotten value.
    return _value3;
  } else {
    throw new Error('Invalid expression type: ' + expression[0]);
  }
}

function evaluateGetPropUsingIdentifier(variables, _ref) {
  var _ref2 = _slicedToArray(_ref, 3);

  var _ = _ref2[0];
  var objExpr = _ref2[1];
  var key = _ref2[2];

  var obj = evaluateExpression(objExpr, variables);
  return lib.get(obj, key);
}

function evaluateEachExpression(variables, expressions) {
  return expressions.map(function (e) {
    return evaluateExpression(e, variables);
  });
}

function interp(ast, dir) {
  if (ast) {
    var variables = {};

    Object.assign(variables, builtins.makeBuiltins(dir));

    var result = evaluateEachExpression(variables, ast);

    return { result: result, variables: variables };
  } else {
    console.error('Haha, you didn\'t pass me a tree!');
  }
}
//# sourceMappingURL=data:application/json;base64,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V0FBM0MsRUFBd0Q7QUFDN0QsU0FBTyxZQUFZLEdBQVosQ0FBZ0I7V0FBSyxtQkFBbUIsQ0FBbkIsRUFBc0IsU0FBdEI7R0FBTCxDQUF2QixDQUQ2RDtDQUF4RDs7QUFJQSxTQUFTLE1BQVQsQ0FBZ0IsR0FBaEIsRUFBcUIsR0FBckIsRUFBMEI7QUFDL0IsTUFBSSxHQUFKLEVBQVM7QUFDUCxRQUFJLFlBQVksRUFBWixDQURHOztBQUdQLFdBQU8sTUFBUCxDQUFjLFNBQWQsRUFBeUIsU0FBUyxZQUFULENBQXNCLEdBQXRCLENBQXpCLEVBSE87O0FBS1AsUUFBSSxTQUFTLHVCQUF1QixTQUF2QixFQUFrQyxHQUFsQyxDQUFULENBTEc7O0FBT1AsV0FBTyxFQUFFLGNBQUYsRUFBVSxvQkFBVixFQUFQLENBUE87R0FBVCxNQVFPO0FBQ0wsWUFBUSxLQUFSLENBQWMsbUNBQWQsRUFESztHQVJQO0NBREsiLCJmaWxlIjoiaW50ZXJwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgQyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJylcbmNvbnN0IGxpYiA9IHJlcXVpcmUoJy4vbGliJylcbmNvbnN0IGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuY29uc3QgYnVpbHRpbnMgPSByZXF1aXJlKCcuL2J1aWx0aW5zJylcblxuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlRXhwcmVzc2lvbihleHByZXNzaW9uLCB2YXJpYWJsZXMpIHtcbiAgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuQ09NTUVOVCkge1xuICAgIHJldHVyblxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb24gaW5zdGFuY2VvZiBBcnJheSAmJlxuICAgICAgICAgICAgIGV4cHJlc3Npb24uZXZlcnkoZSA9PiBlIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgcmV0dXJuIGV2YWx1YXRlRWFjaEV4cHJlc3Npb24odmFyaWFibGVzLCBleHByZXNzaW9uKVxuICB9IGlmIChleHByZXNzaW9uWzBdID09PSBDLlZBUklBQkxFX0lERU5USUZJRVIgJiYgZXhwcmVzc2lvblsxXSA9PT0gJ2Vudmlyb25tZW50Jykge1xuICAgIHJldHVybiBuZXcgbGliLkxFbnZpcm9ubWVudCh2YXJpYWJsZXMpXG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5GVU5DVElPTl9DQUxMKSB7XG4gICAgLy8gQ2FsbCBhIGZ1bmN0aW9uOiBcImZ1bmN0aW9uKGFyZzEsIGFyZzIsIGFyZzMuLi4pXCJcblxuICAgIC8vIEdldCB0aGUgZnVuY3Rpb24gYW5kIGFyZ3VtZW50IGV4cHJlc3Npb25zIGZyb20gdGhlIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBmbkV4cHJlc3Npb24gPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3QgYXJnRXhwcmVzc2lvbnMgPSBleHByZXNzaW9uWzJdXG5cbiAgICAvLyBFdmFsdWF0ZSB0aGUgZnVuY3Rpb24gZXhwcmVzc2lvbiB0byBnZXQgdGhlIGFjdHVhbCBmdW5jdGlvbi5cbiAgICBjb25zdCBmbiA9IGV2YWx1YXRlRXhwcmVzc2lvbihmbkV4cHJlc3Npb24sIHZhcmlhYmxlcylcblxuICAgIGlmICghKGZuIGluc3RhbmNlb2YgbGliLkxGdW5jdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgY2FsbCAke2NoYWxrLmN5YW4oZm4pfSBiZWNhdXNlIGl0J3Mgbm90IGEgZnVuY3Rpb25gKVxuICAgIH1cblxuICAgIC8qIFRoaXMgY29kZSAqdXNlZCogdG8gd29yayBidXQgaXQgZG9lc24ndCBhbnkgbW9yZSwgYmVjYXVzZSBzb21lXG4gICAgICogcGFyYW1ldGVycyBvZiB0aGUgZnVuY3Rpb24gY291bGQgYmUgdW5ldmFsdWF0ZWQuIE5vdyBhcmd1bWVudCBldmFsdWF0aW9uXG4gICAgICogaXMgZG9uZSBmcm9tIHdpdGhpbiB0aGUgY2FsbCBtZXRob2Qgb2YgdGhlIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIC8vIEV2YWx1YXRlIGFsbCBvZiB0aGUgYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgZnVuY3Rpb24uXG4gICAgLy9jb25zdCBhcmdzID0gYXJnRXhwcmVzc2lvbnMubWFwKGFyZyA9PiBldmFsdWF0ZUV4cHJlc3Npb24oYXJnLCB2YXJpYWJsZXMpKTtcbiAgICBmbi5hcmd1bWVudFNjb3BlID0gdmFyaWFibGVzXG4gICAgY29uc3QgYXJncyA9IGFyZ0V4cHJlc3Npb25zXG5cbiAgICAvLyBVc2UgbGliLmNhbGwgdG8gY2FsbCB0aGUgZnVuY3Rpb24gd2l0aCB0aGUgZXZhbHVhdGVkIGFyZ3VtZW50cy5cbiAgICByZXR1cm4gbGliLmNhbGwoZm4sIGFyZ3MpXG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5WQVJJQUJMRV9JREVOVElGSUVSKSB7XG4gICAgLy8gR2V0IGEgdmFyaWFibGU6IFwibmFtZVwiXG5cbiAgICAvLyBHZXQgdGhlIG5hbWUgZnJvbSB0aGUgZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IG5hbWUgPSBleHByZXNzaW9uWzFdXG5cbiAgICAvLyBSZXR1cm4gdGhlIHZhcmlhYmxlJ3MgdmFsdWUsIG9yLCBpZiB0aGUgdmFyaWFibGUgZG9lc24ndCBleGlzdCwgdGhyb3cgYW5cbiAgICAvLyBlcnJvci5cbiAgICBpZiAobmFtZSBpbiB2YXJpYWJsZXMpIHtcbiAgICAgIHJldHVybiB2YXJpYWJsZXNbbmFtZV0udmFsdWVcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRklYTUU6IENoYW5nZSB0aGlzIG1lc3NhZ2Ugbm90IHRvIGluY2x1ZGUgKmFsbCogdGhlIHZhcmlhYmxlcyB3aXRoaW5cbiAgICAgIC8vIHRoZSBzY29wZTsgbWF5YmUganVzdCBzYXkgXCJ2YXJpYWJsZSAobmFtZSkgbm90IGZvdW5kXCI/XG4gICAgICB0aHJvdyBgdmFyaWFibGUgJHtuYW1lfSBub3QgaW4gWyR7T2JqZWN0LmtleXModmFyaWFibGVzKX1dYFxuICAgIH1cbiAgfSBlbHNlIGlmIChleHByZXNzaW9uWzBdID09PSBDLlZBUklBQkxFX0FTU0lHTikge1xuICAgIC8vIFNldCBhIHZhcmlhYmxlIHRvIGEgdmFsdWU6IFwibmFtZSA9PiB2YWx1ZVwiXG5cbiAgICAvLyBHZXQgdGhlIG5hbWUgYW5kIHZhbHVlIGV4cHJlc3Npb24gZnJvbSB0aGUgZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IG5hbWUgPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3QgdmFsdWVFeHByZXNzaW9uID0gZXhwcmVzc2lvblsyXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICBjb25zdCB2YWx1ZSA9IGV2YWx1YXRlRXhwcmVzc2lvbih2YWx1ZUV4cHJlc3Npb24sIHZhcmlhYmxlcylcblxuICAgIC8vIFNldCB0aGUgdmFyaWFibGUgaW4gdGhlIHZhcmlhYmxlcyBvYmplY3QgdG8gYSBuZXcgdmFyaWFibGUgd2l0aCB0aGVcbiAgICAvLyBldmFsdWF0ZWQgdmFsdWUuXG4gICAgdmFyaWFibGVzW25hbWVdID0gbmV3IGxpYi5WYXJpYWJsZSh2YWx1ZSlcbiAgICByZXR1cm5cbiAgfSBlbHNlIGlmIChleHByZXNzaW9uWzBdID09PSBDLlZBUklBQkxFX0NIQU5HRSkge1xuICAgIC8vIENoYW5nZSBhIHZhcmlhYmxlIHRvIGEgbmV3IHZhbHVlOiBcIm5hbWUgLT4gbmV3VmFsdWVcIlxuXG4gICAgLy8gR2V0IHRoZSBuYW1lIGFuZCB2YWx1ZSBleHByZXNzaW9uIGZyb20gdGhlIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBuYW1lID0gZXhwcmVzc2lvblsxXVxuICAgIGNvbnN0IHZhbHVlRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25bMl1cblxuICAgIC8vIEV2YWx1YXRlIHRoZSBuZXcgdmFsdWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgIGNvbnN0IHZhbHVlID0gZXZhbHVhdGVFeHByZXNzaW9uKHZhbHVlRXhwcmVzc2lvbiwgdmFyaWFibGVzKVxuXG4gICAgLy8gQ2hhbmdlIHRoZSB2YWx1ZSBvZiB0aGUgYWxyZWFkeSBkZWZpbmVkIHZhcmlhYmxlLlxuICAgIHZhcmlhYmxlc1tuYW1lXS52YWx1ZSA9IHZhbHVlXG4gICAgcmV0dXJuXG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5GVU5DVElPTl9QUklNKSB7XG4gICAgLy8gQSBmdW5jdGlvbiBsaXRlcmFsOiBcImZuKGFyZzEsIGFyZzIsIGFyZzMuLi4pIHsgY29kZSB9XCJcblxuICAgIC8vIEdldCB0aGUgY29kZSBhbmQgcGFyYW1hdGVycyBmcm9tIHRoZSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3QgcGFyYW1hdGVycyA9IGV4cHJlc3Npb25bMV1cbiAgICBjb25zdCBjb2RlID0gZXhwcmVzc2lvblsyXVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBmdW5jdGlvbiB1c2luZyB0aGUgZ2l2ZW4gY29kZS5cbiAgICBjb25zdCBmbiA9IG5ldyBsaWIuTEZ1bmN0aW9uKGNvZGUpXG5cbiAgICAvLyBTZXQgdGhlIHNjb3BlIHZhcmlhYmxlcyBmb3IgdGhlIGZ1bmN0aW9uIHRvIGEgY29weSBvZiB0aGUgY3VycmVudFxuICAgIC8vIHZhcmlhYmxlcy5cbiAgICBmbi5zZXRTY29wZVZhcmlhYmxlcyhPYmplY3QuYXNzaWduKHt9LCB2YXJpYWJsZXMpKVxuXG4gICAgLy8gU2V0IHRoZSBwYXJhbWF0ZXJzIGZvciB0aGUgZnVuY3Rpb24gdG8gdGhlIHBhcmFtYXRlcnMgdGFrZW4gZnJvbSB0aGVcbiAgICAvLyBleHByZXNzaW9uIGxpc3QuXG4gICAgZm4uc2V0UGFyYW1hdGVycyhwYXJhbWF0ZXJzKVxuXG4gICAgLy8gUmV0dXJuIHRoZSBmdW5jdGlvbi5cbiAgICByZXR1cm4gZm5cbiAgfSBlbHNlIGlmIChleHByZXNzaW9uWzBdID09PSBDLlNIT1JUSEFORF9GVU5DVElPTl9QUklNKSB7XG4gICAgY29uc3QgcGFyYW1hdGVycyA9IGV4cHJlc3Npb25bMV1cbiAgICBjb25zdCBjb2RlRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25bMl1cbiAgICBjb25zdCBmbiA9IG5ldyBsaWIuTEZ1bmN0aW9uKGNvZGVFeHByZXNzaW9uKVxuICAgIGZuLmlzU2hvcnRoYW5kID0gdHJ1ZVxuICAgIGZuLnNldFNjb3BlVmFyaWFibGVzKE9iamVjdC5hc3NpZ24oe30sIHZhcmlhYmxlcykpXG4gICAgZm4uc2V0UGFyYW1hdGVycyhwYXJhbWF0ZXJzKVxuICAgIHJldHVybiBmblxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuU1RSSU5HX1BSSU0pIHtcbiAgICAvLyBTdHJpbmcgbGl0ZXJhbDogXCJjb250ZW50c1wiXG5cbiAgICAvLyBHZXQgc3RyaW5nIGZyb20gZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IHN0cmluZyA9IGV4cHJlc3Npb25bMV1cblxuICAgIC8vIENvbnZlcnQgc3RyaW5nIHRvIGEgbGFuZ3VhZ2UtdXNhYmxlIHN0cmluZywgYW5kIHJldHVybi5cbiAgICByZXR1cm4gbGliLnRvTFN0cmluZyhzdHJpbmcpXG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5CT09MRUFOX1BSSU0pIHtcbiAgICAvLyBCb29sZWFuIGxpdGVyYWw6IHRydWUvZmFsc2VcblxuICAgIC8vIEdldCBib29sZWFuIHZhbHVlIGZyb20gZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IGJvb2wgPSBleHByZXNzaW9uWzFdXG5cbiAgICAvLyBDb252ZXJ0IGJvb2xlYW4gdmFsdWUgdG8gYSBsYW5ndWFnZS11c2FibGUgYm9vbGVhbiwgYW5kIHJldHVybi5cbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4oYm9vbClcbiAgfSBlbHNlIGlmIChleHByZXNzaW9uWzBdID09PSBDLk5VTUJFUl9QUklNKSB7XG4gICAgLy8gTnVtYmVyIHByaW1pdGl2ZTogMSwgMiwgMywgNCwgNy4yNSwgLTMsIGV0Yy5cblxuICAgIC8vIEdldCBudW1iZXIgdmFsdWUgZnJvbSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3QgbnVtYmVyID0gZXhwcmVzc2lvblsxXVxuXG4gICAgLy8gQ29udmVydCBudW1iZXIgdmFsdWUgdG8gYSBsYW5ndWFnZS11c2FibGUgbnVtYmVyLCBhbmQgcmV0dXJuLlxuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKG51bWJlcilcbiAgfSBlbHNlIGlmIChleHByZXNzaW9uWzBdID09PSBDLlNFVF9QUk9QX1VTSU5HX0lERU5USUZJRVIpIHtcbiAgICAvLyBTZXQgYSBwcm9wZXJ0eSBvZiBhbiBvYmplY3QgdXNpbmcgYW4gaWRlbnRpZmllciBsaXRlcmFsOlxuICAgIC8vIFwib2JqLmtleSA+IHZhbHVlXCJcblxuICAgIC8vIEdldCBvYmplY3QgZXhwcmVzc2lvbiwga2V5LCBhbmQgdmFsdWUgZXhwcmVzc2lvbiBmcm9tIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBvYmpFeHByZXNzaW9uID0gZXhwcmVzc2lvblsxXVxuICAgIGNvbnN0IGtleSA9IGV4cHJlc3Npb25bMl1cbiAgICBjb25zdCB2YWx1ZUV4cHJlc3Npb24gPSBleHByZXNzaW9uWzNdXG5cbiAgICAvLyBFdmFsdWF0ZSB0aGUgb2JqZWN0IGFuZCB2YWx1ZSBleHByZXNzaW9ucy5cbiAgICBjb25zdCBvYmogPSBldmFsdWF0ZUV4cHJlc3Npb24ob2JqRXhwcmVzc2lvbiwgdmFyaWFibGVzKVxuICAgIGNvbnN0IHZhbHVlID0gZXZhbHVhdGVFeHByZXNzaW9uKHZhbHVlRXhwcmVzc2lvbiwgdmFyaWFibGVzKVxuXG4gICAgLy8gVXNlIGxpYi5zZXQgdG8gc2V0IHRoZSBwcm9wZXJ0eSBvZiB0aGUgZXZhbHVhdGVkIG9iamVjdC5cbiAgICBsaWIuc2V0KG9iaiwga2V5LCB2YWx1ZSlcbiAgICByZXR1cm5cbiAgfSBlbHNlIGlmIChleHByZXNzaW9uWzBdID09PSBDLkdFVF9QUk9QX1VTSU5HX0lERU5USUZJRVIpIHtcbiAgICAvLyBHZXQgYSBwcm9wZXJ0eSBvZiBhbiBvYmplY3QgdXNpbmcgYW4gaWRlbnRpZmllciBsaXRlcmFsOiBcIm9iai5rZXlcIlxuXG4gICAgLy8gR2V0IG9iamVjdCBleHByZXNzaW9uIGFuZCBrZXkgZnJvbSB0aGUgZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IG9iakV4cHJlc3Npb24gPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3Qga2V5ID0gZXhwcmVzc2lvblsyXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIG9iamVjdCBleHByZXNzaW9uLlxuICAgIGNvbnN0IG9iaiA9IGV2YWx1YXRlRXhwcmVzc2lvbihvYmpFeHByZXNzaW9uLCB2YXJpYWJsZXMpXG5cbiAgICAvLyBHZXQgdGhlIHZhbHVlIGZyb20gbGliLmdldC5cbiAgICBjb25zdCB2YWx1ZSA9IGxpYi5nZXQob2JqLCBrZXkpXG5cbiAgICAvLyBSZXR1cm4gdGhlIGdvdHRlbiB2YWx1ZS5cbiAgICByZXR1cm4gdmFsdWVcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZXhwcmVzc2lvbiB0eXBlOiAke2V4cHJlc3Npb25bMF19YClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXZhbHVhdGVHZXRQcm9wVXNpbmdJZGVudGlmaWVyKHZhcmlhYmxlcywgW18sIG9iakV4cHIsIGtleV0pIHtcbiAgbGV0IG9iaiA9IGV2YWx1YXRlRXhwcmVzc2lvbihvYmpFeHByLCB2YXJpYWJsZXMpXG4gIHJldHVybiBsaWIuZ2V0KG9iaiwga2V5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXZhbHVhdGVFYWNoRXhwcmVzc2lvbih2YXJpYWJsZXMsIGV4cHJlc3Npb25zKSB7XG4gIHJldHVybiBleHByZXNzaW9ucy5tYXAoZSA9PiBldmFsdWF0ZUV4cHJlc3Npb24oZSwgdmFyaWFibGVzKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludGVycChhc3QsIGRpcikge1xuICBpZiAoYXN0KSB7XG4gICAgbGV0IHZhcmlhYmxlcyA9IHt9XG5cbiAgICBPYmplY3QuYXNzaWduKHZhcmlhYmxlcywgYnVpbHRpbnMubWFrZUJ1aWx0aW5zKGRpcikpXG5cbiAgICBsZXQgcmVzdWx0ID0gZXZhbHVhdGVFYWNoRXhwcmVzc2lvbih2YXJpYWJsZXMsIGFzdClcblxuICAgIHJldHVybiB7IHJlc3VsdCwgdmFyaWFibGVzIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmVycm9yKCdIYWhhLCB5b3UgZGlkblxcJ3QgcGFzcyBtZSBhIHRyZWUhJylcbiAgfVxufVxuIl19