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
  } else if (expression[0] === C.VARIABLE_ASSIGN) {
    return evaluateVariableAssign(variables, expression);
  } else {
    throw new InvalidExpressionType(expression);
  }
};

var evaluateFunctionCall = function(variables, [_, fnExpression, args]) {
  var fn = evaluateExpression(fnExpression, variables);
  return lib.call(fn, args.map(arg => evaluateExpression(arg, variables)));
};

var evaluateVarabileIdentifier = function(variables, [_, variableName]) {
  return variables[variableName].value;
};

var evaluateVariableAssign = function(variables, [_, variableName, variableValue]) {
  variables[variableName] = new lib.Variable(variableValue);
};

module.exports = function(ast) {
  var variables = {};

  variables['print'] = new lib.Variable(new lib.FunctionToken(function(args) {
    console.log('{Print}', ...args);
  }));

  console.log(ast.map(e => evaluateExpression(e, variables)));
};
