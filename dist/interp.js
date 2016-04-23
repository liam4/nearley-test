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

function evaluateExpression(expression, letiables) {
  if (expression[0] === C.COMMENT) {
    return;
  } else if (expression instanceof Array && expression.every(function (e) {
    return e instanceof Array;
  })) {
    return evaluateEachExpression(letiables, expression);
  } else if (expression[0] === C.FUNCTION_CALL) {
    // Call a function: "function(arg1, arg2, arg3...)"

    // Get the function and argument expressions from the expression list.
    var fnExpression = expression[1];
    var argExpressions = expression[2];

    // Evaluate the function expression to get the actual function.
    var fn = evaluateExpression(fnExpression, letiables);

    /* This code *used* to work but it doesn't any more, because some
     * parameters of the function could be unevaluated. Now argument evaluation
     * is done from within the call method of the function.
     */
    // Evaluate all of the arguments passed to the function.
    //const args = argExpressions.map(arg => evaluateExpression(arg, letiables));
    fn.argumentScope = letiables;
    var args = argExpressions;

    // Use lib.call to call the function with the evaluated arguments.
    return lib.call(fn, args);
  } else if (expression[0] === C.letIABLE_IDENTIFIER) {
    // Get a letiable: "name"

    // Get the name from the expression list.
    var name = expression[1];

    // Return the letiable's value, or, if the letiable doesn't exist, throw an
    // error.
    if (name in letiables) {
      return letiables[name].value;
    } else {
      // FIXME: Change this message not to include *all* the letiables within
      // the scope; maybe just say "letiable (name) not found"?
      throw 'letiable ' + name + ' not in [' + Object.keys(letiables) + ']';
    }
  } else if (expression[0] === C.letIABLE_ASSIGN) {
    // Set a letiable to a value: "name => value"

    // Get the name and value expression from the expression list.
    var _name = expression[1];
    var valueExpression = expression[2];

    // Evaluate the value of the letiable.
    var value = evaluateExpression(valueExpression, letiables);

    // Set the letiable in the letiables object to a new letiable with the
    // evaluated value.
    letiables[_name] = new lib.letiable(value);
    return;
  } else if (expression[0] === C.letIABLE_CHANGE) {
    // Change a letiable to a new value: "name -> newValue"

    // Get the name and value expression from the expression list.
    var _name2 = expression[1];
    var _valueExpression = expression[2];

    // Evaluate the new value of the letiable.
    var _value = evaluateExpression(_valueExpression, letiables);

    // Change the value of the already defined letiable.
    letiables[_name2].value = _value;
    return;
  } else if (expression[0] === C.FUNCTION_PRIM) {
    // A function literal: "fn(arg1, arg2, arg3...) { code }"

    // Get the code and paramaters from the expression list.
    var paramaters = expression[1];
    var code = expression[2];

    // Create the function using the given code.
    var _fn = new lib.LFunction(code);

    // Set the scope letiables for the function to a copy of the current
    // letiables.
    _fn.setScopeletiables(Object.assign({}, letiables));

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
    var obj = evaluateExpression(objExpression, letiables);
    var _value2 = evaluateExpression(_valueExpression2, letiables);

    // Use lib.set to set the property of the evaluated object.
    lib.set(obj, key, _value2);
    return;
  } else if (expression[0] === C.GET_PROP_USING_IDENTIFIER) {
    // Get a property of an object using an identifier literal: "obj.key"

    // Get object expression and key from the expression list.
    var _objExpression = expression[1];
    var _key = expression[2];

    // Evaluate the object expression.
    var _obj = evaluateExpression(_objExpression, letiables);

    // Get the value from lib.get.
    var _value3 = lib.get(_obj, _key);

    // Return the gotten value.
    return _value3;
  } else {
    throw 'Invalid expression type: ' + expression[0];
  }
}

function evaluateGetPropUsingIdentifier(letiables, _ref) {
  var _ref2 = _slicedToArray(_ref, 3);

  var _ = _ref2[0];
  var objExpr = _ref2[1];
  var key = _ref2[2];

  var obj = evaluateExpression(objExpr, letiables);
  return lib.get(obj, key);
}

