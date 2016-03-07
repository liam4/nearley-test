@{%
var C = require('./constants');

var ReturnNothing = function(d, l, r) {
  return null;
};

var JoinFirstLast = function(a) {
  return [a[0], a[a.length - 1]];
};

var ReturnFirstData = function(d) {
  return d[0];
};
%}

@builtin "whitespace.ne"

# General expression
Expression -> _Expression {% function(d) { return d[0][0]; } %}
_Expression -> VariableGetExpression | CallFunctionExpression | StringExpression

# Variable get, really just an Identifier
VariableGetExpression -> Identifier {% function(d) { return [C.VARIABLE_IDENTIFIER, d[0]] } %}

# Function call
# FUNCTION_CALL, function expression, call arguments
CallFunctionExpression -> Expression PassedArgumentList {% d => [C.FUNCTION_CALL, d[0], d[1]] %}
PassedArgumentList -> "(" _ PassedArgumentListContents _ ")" {% d => d[2] %}
PassedArgumentListContents -> Expression _ "," _ PassedArgumentListContents {% JoinFirstLast %}
                            | Expression

# String expression
StringExpression -> "\"" StringExpressionDoubleContents "\"" {% d => [C.STRING_PRIM, d[1]] %}
StringExpressionDoubleContents -> [a-zA-Z]:* {% d => d[0].join('') %}

# Generic identifier
Identifier -> [a-zA-Z]:+ {%
  function(data, location, reject) {
    return data[0].join('');
  }
%}
