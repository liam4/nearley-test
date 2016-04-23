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
      throw new Error('Can\'t call ' + fn + ' because it\'s not a function');
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
    throw 'Invalid expression type: ' + expression[0];
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

function interp(ast) {
  if (ast) {
    var variables = {};

    Object.assign(variables, builtins.makeBuiltins());

    var result = evaluateEachExpression(variables, ast);

    return { result: result, variables: variables };
  } else {
    console.error('Haha, you didn\'t pass me a tree!');
  }
}
//# sourceMappingURL=data:application/json;base64,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LCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBDID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKVxuY29uc3QgbGliID0gcmVxdWlyZSgnLi9saWInKVxuY29uc3QgYnVpbHRpbnMgPSByZXF1aXJlKCcuL2J1aWx0aW5zJylcblxuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlRXhwcmVzc2lvbihleHByZXNzaW9uLCB2YXJpYWJsZXMpIHtcbiAgaWYoZXhwcmVzc2lvblswXSA9PT0gQy5DT01NRU5UKSB7XG4gICAgcmV0dXJuXG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvbiBpbnN0YW5jZW9mIEFycmF5ICYmXG4gICAgICAgICAgICAgZXhwcmVzc2lvbi5ldmVyeShlID0+IGUgaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICByZXR1cm4gZXZhbHVhdGVFYWNoRXhwcmVzc2lvbih2YXJpYWJsZXMsIGV4cHJlc3Npb24pXG4gIH0gaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuVkFSSUFCTEVfSURFTlRJRklFUiAmJiBleHByZXNzaW9uWzFdID09PSAnZW52aXJvbm1lbnQnKSB7XG4gICAgcmV0dXJuIG5ldyBsaWIuTEVudmlyb25tZW50KHZhcmlhYmxlcyk7XG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5GVU5DVElPTl9DQUxMKSB7XG4gICAgLy8gQ2FsbCBhIGZ1bmN0aW9uOiBcImZ1bmN0aW9uKGFyZzEsIGFyZzIsIGFyZzMuLi4pXCJcblxuICAgIC8vIEdldCB0aGUgZnVuY3Rpb24gYW5kIGFyZ3VtZW50IGV4cHJlc3Npb25zIGZyb20gdGhlIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBmbkV4cHJlc3Npb24gPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3QgYXJnRXhwcmVzc2lvbnMgPSBleHByZXNzaW9uWzJdXG5cbiAgICAvLyBFdmFsdWF0ZSB0aGUgZnVuY3Rpb24gZXhwcmVzc2lvbiB0byBnZXQgdGhlIGFjdHVhbCBmdW5jdGlvbi5cbiAgICBjb25zdCBmbiA9IGV2YWx1YXRlRXhwcmVzc2lvbihmbkV4cHJlc3Npb24sIHZhcmlhYmxlcylcblxuICAgIGlmICghKGZuIGluc3RhbmNlb2YgbGliLkxGdW5jdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuXFwndCBjYWxsICcgKyBmbiArICcgYmVjYXVzZSBpdFxcJ3Mgbm90IGEgZnVuY3Rpb24nKVxuICAgIH1cblxuICAgIC8qIFRoaXMgY29kZSAqdXNlZCogdG8gd29yayBidXQgaXQgZG9lc24ndCBhbnkgbW9yZSwgYmVjYXVzZSBzb21lXG4gICAgICogcGFyYW1ldGVycyBvZiB0aGUgZnVuY3Rpb24gY291bGQgYmUgdW5ldmFsdWF0ZWQuIE5vdyBhcmd1bWVudCBldmFsdWF0aW9uXG4gICAgICogaXMgZG9uZSBmcm9tIHdpdGhpbiB0aGUgY2FsbCBtZXRob2Qgb2YgdGhlIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIC8vIEV2YWx1YXRlIGFsbCBvZiB0aGUgYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgZnVuY3Rpb24uXG4gICAgLy9jb25zdCBhcmdzID0gYXJnRXhwcmVzc2lvbnMubWFwKGFyZyA9PiBldmFsdWF0ZUV4cHJlc3Npb24oYXJnLCB2YXJpYWJsZXMpKTtcbiAgICBmbi5hcmd1bWVudFNjb3BlID0gdmFyaWFibGVzXG4gICAgY29uc3QgYXJncyA9IGFyZ0V4cHJlc3Npb25zXG5cbiAgICAvLyBVc2UgbGliLmNhbGwgdG8gY2FsbCB0aGUgZnVuY3Rpb24gd2l0aCB0aGUgZXZhbHVhdGVkIGFyZ3VtZW50cy5cbiAgICByZXR1cm4gbGliLmNhbGwoZm4sIGFyZ3MpXG4gIH0gZWxzZSBpZihleHByZXNzaW9uWzBdID09PSBDLlZBUklBQkxFX0lERU5USUZJRVIpIHtcbiAgICAvLyBHZXQgYSB2YXJpYWJsZTogXCJuYW1lXCJcblxuICAgIC8vIEdldCB0aGUgbmFtZSBmcm9tIHRoZSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3QgbmFtZSA9IGV4cHJlc3Npb25bMV1cblxuICAgIC8vIFJldHVybiB0aGUgdmFyaWFibGUncyB2YWx1ZSwgb3IsIGlmIHRoZSB2YXJpYWJsZSBkb2Vzbid0IGV4aXN0LCB0aHJvdyBhblxuICAgIC8vIGVycm9yLlxuICAgIGlmIChuYW1lIGluIHZhcmlhYmxlcykge1xuICAgICAgcmV0dXJuIHZhcmlhYmxlc1tuYW1lXS52YWx1ZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBGSVhNRTogQ2hhbmdlIHRoaXMgbWVzc2FnZSBub3QgdG8gaW5jbHVkZSAqYWxsKiB0aGUgdmFyaWFibGVzIHdpdGhpblxuICAgICAgLy8gdGhlIHNjb3BlOyBtYXliZSBqdXN0IHNheSBcInZhcmlhYmxlIChuYW1lKSBub3QgZm91bmRcIj9cbiAgICAgIHRocm93IGB2YXJpYWJsZSAke25hbWV9IG5vdCBpbiBbJHtPYmplY3Qua2V5cyh2YXJpYWJsZXMpfV1gXG4gICAgfVxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuVkFSSUFCTEVfQVNTSUdOKSB7XG4gICAgLy8gU2V0IGEgdmFyaWFibGUgdG8gYSB2YWx1ZTogXCJuYW1lID0+IHZhbHVlXCJcblxuICAgIC8vIEdldCB0aGUgbmFtZSBhbmQgdmFsdWUgZXhwcmVzc2lvbiBmcm9tIHRoZSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3QgbmFtZSA9IGV4cHJlc3Npb25bMV1cbiAgICBjb25zdCB2YWx1ZUV4cHJlc3Npb24gPSBleHByZXNzaW9uWzJdXG5cbiAgICAvLyBFdmFsdWF0ZSB0aGUgdmFsdWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgIGNvbnN0IHZhbHVlID0gZXZhbHVhdGVFeHByZXNzaW9uKHZhbHVlRXhwcmVzc2lvbiwgdmFyaWFibGVzKVxuXG4gICAgLy8gU2V0IHRoZSB2YXJpYWJsZSBpbiB0aGUgdmFyaWFibGVzIG9iamVjdCB0byBhIG5ldyB2YXJpYWJsZSB3aXRoIHRoZVxuICAgIC8vIGV2YWx1YXRlZCB2YWx1ZS5cbiAgICB2YXJpYWJsZXNbbmFtZV0gPSBuZXcgbGliLlZhcmlhYmxlKHZhbHVlKVxuICAgIHJldHVyblxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuVkFSSUFCTEVfQ0hBTkdFKSB7XG4gICAgLy8gQ2hhbmdlIGEgdmFyaWFibGUgdG8gYSBuZXcgdmFsdWU6IFwibmFtZSAtPiBuZXdWYWx1ZVwiXG5cbiAgICAvLyBHZXQgdGhlIG5hbWUgYW5kIHZhbHVlIGV4cHJlc3Npb24gZnJvbSB0aGUgZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IG5hbWUgPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3QgdmFsdWVFeHByZXNzaW9uID0gZXhwcmVzc2lvblsyXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIG5ldyB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgY29uc3QgdmFsdWUgPSBldmFsdWF0ZUV4cHJlc3Npb24odmFsdWVFeHByZXNzaW9uLCB2YXJpYWJsZXMpXG5cbiAgICAvLyBDaGFuZ2UgdGhlIHZhbHVlIG9mIHRoZSBhbHJlYWR5IGRlZmluZWQgdmFyaWFibGUuXG4gICAgdmFyaWFibGVzW25hbWVdLnZhbHVlID0gdmFsdWVcbiAgICByZXR1cm5cbiAgfSBlbHNlIGlmKGV4cHJlc3Npb25bMF0gPT09IEMuRlVOQ1RJT05fUFJJTSkge1xuICAgIC8vIEEgZnVuY3Rpb24gbGl0ZXJhbDogXCJmbihhcmcxLCBhcmcyLCBhcmczLi4uKSB7IGNvZGUgfVwiXG5cbiAgICAvLyBHZXQgdGhlIGNvZGUgYW5kIHBhcmFtYXRlcnMgZnJvbSB0aGUgZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IHBhcmFtYXRlcnMgPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3QgY29kZSA9IGV4cHJlc3Npb25bMl1cblxuICAgIC8vIENyZWF0ZSB0aGUgZnVuY3Rpb24gdXNpbmcgdGhlIGdpdmVuIGNvZGUuXG4gICAgY29uc3QgZm4gPSBuZXcgbGliLkxGdW5jdGlvbihjb2RlKVxuXG4gICAgLy8gU2V0IHRoZSBzY29wZSB2YXJpYWJsZXMgZm9yIHRoZSBmdW5jdGlvbiB0byBhIGNvcHkgb2YgdGhlIGN1cnJlbnRcbiAgICAvLyB2YXJpYWJsZXMuXG4gICAgZm4uc2V0U2NvcGVWYXJpYWJsZXMoT2JqZWN0LmFzc2lnbih7fSwgdmFyaWFibGVzKSlcblxuICAgIC8vIFNldCB0aGUgcGFyYW1hdGVycyBmb3IgdGhlIGZ1bmN0aW9uIHRvIHRoZSBwYXJhbWF0ZXJzIHRha2VuIGZyb20gdGhlXG4gICAgLy8gZXhwcmVzc2lvbiBsaXN0LlxuICAgIGZuLnNldFBhcmFtYXRlcnMocGFyYW1hdGVycylcblxuICAgIC8vIFJldHVybiB0aGUgZnVuY3Rpb24uXG4gICAgcmV0dXJuIGZuXG4gIH0gZWxzZSBpZihleHByZXNzaW9uWzBdID09PSBDLlNUUklOR19QUklNKSB7XG4gICAgLy8gU3RyaW5nIGxpdGVyYWw6IFwiY29udGVudHNcIlxuXG4gICAgLy8gR2V0IHN0cmluZyBmcm9tIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBzdHJpbmcgPSBleHByZXNzaW9uWzFdXG5cbiAgICAvLyBDb252ZXJ0IHN0cmluZyB0byBhIGxhbmd1YWdlLXVzYWJsZSBzdHJpbmcsIGFuZCByZXR1cm4uXG4gICAgcmV0dXJuIGxpYi50b0xTdHJpbmcoc3RyaW5nKVxuICB9IGVsc2UgaWYoZXhwcmVzc2lvblswXSA9PT0gQy5CT09MRUFOX1BSSU0pIHtcbiAgICAvLyBCb29sZWFuIGxpdGVyYWw6IHRydWUvZmFsc2VcblxuICAgIC8vIEdldCBib29sZWFuIHZhbHVlIGZyb20gZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IGJvb2wgPSBleHByZXNzaW9uWzFdXG5cbiAgICAvLyBDb252ZXJ0IGJvb2xlYW4gdmFsdWUgdG8gYSBsYW5ndWFnZS11c2FibGUgYm9vbGVhbiwgYW5kIHJldHVybi5cbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4oYm9vbClcbiAgfSBlbHNlIGlmKGV4cHJlc3Npb25bMF0gPT09IEMuTlVNQkVSX1BSSU0pIHtcbiAgICAvLyBOdW1iZXIgcHJpbWl0aXZlOiAxLCAyLCAzLCA0LCA3LjI1LCAtMywgZXRjLlxuXG4gICAgLy8gR2V0IG51bWJlciB2YWx1ZSBmcm9tIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBudW1iZXIgPSBleHByZXNzaW9uWzFdXG5cbiAgICAvLyBDb252ZXJ0IG51bWJlciB2YWx1ZSB0byBhIGxhbmd1YWdlLXVzYWJsZSBudW1iZXIsIGFuZCByZXR1cm4uXG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobnVtYmVyKVxuICB9IGVsc2UgaWYoZXhwcmVzc2lvblswXSA9PT0gQy5TRVRfUFJPUF9VU0lOR19JREVOVElGSUVSKSB7XG4gICAgLy8gU2V0IGEgcHJvcGVydHkgb2YgYW4gb2JqZWN0IHVzaW5nIGFuIGlkZW50aWZpZXIgbGl0ZXJhbDpcbiAgICAvLyBcIm9iai5rZXkgPiB2YWx1ZVwiXG5cbiAgICAvLyBHZXQgb2JqZWN0IGV4cHJlc3Npb24sIGtleSwgYW5kIHZhbHVlIGV4cHJlc3Npb24gZnJvbSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3Qgb2JqRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25bMV1cbiAgICBjb25zdCBrZXkgPSBleHByZXNzaW9uWzJdXG4gICAgY29uc3QgdmFsdWVFeHByZXNzaW9uID0gZXhwcmVzc2lvblszXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIG9iamVjdCBhbmQgdmFsdWUgZXhwcmVzc2lvbnMuXG4gICAgY29uc3Qgb2JqID0gZXZhbHVhdGVFeHByZXNzaW9uKG9iakV4cHJlc3Npb24sIHZhcmlhYmxlcylcbiAgICBjb25zdCB2YWx1ZSA9IGV2YWx1YXRlRXhwcmVzc2lvbih2YWx1ZUV4cHJlc3Npb24sIHZhcmlhYmxlcylcblxuICAgIC8vIFVzZSBsaWIuc2V0IHRvIHNldCB0aGUgcHJvcGVydHkgb2YgdGhlIGV2YWx1YXRlZCBvYmplY3QuXG4gICAgbGliLnNldChvYmosIGtleSwgdmFsdWUpXG4gICAgcmV0dXJuXG4gIH0gZWxzZSBpZihleHByZXNzaW9uWzBdID09PSBDLkdFVF9QUk9QX1VTSU5HX0lERU5USUZJRVIpIHtcbiAgICAvLyBHZXQgYSBwcm9wZXJ0eSBvZiBhbiBvYmplY3QgdXNpbmcgYW4gaWRlbnRpZmllciBsaXRlcmFsOiBcIm9iai5rZXlcIlxuXG4gICAgLy8gR2V0IG9iamVjdCBleHByZXNzaW9uIGFuZCBrZXkgZnJvbSB0aGUgZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IG9iakV4cHJlc3Npb24gPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3Qga2V5ID0gZXhwcmVzc2lvblsyXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIG9iamVjdCBleHByZXNzaW9uLlxuICAgIGNvbnN0IG9iaiA9IGV2YWx1YXRlRXhwcmVzc2lvbihvYmpFeHByZXNzaW9uLCB2YXJpYWJsZXMpXG5cbiAgICAvLyBHZXQgdGhlIHZhbHVlIGZyb20gbGliLmdldC5cbiAgICBjb25zdCB2YWx1ZSA9IGxpYi5nZXQob2JqLCBrZXkpXG5cbiAgICAvLyBSZXR1cm4gdGhlIGdvdHRlbiB2YWx1ZS5cbiAgICByZXR1cm4gdmFsdWVcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBgSW52YWxpZCBleHByZXNzaW9uIHR5cGU6ICR7ZXhwcmVzc2lvblswXX1gXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlR2V0UHJvcFVzaW5nSWRlbnRpZmllcih2YXJpYWJsZXMsIFtfLCBvYmpFeHByLCBrZXldKSB7XG4gIGxldCBvYmogPSBldmFsdWF0ZUV4cHJlc3Npb24ob2JqRXhwciwgdmFyaWFibGVzKVxuICByZXR1cm4gbGliLmdldChvYmosIGtleSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlRWFjaEV4cHJlc3Npb24odmFyaWFibGVzLCBleHByZXNzaW9ucykge1xuICByZXR1cm4gZXhwcmVzc2lvbnMubWFwKGUgPT4gZXZhbHVhdGVFeHByZXNzaW9uKGUsIHZhcmlhYmxlcykpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnAoYXN0KSB7XG4gIGlmKGFzdCkge1xuICAgIGxldCB2YXJpYWJsZXMgPSB7fVxuXG4gICAgT2JqZWN0LmFzc2lnbih2YXJpYWJsZXMsIGJ1aWx0aW5zLm1ha2VCdWlsdGlucygpKVxuXG4gICAgbGV0IHJlc3VsdCA9IGV2YWx1YXRlRWFjaEV4cHJlc3Npb24odmFyaWFibGVzLCBhc3QpXG5cbiAgICByZXR1cm4geyByZXN1bHQsIHZhcmlhYmxlcyB9XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcignSGFoYSwgeW91IGRpZG5cXCd0IHBhc3MgbWUgYSB0cmVlIScpXG4gIH1cbn1cbiJdfQ==