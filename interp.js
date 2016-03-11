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
  let temp;
  if (expression[0] === C.COMMENT) {
    return;
  } else if (expression instanceof Array && expression.reduce(e => e instanceof Array)) {
    temp = evaluateEachExpression(expression, variables);
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
             expression[0] === C.BOOLEAN_PRIM ||
             expression[0] === C.NUMBER_PRIM) {
    return evaluatePrim(variables, expression);
  } else if (expression[0] === C.SET_PROP_USING_IDENTIFIER) {
    temp = evaluateSetPropUsingIdentifier(variables, expression);
  } else if (expression[0] === C.GET_PROP_USING_IDENTIFIER) {
    temp = evaluateGetPropUsingIdentifier(variables, expression);
  } else if (expression[0] === C.RETURN_COMMAND) {
    temp = evaluateReturn(variables, expression);
  } else {
    throw new InvalidExpressionType(expression);
  }
  return temp;
}

export function evaluateReturn(variables, [_, returnExpression]) {
  var res = evaluateExpression(returnExpression, variables);
  console.log('got return:', res);
};

export function evaluatePrim(variables, [type, data]) {
  if (type === C.STRING_PRIM) {
    return lib.toLString(data);
  } else if (type === C.BOOLEAN_PRIM) {
    return lib.toLBoolean(data);
  } else if (type === C.NUMBER_PRIM) {
    return lib.toLNumber(data);
  }
}

export function evaluateFunctionPrim(variables, [_, args, fnExpression]) {
  var fn = new lib.LFunction(fnExpression);
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

export function evaluateSetPropUsingIdentifier(variables, [_, objExpr, key, valueExpr]) {
  var obj = evaluateExpression(objExpr, variables);
  var value = evaluateExpression(valueExpr, variables);
  lib.set(obj, key, value);
  obj[key] = value;
}

export function evaluateGetPropUsingIdentifier(variables, [_, objExpr, key]) {
  var obj = evaluateExpression(objExpr, variables);
  return lib.get(obj, key);
}

export function evaluateEachExpression(expressions, variables) {
  var temp = expressions.map(e => evaluateExpression(e, variables));
  return temp;
}

export function interp(ast) {
  if (ast) {
    var variables = {};

    Object.assign(variables, builtins.makeBuiltins());

    return evaluateEachExpression(ast, variables);
  } else {
    console.error('Haha, you didn\'t past me a tree!');
  }
}