function evaluateEachExpression(letiables, expressions) {
  return expressions.map(function (e) {
    return evaluateExpression(e, letiables);
  });
}

function interp(ast) {
  if (ast) {
    var letiables = {};

    Object.assign(letiables, builtins.makeBuiltins());

    var result = evaluateEachExpression(letiables, ast);

    return { result: result, letiables: letiables };
  } else {
    console.error('Haha, you didn\'t pass me a tree!');
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImludGVycC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztRQUlnQixrQixHQUFBLGtCO1FBcUpBLDhCLEdBQUEsOEI7UUFLQSxzQixHQUFBLHNCO1FBSUEsTSxHQUFBLE07QUFsS2hCLElBQU0sSUFBSSxRQUFRLGFBQVIsQ0FBVjtBQUNBLElBQU0sTUFBTSxRQUFRLE9BQVIsQ0FBWjtBQUNBLElBQU0sV0FBVyxRQUFRLFlBQVIsQ0FBakI7O0FBRU8sU0FBUyxrQkFBVCxDQUE0QixVQUE1QixFQUF3QyxTQUF4QyxFQUFtRDtBQUN4RCxNQUFHLFdBQVcsQ0FBWCxNQUFrQixFQUFFLE9BQXZCLEVBQWdDO0FBQzlCO0FBQ0QsR0FGRCxNQUVPLElBQUcsc0JBQXNCLEtBQXRCLElBQ0MsV0FBVyxLQUFYLENBQWlCO0FBQUEsV0FBSyxhQUFhLEtBQWxCO0FBQUEsR0FBakIsQ0FESixFQUMrQztBQUNwRCxXQUFPLHVCQUF1QixTQUF2QixFQUFrQyxVQUFsQyxDQUFQO0FBQ0QsR0FITSxNQUdBLElBQUcsV0FBVyxDQUFYLE1BQWtCLEVBQUUsYUFBdkIsRUFBc0M7Ozs7QUFJM0MsUUFBTSxlQUFlLFdBQVcsQ0FBWCxDQUFyQjtBQUNBLFFBQU0saUJBQWlCLFdBQVcsQ0FBWCxDQUF2Qjs7O0FBR0EsUUFBTSxLQUFLLG1CQUFtQixZQUFuQixFQUFpQyxTQUFqQyxDQUFYOzs7Ozs7OztBQVFBLE9BQUcsYUFBSCxHQUFtQixTQUFuQjtBQUNBLFFBQU0sT0FBTyxjQUFiOzs7QUFHQSxXQUFPLElBQUksSUFBSixDQUFTLEVBQVQsRUFBYSxJQUFiLENBQVA7QUFDRCxHQXJCTSxNQXFCQSxJQUFHLFdBQVcsQ0FBWCxNQUFrQixFQUFFLG1CQUF2QixFQUE0Qzs7OztBQUlqRCxRQUFNLE9BQU8sV0FBVyxDQUFYLENBQWI7Ozs7QUFJQSxRQUFHLFFBQVEsU0FBWCxFQUFzQjtBQUNwQixhQUFPLFVBQVUsSUFBVixFQUFnQixLQUF2QjtBQUNELEtBRkQsTUFFTzs7O0FBR0wsMEJBQWtCLElBQWxCLGlCQUFrQyxPQUFPLElBQVAsQ0FBWSxTQUFaLENBQWxDO0FBQ0Q7QUFDRixHQWZNLE1BZUEsSUFBRyxXQUFXLENBQVgsTUFBa0IsRUFBRSxlQUF2QixFQUF3Qzs7OztBQUk3QyxRQUFNLFFBQU8sV0FBVyxDQUFYLENBQWI7QUFDQSxRQUFNLGtCQUFrQixXQUFXLENBQVgsQ0FBeEI7OztBQUdBLFFBQU0sUUFBUSxtQkFBbUIsZUFBbkIsRUFBb0MsU0FBcEMsQ0FBZDs7OztBQUlBLGNBQVUsS0FBVixJQUFrQixJQUFJLElBQUksUUFBUixDQUFpQixLQUFqQixDQUFsQjtBQUNBO0FBQ0QsR0FkTSxNQWNBLElBQUcsV0FBVyxDQUFYLE1BQWtCLEVBQUUsZUFBdkIsRUFBd0M7Ozs7QUFJN0MsUUFBTSxTQUFPLFdBQVcsQ0FBWCxDQUFiO0FBQ0EsUUFBTSxtQkFBa0IsV0FBVyxDQUFYLENBQXhCOzs7QUFHQSxRQUFNLFNBQVEsbUJBQW1CLGdCQUFuQixFQUFvQyxTQUFwQyxDQUFkOzs7QUFHQSxjQUFVLE1BQVYsRUFBZ0IsS0FBaEIsR0FBd0IsTUFBeEI7QUFDQTtBQUNELEdBYk0sTUFhQSxJQUFHLFdBQVcsQ0FBWCxNQUFrQixFQUFFLGFBQXZCLEVBQXNDOzs7O0FBSTNDLFFBQU0sYUFBYSxXQUFXLENBQVgsQ0FBbkI7QUFDQSxRQUFNLE9BQU8sV0FBVyxDQUFYLENBQWI7OztBQUdBLFFBQU0sTUFBSyxJQUFJLElBQUksU0FBUixDQUFrQixJQUFsQixDQUFYOzs7O0FBSUEsUUFBRyxpQkFBSCxDQUFxQixPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLFNBQWxCLENBQXJCOzs7O0FBSUEsUUFBRyxhQUFILENBQWlCLFVBQWpCOzs7QUFHQSxXQUFPLEdBQVA7QUFDRCxHQXBCTSxNQW9CQSxJQUFHLFdBQVcsQ0FBWCxNQUFrQixFQUFFLFdBQXZCLEVBQW9DOzs7O0FBSXpDLFFBQU0sU0FBUyxXQUFXLENBQVgsQ0FBZjs7O0FBR0EsV0FBTyxJQUFJLFNBQUosQ0FBYyxNQUFkLENBQVA7QUFDRCxHQVJNLE1BUUEsSUFBRyxXQUFXLENBQVgsTUFBa0IsRUFBRSxZQUF2QixFQUFxQzs7OztBQUkxQyxRQUFNLE9BQU8sV0FBVyxDQUFYLENBQWI7OztBQUdBLFdBQU8sSUFBSSxVQUFKLENBQWUsSUFBZixDQUFQO0FBQ0QsR0FSTSxNQVFBLElBQUcsV0FBVyxDQUFYLE1BQWtCLEVBQUUsV0FBdkIsRUFBb0M7Ozs7QUFJekMsUUFBTSxTQUFTLFdBQVcsQ0FBWCxDQUFmOzs7QUFHQSxXQUFPLElBQUksU0FBSixDQUFjLE1BQWQsQ0FBUDtBQUNELEdBUk0sTUFRQSxJQUFHLFdBQVcsQ0FBWCxNQUFrQixFQUFFLHlCQUF2QixFQUFrRDs7Ozs7QUFLdkQsUUFBTSxnQkFBZ0IsV0FBVyxDQUFYLENBQXRCO0FBQ0EsUUFBTSxNQUFNLFdBQVcsQ0FBWCxDQUFaO0FBQ0EsUUFBTSxvQkFBa0IsV0FBVyxDQUFYLENBQXhCOzs7QUFHQSxRQUFNLE1BQU0sbUJBQW1CLGFBQW5CLEVBQWtDLFNBQWxDLENBQVo7QUFDQSxRQUFNLFVBQVEsbUJBQW1CLGlCQUFuQixFQUFvQyxTQUFwQyxDQUFkOzs7QUFHQSxRQUFJLEdBQUosQ0FBUSxHQUFSLEVBQWEsR0FBYixFQUFrQixPQUFsQjtBQUNBO0FBQ0QsR0FoQk0sTUFnQkEsSUFBRyxXQUFXLENBQVgsTUFBa0IsRUFBRSx5QkFBdkIsRUFBa0Q7Ozs7QUFJdkQsUUFBTSxpQkFBZ0IsV0FBVyxDQUFYLENBQXRCO0FBQ0EsUUFBTSxPQUFNLFdBQVcsQ0FBWCxDQUFaOzs7QUFHQSxRQUFNLE9BQU0sbUJBQW1CLGNBQW5CLEVBQWtDLFNBQWxDLENBQVo7OztBQUdBLFFBQU0sVUFBUSxJQUFJLEdBQUosQ0FBUSxJQUFSLEVBQWEsSUFBYixDQUFkOzs7QUFHQSxXQUFPLE9BQVA7QUFDRCxHQWZNLE1BZUE7QUFDTCx3Q0FBa0MsV0FBVyxDQUFYLENBQWxDO0FBQ0Q7QUFDRjs7QUFFTSxTQUFTLDhCQUFULENBQXdDLFNBQXhDLFFBQXNFO0FBQUE7O0FBQUEsTUFBbEIsQ0FBa0I7QUFBQSxNQUFmLE9BQWU7QUFBQSxNQUFOLEdBQU07O0FBQzNFLE1BQUksTUFBTSxtQkFBbUIsT0FBbkIsRUFBNEIsU0FBNUIsQ0FBVjtBQUNBLFNBQU8sSUFBSSxHQUFKLENBQVEsR0FBUixFQUFhLEdBQWIsQ0FBUDtBQUNEOztBQUVNLFNBQVMsc0JBQVQsQ0FBZ0MsU0FBaEMsRUFBMkMsV0FBM0MsRUFBd0Q7QUFDN0QsU0FBTyxZQUFZLEdBQVosQ0FBZ0I7QUFBQSxXQUFLLG1CQUFtQixDQUFuQixFQUFzQixTQUF0QixDQUFMO0FBQUEsR0FBaEIsQ0FBUDtBQUNEOztBQUVNLFNBQVMsTUFBVCxDQUFnQixHQUFoQixFQUFxQjtBQUMxQixNQUFHLEdBQUgsRUFBUTtBQUNOLFFBQUksWUFBWSxFQUFoQjs7QUFFQSxXQUFPLE1BQVAsQ0FBYyxTQUFkLEVBQXlCLFNBQVMsWUFBVCxFQUF6Qjs7QUFFQSxRQUFJLFNBQVMsdUJBQXVCLFNBQXZCLEVBQWtDLEdBQWxDLENBQWI7O0FBRUEsV0FBTyxFQUFFLGNBQUYsRUFBVSxvQkFBVixFQUFQO0FBQ0QsR0FSRCxNQVFPO0FBQ0wsWUFBUSxLQUFSLENBQWMsbUNBQWQ7QUFDRDtBQUNGIiwiZmlsZSI6ImludGVycC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IEMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpXG5jb25zdCBsaWIgPSByZXF1aXJlKCcuL2xpYicpXG5jb25zdCBidWlsdGlucyA9IHJlcXVpcmUoJy4vYnVpbHRpbnMnKVxuXG5leHBvcnQgZnVuY3Rpb24gZXZhbHVhdGVFeHByZXNzaW9uKGV4cHJlc3Npb24sIGxldGlhYmxlcykge1xuICBpZihleHByZXNzaW9uWzBdID09PSBDLkNPTU1FTlQpIHtcbiAgICByZXR1cm5cbiAgfSBlbHNlIGlmKGV4cHJlc3Npb24gaW5zdGFuY2VvZiBBcnJheSAmJlxuICAgICAgICAgICAgIGV4cHJlc3Npb24uZXZlcnkoZSA9PiBlIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgcmV0dXJuIGV2YWx1YXRlRWFjaEV4cHJlc3Npb24obGV0aWFibGVzLCBleHByZXNzaW9uKVxuICB9IGVsc2UgaWYoZXhwcmVzc2lvblswXSA9PT0gQy5GVU5DVElPTl9DQUxMKSB7XG4gICAgLy8gQ2FsbCBhIGZ1bmN0aW9uOiBcImZ1bmN0aW9uKGFyZzEsIGFyZzIsIGFyZzMuLi4pXCJcblxuICAgIC8vIEdldCB0aGUgZnVuY3Rpb24gYW5kIGFyZ3VtZW50IGV4cHJlc3Npb25zIGZyb20gdGhlIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBmbkV4cHJlc3Npb24gPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3QgYXJnRXhwcmVzc2lvbnMgPSBleHByZXNzaW9uWzJdXG5cbiAgICAvLyBFdmFsdWF0ZSB0aGUgZnVuY3Rpb24gZXhwcmVzc2lvbiB0byBnZXQgdGhlIGFjdHVhbCBmdW5jdGlvbi5cbiAgICBjb25zdCBmbiA9IGV2YWx1YXRlRXhwcmVzc2lvbihmbkV4cHJlc3Npb24sIGxldGlhYmxlcylcblxuICAgIC8qIFRoaXMgY29kZSAqdXNlZCogdG8gd29yayBidXQgaXQgZG9lc24ndCBhbnkgbW9yZSwgYmVjYXVzZSBzb21lXG4gICAgICogcGFyYW1ldGVycyBvZiB0aGUgZnVuY3Rpb24gY291bGQgYmUgdW5ldmFsdWF0ZWQuIE5vdyBhcmd1bWVudCBldmFsdWF0aW9uXG4gICAgICogaXMgZG9uZSBmcm9tIHdpdGhpbiB0aGUgY2FsbCBtZXRob2Qgb2YgdGhlIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIC8vIEV2YWx1YXRlIGFsbCBvZiB0aGUgYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgZnVuY3Rpb24uXG4gICAgLy9jb25zdCBhcmdzID0gYXJnRXhwcmVzc2lvbnMubWFwKGFyZyA9PiBldmFsdWF0ZUV4cHJlc3Npb24oYXJnLCBsZXRpYWJsZXMpKTtcbiAgICBmbi5hcmd1bWVudFNjb3BlID0gbGV0aWFibGVzXG4gICAgY29uc3QgYXJncyA9IGFyZ0V4cHJlc3Npb25zXG5cbiAgICAvLyBVc2UgbGliLmNhbGwgdG8gY2FsbCB0aGUgZnVuY3Rpb24gd2l0aCB0aGUgZXZhbHVhdGVkIGFyZ3VtZW50cy5cbiAgICByZXR1cm4gbGliLmNhbGwoZm4sIGFyZ3MpXG4gIH0gZWxzZSBpZihleHByZXNzaW9uWzBdID09PSBDLmxldElBQkxFX0lERU5USUZJRVIpIHtcbiAgICAvLyBHZXQgYSBsZXRpYWJsZTogXCJuYW1lXCJcblxuICAgIC8vIEdldCB0aGUgbmFtZSBmcm9tIHRoZSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3QgbmFtZSA9IGV4cHJlc3Npb25bMV1cblxuICAgIC8vIFJldHVybiB0aGUgbGV0aWFibGUncyB2YWx1ZSwgb3IsIGlmIHRoZSBsZXRpYWJsZSBkb2Vzbid0IGV4aXN0LCB0aHJvdyBhblxuICAgIC8vIGVycm9yLlxuICAgIGlmKG5hbWUgaW4gbGV0aWFibGVzKSB7XG4gICAgICByZXR1cm4gbGV0aWFibGVzW25hbWVdLnZhbHVlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZJWE1FOiBDaGFuZ2UgdGhpcyBtZXNzYWdlIG5vdCB0byBpbmNsdWRlICphbGwqIHRoZSBsZXRpYWJsZXMgd2l0aGluXG4gICAgICAvLyB0aGUgc2NvcGU7IG1heWJlIGp1c3Qgc2F5IFwibGV0aWFibGUgKG5hbWUpIG5vdCBmb3VuZFwiP1xuICAgICAgdGhyb3cgYGxldGlhYmxlICR7bmFtZX0gbm90IGluIFske09iamVjdC5rZXlzKGxldGlhYmxlcyl9XWBcbiAgICB9XG4gIH0gZWxzZSBpZihleHByZXNzaW9uWzBdID09PSBDLmxldElBQkxFX0FTU0lHTikge1xuICAgIC8vIFNldCBhIGxldGlhYmxlIHRvIGEgdmFsdWU6IFwibmFtZSA9PiB2YWx1ZVwiXG5cbiAgICAvLyBHZXQgdGhlIG5hbWUgYW5kIHZhbHVlIGV4cHJlc3Npb24gZnJvbSB0aGUgZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IG5hbWUgPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3QgdmFsdWVFeHByZXNzaW9uID0gZXhwcmVzc2lvblsyXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIHZhbHVlIG9mIHRoZSBsZXRpYWJsZS5cbiAgICBjb25zdCB2YWx1ZSA9IGV2YWx1YXRlRXhwcmVzc2lvbih2YWx1ZUV4cHJlc3Npb24sIGxldGlhYmxlcylcblxuICAgIC8vIFNldCB0aGUgbGV0aWFibGUgaW4gdGhlIGxldGlhYmxlcyBvYmplY3QgdG8gYSBuZXcgbGV0aWFibGUgd2l0aCB0aGVcbiAgICAvLyBldmFsdWF0ZWQgdmFsdWUuXG4gICAgbGV0aWFibGVzW25hbWVdID0gbmV3IGxpYi5sZXRpYWJsZSh2YWx1ZSlcbiAgICByZXR1cm5cbiAgfSBlbHNlIGlmKGV4cHJlc3Npb25bMF0gPT09IEMubGV0SUFCTEVfQ0hBTkdFKSB7XG4gICAgLy8gQ2hhbmdlIGEgbGV0aWFibGUgdG8gYSBuZXcgdmFsdWU6IFwibmFtZSAtPiBuZXdWYWx1ZVwiXG5cbiAgICAvLyBHZXQgdGhlIG5hbWUgYW5kIHZhbHVlIGV4cHJlc3Npb24gZnJvbSB0aGUgZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IG5hbWUgPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3QgdmFsdWVFeHByZXNzaW9uID0gZXhwcmVzc2lvblsyXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIG5ldyB2YWx1ZSBvZiB0aGUgbGV0aWFibGUuXG4gICAgY29uc3QgdmFsdWUgPSBldmFsdWF0ZUV4cHJlc3Npb24odmFsdWVFeHByZXNzaW9uLCBsZXRpYWJsZXMpXG5cbiAgICAvLyBDaGFuZ2UgdGhlIHZhbHVlIG9mIHRoZSBhbHJlYWR5IGRlZmluZWQgbGV0aWFibGUuXG4gICAgbGV0aWFibGVzW25hbWVdLnZhbHVlID0gdmFsdWVcbiAgICByZXR1cm5cbiAgfSBlbHNlIGlmKGV4cHJlc3Npb25bMF0gPT09IEMuRlVOQ1RJT05fUFJJTSkge1xuICAgIC8vIEEgZnVuY3Rpb24gbGl0ZXJhbDogXCJmbihhcmcxLCBhcmcyLCBhcmczLi4uKSB7IGNvZGUgfVwiXG5cbiAgICAvLyBHZXQgdGhlIGNvZGUgYW5kIHBhcmFtYXRlcnMgZnJvbSB0aGUgZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IHBhcmFtYXRlcnMgPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3QgY29kZSA9IGV4cHJlc3Npb25bMl1cblxuICAgIC8vIENyZWF0ZSB0aGUgZnVuY3Rpb24gdXNpbmcgdGhlIGdpdmVuIGNvZGUuXG4gICAgY29uc3QgZm4gPSBuZXcgbGliLkxGdW5jdGlvbihjb2RlKVxuXG4gICAgLy8gU2V0IHRoZSBzY29wZSBsZXRpYWJsZXMgZm9yIHRoZSBmdW5jdGlvbiB0byBhIGNvcHkgb2YgdGhlIGN1cnJlbnRcbiAgICAvLyBsZXRpYWJsZXMuXG4gICAgZm4uc2V0U2NvcGVsZXRpYWJsZXMoT2JqZWN0LmFzc2lnbih7fSwgbGV0aWFibGVzKSlcblxuICAgIC8vIFNldCB0aGUgcGFyYW1hdGVycyBmb3IgdGhlIGZ1bmN0aW9uIHRvIHRoZSBwYXJhbWF0ZXJzIHRha2VuIGZyb20gdGhlXG4gICAgLy8gZXhwcmVzc2lvbiBsaXN0LlxuICAgIGZuLnNldFBhcmFtYXRlcnMocGFyYW1hdGVycylcblxuICAgIC8vIFJldHVybiB0aGUgZnVuY3Rpb24uXG4gICAgcmV0dXJuIGZuXG4gIH0gZWxzZSBpZihleHByZXNzaW9uWzBdID09PSBDLlNUUklOR19QUklNKSB7XG4gICAgLy8gU3RyaW5nIGxpdGVyYWw6IFwiY29udGVudHNcIlxuXG4gICAgLy8gR2V0IHN0cmluZyBmcm9tIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBzdHJpbmcgPSBleHByZXNzaW9uWzFdXG5cbiAgICAvLyBDb252ZXJ0IHN0cmluZyB0byBhIGxhbmd1YWdlLXVzYWJsZSBzdHJpbmcsIGFuZCByZXR1cm4uXG4gICAgcmV0dXJuIGxpYi50b0xTdHJpbmcoc3RyaW5nKVxuICB9IGVsc2UgaWYoZXhwcmVzc2lvblswXSA9PT0gQy5CT09MRUFOX1BSSU0pIHtcbiAgICAvLyBCb29sZWFuIGxpdGVyYWw6IHRydWUvZmFsc2VcblxuICAgIC8vIEdldCBib29sZWFuIHZhbHVlIGZyb20gZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IGJvb2wgPSBleHByZXNzaW9uWzFdXG5cbiAgICAvLyBDb252ZXJ0IGJvb2xlYW4gdmFsdWUgdG8gYSBsYW5ndWFnZS11c2FibGUgYm9vbGVhbiwgYW5kIHJldHVybi5cbiAgICByZXR1cm4gbGliLnRvTEJvb2xlYW4oYm9vbClcbiAgfSBlbHNlIGlmKGV4cHJlc3Npb25bMF0gPT09IEMuTlVNQkVSX1BSSU0pIHtcbiAgICAvLyBOdW1iZXIgcHJpbWl0aXZlOiAxLCAyLCAzLCA0LCA3LjI1LCAtMywgZXRjLlxuXG4gICAgLy8gR2V0IG51bWJlciB2YWx1ZSBmcm9tIGV4cHJlc3Npb24gbGlzdC5cbiAgICBjb25zdCBudW1iZXIgPSBleHByZXNzaW9uWzFdXG5cbiAgICAvLyBDb252ZXJ0IG51bWJlciB2YWx1ZSB0byBhIGxhbmd1YWdlLXVzYWJsZSBudW1iZXIsIGFuZCByZXR1cm4uXG4gICAgcmV0dXJuIGxpYi50b0xOdW1iZXIobnVtYmVyKVxuICB9IGVsc2UgaWYoZXhwcmVzc2lvblswXSA9PT0gQy5TRVRfUFJPUF9VU0lOR19JREVOVElGSUVSKSB7XG4gICAgLy8gU2V0IGEgcHJvcGVydHkgb2YgYW4gb2JqZWN0IHVzaW5nIGFuIGlkZW50aWZpZXIgbGl0ZXJhbDpcbiAgICAvLyBcIm9iai5rZXkgPiB2YWx1ZVwiXG5cbiAgICAvLyBHZXQgb2JqZWN0IGV4cHJlc3Npb24sIGtleSwgYW5kIHZhbHVlIGV4cHJlc3Npb24gZnJvbSBleHByZXNzaW9uIGxpc3QuXG4gICAgY29uc3Qgb2JqRXhwcmVzc2lvbiA9IGV4cHJlc3Npb25bMV1cbiAgICBjb25zdCBrZXkgPSBleHByZXNzaW9uWzJdXG4gICAgY29uc3QgdmFsdWVFeHByZXNzaW9uID0gZXhwcmVzc2lvblszXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIG9iamVjdCBhbmQgdmFsdWUgZXhwcmVzc2lvbnMuXG4gICAgY29uc3Qgb2JqID0gZXZhbHVhdGVFeHByZXNzaW9uKG9iakV4cHJlc3Npb24sIGxldGlhYmxlcylcbiAgICBjb25zdCB2YWx1ZSA9IGV2YWx1YXRlRXhwcmVzc2lvbih2YWx1ZUV4cHJlc3Npb24sIGxldGlhYmxlcylcblxuICAgIC8vIFVzZSBsaWIuc2V0IHRvIHNldCB0aGUgcHJvcGVydHkgb2YgdGhlIGV2YWx1YXRlZCBvYmplY3QuXG4gICAgbGliLnNldChvYmosIGtleSwgdmFsdWUpXG4gICAgcmV0dXJuXG4gIH0gZWxzZSBpZihleHByZXNzaW9uWzBdID09PSBDLkdFVF9QUk9QX1VTSU5HX0lERU5USUZJRVIpIHtcbiAgICAvLyBHZXQgYSBwcm9wZXJ0eSBvZiBhbiBvYmplY3QgdXNpbmcgYW4gaWRlbnRpZmllciBsaXRlcmFsOiBcIm9iai5rZXlcIlxuXG4gICAgLy8gR2V0IG9iamVjdCBleHByZXNzaW9uIGFuZCBrZXkgZnJvbSB0aGUgZXhwcmVzc2lvbiBsaXN0LlxuICAgIGNvbnN0IG9iakV4cHJlc3Npb24gPSBleHByZXNzaW9uWzFdXG4gICAgY29uc3Qga2V5ID0gZXhwcmVzc2lvblsyXVxuXG4gICAgLy8gRXZhbHVhdGUgdGhlIG9iamVjdCBleHByZXNzaW9uLlxuICAgIGNvbnN0IG9iaiA9IGV2YWx1YXRlRXhwcmVzc2lvbihvYmpFeHByZXNzaW9uLCBsZXRpYWJsZXMpXG5cbiAgICAvLyBHZXQgdGhlIHZhbHVlIGZyb20gbGliLmdldC5cbiAgICBjb25zdCB2YWx1ZSA9IGxpYi5nZXQob2JqLCBrZXkpXG5cbiAgICAvLyBSZXR1cm4gdGhlIGdvdHRlbiB2YWx1ZS5cbiAgICByZXR1cm4gdmFsdWVcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBgSW52YWxpZCBleHByZXNzaW9uIHR5cGU6ICR7ZXhwcmVzc2lvblswXX1gXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlR2V0UHJvcFVzaW5nSWRlbnRpZmllcihsZXRpYWJsZXMsIFtfLCBvYmpFeHByLCBrZXldKSB7XG4gIGxldCBvYmogPSBldmFsdWF0ZUV4cHJlc3Npb24ob2JqRXhwciwgbGV0aWFibGVzKVxuICByZXR1cm4gbGliLmdldChvYmosIGtleSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlRWFjaEV4cHJlc3Npb24obGV0aWFibGVzLCBleHByZXNzaW9ucykge1xuICByZXR1cm4gZXhwcmVzc2lvbnMubWFwKGUgPT4gZXZhbHVhdGVFeHByZXNzaW9uKGUsIGxldGlhYmxlcykpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnAoYXN0KSB7XG4gIGlmKGFzdCkge1xuICAgIGxldCBsZXRpYWJsZXMgPSB7fVxuXG4gICAgT2JqZWN0LmFzc2lnbihsZXRpYWJsZXMsIGJ1aWx0aW5zLm1ha2VCdWlsdGlucygpKVxuXG4gICAgbGV0IHJlc3VsdCA9IGV2YWx1YXRlRWFjaEV4cHJlc3Npb24obGV0aWFibGVzLCBhc3QpXG5cbiAgICByZXR1cm4geyByZXN1bHQsIGxldGlhYmxlcyB9XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5lcnJvcignSGFoYSwgeW91IGRpZG5cXCd0IHBhc3MgbWUgYSB0cmVlIScpXG4gIH1cbn1cbiJdfQ==