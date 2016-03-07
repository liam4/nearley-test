var C = require('./constants');
var lib = require('./lib');

var InvalidExpressionType = class extends Error {
  constructor(expr) {
    super('invalid expression type');
    this.expr = expr;
  }
};

var evaluateExpression = function(expression, variables) {
  if (expression[0] === C.FUNCTION_CALL) {
    return evaluateFunctionCall(variables, expression);
  } else if (expression[0] === C.VARIABLE_IDENTIFIER) {
    return evaluateVarabileIdentifier(variables, expression);
  } else {
    throw new InvalidExpressionType(expression);
  }
};

var evaluateFunctionCall = function(variables, [_, fnExpression, args]) {
  var fn = evaluateExpression(fnExpression, variables);
  return lib.call(fn, args);
};

var evaluateVarabileIdentifier = function(variables, [_, variableName]) {
  return variables[variableName].value;
};

module.exports = function(ast) {
  console.log('');

  var variables = {};

  variables['print'] = new lib.Variable(new lib.FunctionToken(function(args) {
    console.log('{Print}', ...args);
  }));

  console.log(ast.map(e => evaluateExpression(e, variables)));
};
