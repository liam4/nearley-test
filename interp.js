var C = require('./constants');
var lib = require('./lib');
var builtins = require('./builtins');

export class InvalidExpressionType extends Error {
  constructor(expr) {
    super('invalid expression type');
    this.expr = expr;
  }
}

export function evaluateExpression(expression, variables) {

  /*
  console.log(`Evaluating expression ${expression[0]} using` +
              `variables [${variables?Object.keys(variables):'UNDEFINED'}]`);
  */

  let temp;
  if (expression instanceof Array && expression.reduce(e => e instanceof Array)) {
    return evaluateEachExpression(e);
  } else if (expression[0] === C.FUNCTION_CALL) {
    temp = evaluateFunctionCall(variables, expression);
  } else if (expression[0] === C.VARIABLE_IDENTIFIER) {
    temp = evaluateVarabileIdentifier(variables, expression);
  } else if (expression[0] === C.VARIABLE_ASSIGN) {
    temp = evaluateVariableAssign(variables, expression);
  } else if (expression[0] === C.VARIABLE_CHANGE) {
    temp = evaluateVariableChange(variables, expression);
  } else if (expression[0] === C.FUNCTION_PRIM) {
    temp = evaluateFunctionPrim(variables, expression);
  } else if (expression[0] === C.STRING_PRIM ||
             expression[0] === C.BOOLEAN_PRIM) {
    return expression;
  } else {
    throw new InvalidExpressionType(expression);
  }

  return temp;

}

export function evaluateFunctionPrim(variables, [_, args, fnExpression]) {
  var fn = new lib.FunctionToken(fnExpression);
  fn.setScopeVariables(Object.assign({}, variables));
  fn.setArguments(args);
  return fn;
}

export function evaluateFunctionCall(variables, [_, fnExpression, args]) {
  var fn = evaluateExpression(fnExpression, variables);
  return lib.call(fn, args.map(arg => evaluateExpression(arg, variables)));
}

export function evaluateVarabileIdentifier(variables, [_, variableName]) {
  if (variableName in variables) return variables[variableName].value;
  else throw `variable ${variableName} not in [${Object.keys(variables)}]`;
}

export function evaluateVariableAssign(variables, [_, name, value]) {
  variables[name] = new lib.Variable(evaluateExpression(value, variables));
}

export function evaluateVariableChange(variables, [_, name, value]) {
  variables[name].value = value;
}

export function evaluateEachExpression(expressions, variables) {
  return expressions.map(e => evaluateExpression(e, variables));
}

export function interp(ast) {
  var variables = {};

  Object.assign(variables, builtins.makeBuiltins());

  return evaluateEachExpression(ast, variables);
}
