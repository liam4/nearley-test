var C = require('./constants');
var lib = require('./lib');

var InvalidExpressionType = class extends Error {
  constructor(expr) {
    super('invalid expression type');
    this.expr = expr;
  }
};

var evaluateExpression = function(expression, variables) {

  let temp;
  if (expression[0] === C.FUNCTION_CALL) {
    temp = evaluateFunctionCall(variables, expression);
  } else if (expression[0] === C.VARIABLE_IDENTIFIER) {
    temp = evaluateVarabileIdentifier(variables, expression);
  } else if (expression[0] === C.VARIABLE_ASSIGN) {
    temp = evaluateVariableAssign(variables, expression);
  } else if (expression[0] === C.FUNCTION_PRIM) {
    temp = evaluateFunctionPrim(variables, expression);
  } else {
    throw new InvalidExpressionType(expression);
  }

  // fixes "pointer" issue
  // guess this is bad code but idk/c :)
  /*
  if (temp && temp[0] === C.VARIABLE_IDENTIFIER) {
    return evaluateExpression(temp, variables);
  }
  */

  return temp;

};

var evaluateFunctionPrim = function(variables, [_, args, fnExpression]) {
  var fn = new lib.FunctionToken(fnExpression);
  fn.setScopeVariables(Object.assign({}, variables));
  fn.setArguments(args);
  return fn;
};

var evaluateFunctionCall = function(variables, [_, fnExpression, args]) {
  var fn = evaluateExpression(fnExpression, variables);
  return lib.call(fn, args.map(arg => evaluateExpression(arg, variables)));
};

var evaluateVarabileIdentifier = function(variables, [_, variableName]) {
  return variables[variableName].value;
};

var evaluateVariableAssign = function(variables, [_, variableName, variableValue]) {
  variables[variableName] = new lib.Variable(evaluateExpression(variableValue));
};

module.exports = function(ast) {
  var variables = {};

  variables['print'] = new lib.Variable(new lib.FunctionToken(function(args) {
    console.log('{Print}', ...args);
  }));

  console.log(ast.map(e => evaluateExpression(e, variables)));
};
