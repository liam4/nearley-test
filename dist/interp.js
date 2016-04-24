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
//# sourceMappingURL=data:application/json;base64,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LFlBQVEsS0FBUixDQUFjLG1DQUFkLEVBREs7R0FSUDtDQURLIiwiZmlsZSI6ImludGVycC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IEMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpXG5jb25zdCBsaWIgPSByZXF1aXJlKCcuL2xpYicpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IGJ1aWx0aW5zID0gcmVxdWlyZSgnLi9idWlsdGlucycpXG5cbmV4cG9ydCBmdW5jdGlvbiBldmFsdWF0ZUV4cHJlc3Npb24oZXhwcmVzc2lvbiwgdmFyaWFibGVzKSB7XG4gIGlmIChleHByZXNzaW9uWzBdID09PSBDLkNPTU1FTlQpIHtcbiAgICByZXR1cm5cbiAgfSBlbHNlIGlmIChleHByZXNzaW9uIGluc3RhbmNlb2YgQXJyYXkgJiZcbiAgICAgICAgICAgICBleHByZXNzaW9uLmV2ZXJ5KGUgPT4gZSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIHJldHVybiBldmFsdWF0ZUVhY2hFeHByZXNzaW9uKHZhcmlhYmxlcywgZXhwcmVzc2lvbilcbiAgfSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5WQVJJQUJMRV9JREVOVElGSUVSICYmIGV4cHJlc3Npb25bMV0gPT09ICdlbnZpcm9ubWVudCcpIHtcbiAgICByZXR1cm4gbmV3IGxpYi5MRW52aXJvbm1lbnQodmFyaWFibGVzKVxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuRlVOQ1RJT05fQ0FMTCkge1xuICAgIC8vIENhbGwgYSBmdW5jdGlvbjogXCJmdW5jdGlvbihhcmcxLCBhcmcyLCBhcmczLi4uKVwiXG5cbiAgICAvLyBHZXQgdGhlIGZ1bmN0aW9uIGFuZCBhcmd1bWVudCBleHByZXNzaW9ucyBmcm9tIHRoZSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3QgZm5FeHByZXNzaW9uID0gZXhwcmVzc2lvblsxXVxuICAgIGNvbnN0IGFyZ0V4cHJlc3Npb25zID0gZXhwcmVzc2lvblsyXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIGZ1bmN0aW9uIGV4cHJlc3Npb24gdG8gZ2V0IHRoZSBhY3R1YWwgZnVuY3Rpb24uXG4gICAgY29uc3QgZm4gPSBldmFsdWF0ZUV4cHJlc3Npb24oZm5FeHByZXNzaW9uLCB2YXJpYWJsZXMpXG5cbiAgICBpZiAoIShmbiBpbnN0YW5jZW9mIGxpYi5MRnVuY3Rpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGNhbGwgJHtjaGFsay5jeWFuKGZuKX0gYmVjYXVzZSBpdCdzIG5vdCBhIGZ1bmN0aW9uYClcbiAgICB9XG5cbiAgICAvKiBUaGlzIGNvZGUgKnVzZWQqIHRvIHdvcmsgYnV0IGl0IGRvZXNuJ3QgYW55IG1vcmUsIGJlY2F1c2Ugc29tZVxuICAgICAqIHBhcmFtZXRlcnMgb2YgdGhlIGZ1bmN0aW9uIGNvdWxkIGJlIHVuZXZhbHVhdGVkLiBOb3cgYXJndW1lbnQgZXZhbHVhdGlvblxuICAgICAqIGlzIGRvbmUgZnJvbSB3aXRoaW4gdGhlIGNhbGwgbWV0aG9kIG9mIHRoZSBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICAvLyBFdmFsdWF0ZSBhbGwgb2YgdGhlIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIGZ1bmN0aW9uLlxuICAgIC8vY29uc3QgYXJncyA9IGFyZ0V4cHJlc3Npb25zLm1hcChhcmcgPT4gZXZhbHVhdGVFeHByZXNzaW9uKGFyZywgdmFyaWFibGVzKSk7XG4gICAgZm4uYXJndW1lbnRTY29wZSA9IHZhcmlhYmxlc1xuICAgIGNvbnN0IGFyZ3MgPSBhcmdFeHByZXNzaW9uc1xuXG4gICAgLy8gVXNlIGxpYi5jYWxsIHRvIGNhbGwgdGhlIGZ1bmN0aW9uIHdpdGggdGhlIGV2YWx1YXRlZCBhcmd1bWVudHMuXG4gICAgcmV0dXJuIGxpYi5jYWxsKGZuLCBhcmdzKVxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuVkFSSUFCTEVfSURFTlRJRklFUikge1xuICAgIC8vIEdldCBhIHZhcmlhYmxlOiBcIm5hbWVcIlxuXG4gICAgLy8gR2V0IHRoZSBuYW1lIGZyb20gdGhlIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBuYW1lID0gZXhwcmVzc2lvblsxXVxuXG4gICAgLy8gUmV0dXJuIHRoZSB2YXJpYWJsZSdzIHZhbHVlLCBvciwgaWYgdGhlIHZhcmlhYmxlIGRvZXNuJ3QgZXhpc3QsIHRocm93IGFuXG4gICAgLy8gZXJyb3IuXG4gICAgaWYgKG5hbWUgaW4gdmFyaWFibGVzKSB7XG4gICAgICByZXR1cm4gdmFyaWFibGVzW25hbWVdLnZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZJWE1FOiBDaGFuZ2UgdGhpcyBtZXNzYWdlIG5vdCB0byBpbmNsdWRlICphbGwqIHRoZSB2YXJpYWJsZXMgd2l0aGluXG4gICAgICAvLyB0aGUgc2NvcGU7IG1heWJlIGp1c3Qgc2F5IFwidmFyaWFibGUgKG5hbWUpIG5vdCBmb3VuZFwiP1xuICAgICAgdGhyb3cgYHZhcmlhYmxlICR7bmFtZX0gbm90IGluIFske09iamVjdC5rZXlzKHZhcmlhYmxlcyl9XWBcbiAgICB9XG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5WQVJJQUJMRV9BU1NJR04pIHtcbiAgICAvLyBTZXQgYSB2YXJpYWJsZSB0byBhIHZhbHVlOiBcIm5hbWUgPT4gdmFsdWVcIlxuXG4gICAgLy8gR2V0IHRoZSBuYW1lIGFuZCB2YWx1ZSBleHByZXNzaW9uIGZyb20gdGhlIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBuYW1lID0gZXhwcmVzc2lvblsxXVxuICAgIGNvbnN0IHZhbHVlRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25bMl1cblxuICAgIC8vIEV2YWx1YXRlIHRoZSB2YWx1ZSBvZiB0aGUgdmFyaWFibGUuXG4gICAgY29uc3QgdmFsdWUgPSBldmFsdWF0ZUV4cHJlc3Npb24odmFsdWVFeHByZXNzaW9uLCB2YXJpYWJsZXMpXG5cbiAgICAvLyBTZXQgdGhlIHZhcmlhYmxlIGluIHRoZSB2YXJpYWJsZXMgb2JqZWN0IHRvIGEgbmV3IHZhcmlhYmxlIHdpdGggdGhlXG4gICAgLy8gZXZhbHVhdGVkIHZhbHVlLlxuICAgIHZhcmlhYmxlc1tuYW1lXSA9IG5ldyBsaWIuVmFyaWFibGUodmFsdWUpXG4gICAgcmV0dXJuXG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5WQVJJQUJMRV9DSEFOR0UpIHtcbiAgICAvLyBDaGFuZ2UgYSB2YXJpYWJsZSB0byBhIG5ldyB2YWx1ZTogXCJuYW1lIC0+IG5ld1ZhbHVlXCJcblxuICAgIC8vIEdldCB0aGUgbmFtZSBhbmQgdmFsdWUgZXhwcmVzc2lvbiBmcm9tIHRoZSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3QgbmFtZSA9IGV4cHJlc3Npb25bMV1cbiAgICBjb25zdCB2YWx1ZUV4cHJlc3Npb24gPSBleHByZXNzaW9uWzJdXG5cbiAgICAvLyBFdmFsdWF0ZSB0aGUgbmV3IHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICBjb25zdCB2YWx1ZSA9IGV2YWx1YXRlRXhwcmVzc2lvbih2YWx1ZUV4cHJlc3Npb24sIHZhcmlhYmxlcylcblxuICAgIC8vIENoYW5nZSB0aGUgdmFsdWUgb2YgdGhlIGFscmVhZHkgZGVmaW5lZCB2YXJpYWJsZS5cbiAgICB2YXJpYWJsZXNbbmFtZV0udmFsdWUgPSB2YWx1ZVxuICAgIHJldHVyblxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuRlVOQ1RJT05fUFJJTSkge1xuICAgIC8vIEEgZnVuY3Rpb24gbGl0ZXJhbDogXCJmbihhcmcxLCBhcmcyLCBhcmczLi4uKSB7IGNvZGUgfVwiXG5cbiAgICAvLyBHZXQgdGhlIGNvZGUgYW5kIHBhcmFtYXRlcnMgZnJvbSB0aGUgZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IHBhcmFtYXRlcnMgPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3QgY29kZSA9IGV4cHJlc3Npb25bMl1cblxuICAgIC8vIENyZWF0ZSB0aGUgZnVuY3Rpb24gdXNpbmcgdGhlIGdpdmVuIGNvZGUuXG4gICAgY29uc3QgZm4gPSBuZXcgbGliLkxGdW5jdGlvbihjb2RlKVxuXG4gICAgLy8gU2V0IHRoZSBzY29wZSB2YXJpYWJsZXMgZm9yIHRoZSBmdW5jdGlvbiB0byBhIGNvcHkgb2YgdGhlIGN1cnJlbnRcbiAgICAvLyB2YXJpYWJsZXMuXG4gICAgZm4uc2V0U2NvcGVWYXJpYWJsZXMoT2JqZWN0LmFzc2lnbih7fSwgdmFyaWFibGVzKSlcblxuICAgIC8vIFNldCB0aGUgcGFyYW1hdGVycyBmb3IgdGhlIGZ1bmN0aW9uIHRvIHRoZSBwYXJhbWF0ZXJzIHRha2VuIGZyb20gdGhlXG4gICAgLy8gZXhwcmVzc2lvbiBsaXN0LlxuICAgIGZuLnNldFBhcmFtYXRlcnMocGFyYW1hdGVycylcblxuICAgIC8vIFJldHVybiB0aGUgZnVuY3Rpb24uXG4gICAgcmV0dXJuIGZuXG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5TVFJJTkdfUFJJTSkge1xuICAgIC8vIFN0cmluZyBsaXRlcmFsOiBcImNvbnRlbnRzXCJcblxuICAgIC8vIEdldCBzdHJpbmcgZnJvbSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3Qgc3RyaW5nID0gZXhwcmVzc2lvblsxXVxuXG4gICAgLy8gQ29udmVydCBzdHJpbmcgdG8gYSBsYW5ndWFnZS11c2FibGUgc3RyaW5nLCBhbmQgcmV0dXJuLlxuICAgIHJldHVybiBsaWIudG9MU3RyaW5nKHN0cmluZylcbiAgfSBlbHNlIGlmIChleHByZXNzaW9uWzBdID09PSBDLkJPT0xFQU5fUFJJTSkge1xuICAgIC8vIEJvb2xlYW4gbGl0ZXJhbDogdHJ1ZS9mYWxzZVxuXG4gICAgLy8gR2V0IGJvb2xlYW4gdmFsdWUgZnJvbSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3QgYm9vbCA9IGV4cHJlc3Npb25bMV1cblxuICAgIC8vIENvbnZlcnQgYm9vbGVhbiB2YWx1ZSB0byBhIGxhbmd1YWdlLXVzYWJsZSBib29sZWFuLCBhbmQgcmV0dXJuLlxuICAgIHJldHVybiBsaWIudG9MQm9vbGVhbihib29sKVxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuTlVNQkVSX1BSSU0pIHtcbiAgICAvLyBOdW1iZXIgcHJpbWl0aXZlOiAxLCAyLCAzLCA0LCA3LjI1LCAtMywgZXRjLlxuXG4gICAgLy8gR2V0IG51bWJlciB2YWx1ZSBmcm9tIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBudW1iZXIgPSBleHByZXNzaW9uWzFdXG5cbiAgICAvLyBDb252ZXJ0IG51bWJlciB2YWx1ZSB0byBhIGxhbmd1YWdlLXVzYWJsZSBudW1iZXIsIGFuZCByZXR1cm4uXG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobnVtYmVyKVxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuU0VUX1BST1BfVVNJTkdfSURFTlRJRklFUikge1xuICAgIC8vIFNldCBhIHByb3BlcnR5IG9mIGFuIG9iamVjdCB1c2luZyBhbiBpZGVudGlmaWVyIGxpdGVyYWw6XG4gICAgLy8gXCJvYmoua2V5ID4gdmFsdWVcIlxuXG4gICAgLy8gR2V0IG9iamVjdCBleHByZXNzaW9uLCBrZXksIGFuZCB2YWx1ZSBleHByZXNzaW9uIGZyb20gZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IG9iakV4cHJlc3Npb24gPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3Qga2V5ID0gZXhwcmVzc2lvblsyXVxuICAgIGNvbnN0IHZhbHVlRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25bM11cblxuICAgIC8vIEV2YWx1YXRlIHRoZSBvYmplY3QgYW5kIHZhbHVlIGV4cHJlc3Npb25zLlxuICAgIGNvbnN0IG9iaiA9IGV2YWx1YXRlRXhwcmVzc2lvbihvYmpFeHByZXNzaW9uLCB2YXJpYWJsZXMpXG4gICAgY29uc3QgdmFsdWUgPSBldmFsdWF0ZUV4cHJlc3Npb24odmFsdWVFeHByZXNzaW9uLCB2YXJpYWJsZXMpXG5cbiAgICAvLyBVc2UgbGliLnNldCB0byBzZXQgdGhlIHByb3BlcnR5IG9mIHRoZSBldmFsdWF0ZWQgb2JqZWN0LlxuICAgIGxpYi5zZXQob2JqLCBrZXksIHZhbHVlKVxuICAgIHJldHVyblxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuR0VUX1BST1BfVVNJTkdfSURFTlRJRklFUikge1xuICAgIC8vIEdldCBhIHByb3BlcnR5IG9mIGFuIG9iamVjdCB1c2luZyBhbiBpZGVudGlmaWVyIGxpdGVyYWw6IFwib2JqLmtleVwiXG5cbiAgICAvLyBHZXQgb2JqZWN0IGV4cHJlc3Npb24gYW5kIGtleSBmcm9tIHRoZSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3Qgb2JqRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25bMV1cbiAgICBjb25zdCBrZXkgPSBleHByZXNzaW9uWzJdXG5cbiAgICAvLyBFdmFsdWF0ZSB0aGUgb2JqZWN0IGV4cHJlc3Npb24uXG4gICAgY29uc3Qgb2JqID0gZXZhbHVhdGVFeHByZXNzaW9uKG9iakV4cHJlc3Npb24sIHZhcmlhYmxlcylcblxuICAgIC8vIEdldCB0aGUgdmFsdWUgZnJvbSBsaWIuZ2V0LlxuICAgIGNvbnN0IHZhbHVlID0gbGliLmdldChvYmosIGtleSlcblxuICAgIC8vIFJldHVybiB0aGUgZ290dGVuIHZhbHVlLlxuICAgIHJldHVybiB2YWx1ZVxuICB9IGVsc2Uge1xuICAgIHRocm93IGBJbnZhbGlkIGV4cHJlc3Npb24gdHlwZTogJHtleHByZXNzaW9uWzBdfWBcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXZhbHVhdGVHZXRQcm9wVXNpbmdJZGVudGlmaWVyKHZhcmlhYmxlcywgW18sIG9iakV4cHIsIGtleV0pIHtcbiAgbGV0IG9iaiA9IGV2YWx1YXRlRXhwcmVzc2lvbihvYmpFeHByLCB2YXJpYWJsZXMpXG4gIHJldHVybiBsaWIuZ2V0KG9iaiwga2V5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXZhbHVhdGVFYWNoRXhwcmVzc2lvbih2YXJpYWJsZXMsIGV4cHJlc3Npb25zKSB7XG4gIHJldHVybiBleHByZXNzaW9ucy5tYXAoZSA9PiBldmFsdWF0ZUV4cHJlc3Npb24oZSwgdmFyaWFibGVzKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludGVycChhc3QsIGRpcikge1xuICBpZiAoYXN0KSB7XG4gICAgbGV0IHZhcmlhYmxlcyA9IHt9XG5cbiAgICBPYmplY3QuYXNzaWduKHZhcmlhYmxlcywgYnVpbHRpbnMubWFrZUJ1aWx0aW5zKGRpcikpXG5cbiAgICBsZXQgcmVzdWx0ID0gZXZhbHVhdGVFYWNoRXhwcmVzc2lvbih2YXJpYWJsZXMsIGFzdClcblxuICAgIHJldHVybiB7IHJlc3VsdCwgdmFyaWFibGVzIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmVycm9yKCdIYWhhLCB5b3UgZGlkblxcJ3QgcGFzcyBtZSBhIHRyZWUhJylcbiAgfVxufVxuIl19