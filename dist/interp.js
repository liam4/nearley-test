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
      throw new Error(chalk.cyan(name) + ' is not defined.');
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
    throw new Error('Invalid expression: ' + chalk.cyan(expression[0]));
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
    throw new Error('Haha, you didn\'t pass me a tree!');
  }
}
//# sourceMappingURL=data:application/json;base64,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QTBCO0FBQy9CLE1BQUksR0FBSixFQUFTO0FBQ1AsUUFBSSxZQUFZLEVBQWhCOztBQUVBLFdBQU8sTUFBUCxDQUFjLFNBQWQsRUFBeUIsU0FBUyxZQUFULENBQXNCLEdBQXRCLENBQXpCOztBQUVBLFFBQUksU0FBUyx1QkFBdUIsU0FBdkIsRUFBa0MsR0FBbEMsQ0FBYjs7QUFFQSxXQUFPLEVBQUUsY0FBRixFQUFVLG9CQUFWLEVBQVA7QUFDRCxHQVJELE1BUU87QUFDTCxVQUFNLElBQUksS0FBSixDQUFVLG1DQUFWLENBQU47QUFDRDtBQUNGIiwiZmlsZSI6ImludGVycC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IEMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpXG5jb25zdCBsaWIgPSByZXF1aXJlKCcuL2xpYicpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbmNvbnN0IGJ1aWx0aW5zID0gcmVxdWlyZSgnLi9idWlsdGlucycpXG5cbmV4cG9ydCBmdW5jdGlvbiBldmFsdWF0ZUV4cHJlc3Npb24oZXhwcmVzc2lvbiwgdmFyaWFibGVzKSB7XG4gIGlmIChleHByZXNzaW9uWzBdID09PSBDLkNPTU1FTlQpIHtcbiAgICByZXR1cm5cbiAgfSBlbHNlIGlmIChleHByZXNzaW9uIGluc3RhbmNlb2YgQXJyYXkgJiZcbiAgICAgICAgICAgICBleHByZXNzaW9uLmV2ZXJ5KGUgPT4gZSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgIHJldHVybiBldmFsdWF0ZUVhY2hFeHByZXNzaW9uKHZhcmlhYmxlcywgZXhwcmVzc2lvbilcbiAgfSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5WQVJJQUJMRV9JREVOVElGSUVSICYmIGV4cHJlc3Npb25bMV0gPT09ICdlbnZpcm9ubWVudCcpIHtcbiAgICByZXR1cm4gbmV3IGxpYi5MRW52aXJvbm1lbnQodmFyaWFibGVzKVxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuRlVOQ1RJT05fQ0FMTCkge1xuICAgIC8vIENhbGwgYSBmdW5jdGlvbjogXCJmdW5jdGlvbihhcmcxLCBhcmcyLCBhcmczLi4uKVwiXG5cbiAgICAvLyBHZXQgdGhlIGZ1bmN0aW9uIGFuZCBhcmd1bWVudCBleHByZXNzaW9ucyBmcm9tIHRoZSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3QgZm5FeHByZXNzaW9uID0gZXhwcmVzc2lvblsxXVxuICAgIGNvbnN0IGFyZ0V4cHJlc3Npb25zID0gZXhwcmVzc2lvblsyXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIGZ1bmN0aW9uIGV4cHJlc3Npb24gdG8gZ2V0IHRoZSBhY3R1YWwgZnVuY3Rpb24uXG4gICAgY29uc3QgZm4gPSBldmFsdWF0ZUV4cHJlc3Npb24oZm5FeHByZXNzaW9uLCB2YXJpYWJsZXMpXG5cbiAgICBpZiAoIShmbiBpbnN0YW5jZW9mIGxpYi5MRnVuY3Rpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGNhbGwgJHtjaGFsay5jeWFuKGZuKX0gYmVjYXVzZSBpdCdzIG5vdCBhIGZ1bmN0aW9uYClcbiAgICB9XG5cbiAgICAvKiBUaGlzIGNvZGUgKnVzZWQqIHRvIHdvcmsgYnV0IGl0IGRvZXNuJ3QgYW55IG1vcmUsIGJlY2F1c2Ugc29tZVxuICAgICAqIHBhcmFtZXRlcnMgb2YgdGhlIGZ1bmN0aW9uIGNvdWxkIGJlIHVuZXZhbHVhdGVkLiBOb3cgYXJndW1lbnQgZXZhbHVhdGlvblxuICAgICAqIGlzIGRvbmUgZnJvbSB3aXRoaW4gdGhlIGNhbGwgbWV0aG9kIG9mIHRoZSBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICAvLyBFdmFsdWF0ZSBhbGwgb2YgdGhlIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIGZ1bmN0aW9uLlxuICAgIC8vY29uc3QgYXJncyA9IGFyZ0V4cHJlc3Npb25zLm1hcChhcmcgPT4gZXZhbHVhdGVFeHByZXNzaW9uKGFyZywgdmFyaWFibGVzKSk7XG4gICAgZm4uYXJndW1lbnRTY29wZSA9IHZhcmlhYmxlc1xuICAgIGNvbnN0IGFyZ3MgPSBhcmdFeHByZXNzaW9uc1xuXG4gICAgLy8gVXNlIGxpYi5jYWxsIHRvIGNhbGwgdGhlIGZ1bmN0aW9uIHdpdGggdGhlIGV2YWx1YXRlZCBhcmd1bWVudHMuXG4gICAgcmV0dXJuIGxpYi5jYWxsKGZuLCBhcmdzKVxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuVkFSSUFCTEVfSURFTlRJRklFUikge1xuICAgIC8vIEdldCBhIHZhcmlhYmxlOiBcIm5hbWVcIlxuXG4gICAgLy8gR2V0IHRoZSBuYW1lIGZyb20gdGhlIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBuYW1lID0gZXhwcmVzc2lvblsxXVxuXG4gICAgLy8gUmV0dXJuIHRoZSB2YXJpYWJsZSdzIHZhbHVlLCBvciwgaWYgdGhlIHZhcmlhYmxlIGRvZXNuJ3QgZXhpc3QsIHRocm93IGFuXG4gICAgLy8gZXJyb3IuXG4gICAgaWYgKG5hbWUgaW4gdmFyaWFibGVzKSB7XG4gICAgICByZXR1cm4gdmFyaWFibGVzW25hbWVdLnZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtjaGFsay5jeWFuKG5hbWUpfSBpcyBub3QgZGVmaW5lZC5gKVxuICAgIH1cbiAgfSBlbHNlIGlmIChleHByZXNzaW9uWzBdID09PSBDLlZBUklBQkxFX0FTU0lHTikge1xuICAgIC8vIFNldCBhIHZhcmlhYmxlIHRvIGEgdmFsdWU6IFwibmFtZSA9PiB2YWx1ZVwiXG5cbiAgICAvLyBHZXQgdGhlIG5hbWUgYW5kIHZhbHVlIGV4cHJlc3Npb24gZnJvbSB0aGUgZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IG5hbWUgPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3QgdmFsdWVFeHByZXNzaW9uID0gZXhwcmVzc2lvblsyXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIHZhbHVlIG9mIHRoZSB2YXJpYWJsZS5cbiAgICBjb25zdCB2YWx1ZSA9IGV2YWx1YXRlRXhwcmVzc2lvbih2YWx1ZUV4cHJlc3Npb24sIHZhcmlhYmxlcylcblxuICAgIC8vIFNldCB0aGUgdmFyaWFibGUgaW4gdGhlIHZhcmlhYmxlcyBvYmplY3QgdG8gYSBuZXcgdmFyaWFibGUgd2l0aCB0aGVcbiAgICAvLyBldmFsdWF0ZWQgdmFsdWUuXG4gICAgdmFyaWFibGVzW25hbWVdID0gbmV3IGxpYi5WYXJpYWJsZSh2YWx1ZSlcbiAgICByZXR1cm5cbiAgfSBlbHNlIGlmIChleHByZXNzaW9uWzBdID09PSBDLlZBUklBQkxFX0NIQU5HRSkge1xuICAgIC8vIENoYW5nZSBhIHZhcmlhYmxlIHRvIGEgbmV3IHZhbHVlOiBcIm5hbWUgLT4gbmV3VmFsdWVcIlxuXG4gICAgLy8gR2V0IHRoZSBuYW1lIGFuZCB2YWx1ZSBleHByZXNzaW9uIGZyb20gdGhlIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBuYW1lID0gZXhwcmVzc2lvblsxXVxuICAgIGNvbnN0IHZhbHVlRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25bMl1cblxuICAgIC8vIEV2YWx1YXRlIHRoZSBuZXcgdmFsdWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgIGNvbnN0IHZhbHVlID0gZXZhbHVhdGVFeHByZXNzaW9uKHZhbHVlRXhwcmVzc2lvbiwgdmFyaWFibGVzKVxuXG4gICAgLy8gQ2hhbmdlIHRoZSB2YWx1ZSBvZiB0aGUgYWxyZWFkeSBkZWZpbmVkIHZhcmlhYmxlLlxuICAgIHZhcmlhYmxlc1tuYW1lXS52YWx1ZSA9IHZhbHVlXG4gICAgcmV0dXJuXG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5GVU5DVElPTl9QUklNKSB7XG4gICAgLy8gQSBmdW5jdGlvbiBsaXRlcmFsOiBcImZuKGFyZzEsIGFyZzIsIGFyZzMuLi4pIHsgY29kZSB9XCJcblxuICAgIC8vIEdldCB0aGUgY29kZSBhbmQgcGFyYW1hdGVycyBmcm9tIHRoZSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3QgcGFyYW1hdGVycyA9IGV4cHJlc3Npb25bMV1cbiAgICBjb25zdCBjb2RlID0gZXhwcmVzc2lvblsyXVxuXG4gICAgLy8gQ3JlYXRlIHRoZSBmdW5jdGlvbiB1c2luZyB0aGUgZ2l2ZW4gY29kZS5cbiAgICBjb25zdCBmbiA9IG5ldyBsaWIuTEZ1bmN0aW9uKGNvZGUpXG5cbiAgICAvLyBTZXQgdGhlIHNjb3BlIHZhcmlhYmxlcyBmb3IgdGhlIGZ1bmN0aW9uIHRvIGEgY29weSBvZiB0aGUgY3VycmVudFxuICAgIC8vIHZhcmlhYmxlcy5cbiAgICBmbi5zZXRTY29wZVZhcmlhYmxlcyhPYmplY3QuYXNzaWduKHt9LCB2YXJpYWJsZXMpKVxuXG4gICAgLy8gU2V0IHRoZSBwYXJhbWF0ZXJzIGZvciB0aGUgZnVuY3Rpb24gdG8gdGhlIHBhcmFtYXRlcnMgdGFrZW4gZnJvbSB0aGVcbiAgICAvLyBleHByZXNzaW9uIGxpc3QuXG4gICAgZm4uc2V0UGFyYW1hdGVycyhwYXJhbWF0ZXJzKVxuXG4gICAgLy8gUmV0dXJuIHRoZSBmdW5jdGlvbi5cbiAgICByZXR1cm4gZm5cbiAgfSBlbHNlIGlmIChleHByZXNzaW9uWzBdID09PSBDLlNIT1JUSEFORF9GVU5DVElPTl9QUklNKSB7XG4gICAgY29uc3QgcGFyYW1hdGVycyA9IGV4cHJlc3Npb25bMV1cbiAgICBjb25zdCBjb2RlRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25bMl1cbiAgICBjb25zdCBmbiA9IG5ldyBsaWIuTEZ1bmN0aW9uKGNvZGVFeHByZXNzaW9uKVxuICAgIGZuLmlzU2hvcnRoYW5kID0gdHJ1ZVxuICAgIGZuLnNldFNjb3BlVmFyaWFibGVzKE9iamVjdC5hc3NpZ24oe30sIHZhcmlhYmxlcykpXG4gICAgZm4uc2V0UGFyYW1hdGVycyhwYXJhbWF0ZXJzKVxuICAgIHJldHVybiBmblxuICB9IGVsc2UgaWYgKGV4cHJlc3Npb25bMF0gPT09IEMuU1RSSU5HX1BSSU0pIHtcbiAgICAvLyBTdHJpbmcgbGl0ZXJhbDogXCJjb250ZW50c1wiXG5cbiAgICAvLyBHZXQgc3RyaW5nIGZyb20gZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IHN0cmluZyA9IGV4cHJlc3Npb25bMV1cblxuICAgIC8vIENvbnZlcnQgc3RyaW5nIHRvIGEgbGFuZ3VhZ2UtdXNhYmxlIHN0cmluZywgYW5kIHJldHVybi5cbiAgICByZXR1cm4gbGliLnRvTFN0cmluZyhzdHJpbmcpXG4gIH0gZWxzZSBpZiAoZXhwcmVzc2lvblswXSA9PT0gQy5CT09MRUFOX1BSSU0pIHtcbiAgICAvLyBCb29sZWFuIGxpdGVyYWw6IHRydWUvZmFsc2VcblxuICAgIC8vIEdldCBib29sZWFuIHZhbHVlIGZyb20gZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IGJvb2wgPSBleHByZXNzaW9uWzFdXG5cbiAgICAvLyBDb252ZXJ0IGJvb2xlYW4gdmFsdWUgdG8gYSBsYW5ndWFnZS11c2FibGUgYm9vbGVhbiwgYW5kIHJldHVybi5cbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4oYm9vbClcbiAgfSBlbHNlIGlmIChleHByZXNzaW9uWzBdID09PSBDLk5VTUJFUl9QUklNKSB7XG4gICAgLy8gTnVtYmVyIHByaW1pdGl2ZTogMSwgMiwgMywgNCwgNy4yNSwgLTMsIGV0Yy5cblxuICAgIC8vIEdldCBudW1iZXIgdmFsdWUgZnJvbSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3QgbnVtYmVyID0gZXhwcmVzc2lvblsxXVxuXG4gICAgLy8gQ29udmVydCBudW1iZXIgdmFsdWUgdG8gYSBsYW5ndWFnZS11c2FibGUgbnVtYmVyLCBhbmQgcmV0dXJuLlxuICAgIHJldHVybiBsaWIudG9MTnVtYmVyKG51bWJlcilcbiAgfSBlbHNlIGlmIChleHByZXNzaW9uWzBdID09PSBDLlNFVF9QUk9QX1VTSU5HX0lERU5USUZJRVIpIHtcbiAgICAvLyBTZXQgYSBwcm9wZXJ0eSBvZiBhbiBvYmplY3QgdXNpbmcgYW4gaWRlbnRpZmllciBsaXRlcmFsOlxuICAgIC8vIFwib2JqLmtleSA+IHZhbHVlXCJcblxuICAgIC8vIEdldCBvYmplY3QgZXhwcmVzc2lvbiwga2V5LCBhbmQgdmFsdWUgZXhwcmVzc2lvbiBmcm9tIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBvYmpFeHByZXNzaW9uID0gZXhwcmVzc2lvblsxXVxuICAgIGNvbnN0IGtleSA9IGV4cHJlc3Npb25bMl1cbiAgICBjb25zdCB2YWx1ZUV4cHJlc3Npb24gPSBleHByZXNzaW9uWzNdXG5cbiAgICAvLyBFdmFsdWF0ZSB0aGUgb2JqZWN0IGFuZCB2YWx1ZSBleHByZXNzaW9ucy5cbiAgICBjb25zdCBvYmogPSBldmFsdWF0ZUV4cHJlc3Npb24ob2JqRXhwcmVzc2lvbiwgdmFyaWFibGVzKVxuICAgIGNvbnN0IHZhbHVlID0gZXZhbHVhdGVFeHByZXNzaW9uKHZhbHVlRXhwcmVzc2lvbiwgdmFyaWFibGVzKVxuXG4gICAgLy8gVXNlIGxpYi5zZXQgdG8gc2V0IHRoZSBwcm9wZXJ0eSBvZiB0aGUgZXZhbHVhdGVkIG9iamVjdC5cbiAgICBsaWIuc2V0KG9iaiwga2V5LCB2YWx1ZSlcbiAgICByZXR1cm5cbiAgfSBlbHNlIGlmIChleHByZXNzaW9uWzBdID09PSBDLkdFVF9QUk9QX1VTSU5HX0lERU5USUZJRVIpIHtcbiAgICAvLyBHZXQgYSBwcm9wZXJ0eSBvZiBhbiBvYmplY3QgdXNpbmcgYW4gaWRlbnRpZmllciBsaXRlcmFsOiBcIm9iai5rZXlcIlxuXG4gICAgLy8gR2V0IG9iamVjdCBleHByZXNzaW9uIGFuZCBrZXkgZnJvbSB0aGUgZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IG9iakV4cHJlc3Npb24gPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3Qga2V5ID0gZXhwcmVzc2lvblsyXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIG9iamVjdCBleHByZXNzaW9uLlxuICAgIGNvbnN0IG9iaiA9IGV2YWx1YXRlRXhwcmVzc2lvbihvYmpFeHByZXNzaW9uLCB2YXJpYWJsZXMpXG5cbiAgICAvLyBHZXQgdGhlIHZhbHVlIGZyb20gbGliLmdldC5cbiAgICBjb25zdCB2YWx1ZSA9IGxpYi5nZXQob2JqLCBrZXkpXG5cbiAgICAvLyBSZXR1cm4gdGhlIGdvdHRlbiB2YWx1ZS5cbiAgICByZXR1cm4gdmFsdWVcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZXhwcmVzc2lvbjogJHtjaGFsay5jeWFuKGV4cHJlc3Npb25bMF0pfWApXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlR2V0UHJvcFVzaW5nSWRlbnRpZmllcih2YXJpYWJsZXMsIFtfLCBvYmpFeHByLCBrZXldKSB7XG4gIGxldCBvYmogPSBldmFsdWF0ZUV4cHJlc3Npb24ob2JqRXhwciwgdmFyaWFibGVzKVxuICByZXR1cm4gbGliLmdldChvYmosIGtleSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlRWFjaEV4cHJlc3Npb24odmFyaWFibGVzLCBleHByZXNzaW9ucykge1xuICByZXR1cm4gZXhwcmVzc2lvbnMubWFwKGUgPT4gZXZhbHVhdGVFeHByZXNzaW9uKGUsIHZhcmlhYmxlcykpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnAoYXN0LCBkaXIpIHtcbiAgaWYgKGFzdCkge1xuICAgIGxldCB2YXJpYWJsZXMgPSB7fVxuXG4gICAgT2JqZWN0LmFzc2lnbih2YXJpYWJsZXMsIGJ1aWx0aW5zLm1ha2VCdWlsdGlucyhkaXIpKVxuXG4gICAgbGV0IHJlc3VsdCA9IGV2YWx1YXRlRWFjaEV4cHJlc3Npb24odmFyaWFibGVzLCBhc3QpXG5cbiAgICByZXR1cm4geyByZXN1bHQsIHZhcmlhYmxlcyB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdIYWhhLCB5b3UgZGlkblxcJ3QgcGFzcyBtZSBhIHRyZWUhJylcbiAgfVxufVxuIl19