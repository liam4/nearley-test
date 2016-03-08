var C = require('./constants');
var lib = require('./lib');

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
  if (expression[0] === C.FUNCTION_CALL) {
    temp = evaluateFunctionCall(variables, expression);
  } else if (expression[0] === C.VARIABLE_IDENTIFIER) {
    temp = evaluateVarabileIdentifier(variables, expression);
  } else if (expression[0] === C.VARIABLE_ASSIGN) {
    temp = evaluateVariableAssign(variables, expression);
  } else if (expression[0] === C.FUNCTION_PRIM) {
    temp = evaluateFunctionPrim(variables, expression);
  } else if (expression[0] === C.STRING_PRIM) {
    return expression;
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

}

export function evaluateFunctionPrim(variables, [_, args, fnExpression]) {
  var fn = new lib.FunctionToken(fnExpression[0]);
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

export function evaluateVariableAssign(variables, [_, variableName, variableValue]) {
  variables[variableName] = new lib.Variable(evaluateExpression(variableValue, variables));
}

export function interp(ast) {
  var variables = {};

  variables['print'] = new lib.Variable(new lib.FunctionToken(function(args) {
    console.log('{Print}', ...args);
  }));

  console.log(ast.map(e => evaluateExpression(e, variables)));
}
