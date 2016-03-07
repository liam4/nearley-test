var C = require('./constants');

var InvalidExpressionType = class extends Error {};

module.exports = function(ast) {

  console.log('');

  var evaluateExpression = function(expression) {
    if (expression[0] === C.FUNCTION_CALL) return evaluateFunctionCall(expression);
    else if (expression[0] === C.VARIABLE_IDENTIFIER) return evaluateVarabileIdentifier(expression);
    else throw 'invalid expression type';
  };

  var evaluateFunctionCall = function([_, fnExpression, argsExpression]) {
    var fn = evaluateExpression(fnExpression);
  };

  var evaluateVarabileIdentifier = function([_, variableName]) {
    console.log('get variable', variableName);
  };

  ast.forEach(evaluateExpression);
};
