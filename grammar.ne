@{%
var C = require('./constants');

var ReturnNothing = function(d, l, r) {
  return null;
};

var JoinRecursive = function(a) {
  var last = a[a.length - 1];
  return [a[0], ...last];
};

var ReturnFirstData = function(d) {
  return d[0];
};
%}

@builtin "whitespace.ne"

Program -> _Program {% function(d) { return d[0] } %}
_Program -> Expression _ ";" _ Program {% JoinRecursive %}
          | Expression

# General expression
Expression -> _Expression {% function(d) { return d[0][0] } %}
_Expression -> VariableAssignExpression
             | VariableChangeExpression
             | VariableGetExpression
             | CallFunctionExpression
             | StringExpression

# Variable assign
VariableAssignExpression -> Identifier "=>" Expression {% function(d) { return [C.VARIABLE_ASSIGN, d[0], d[2]] } %}

# Variable change
VariableChangeExpression -> Identifier "->" Expression {% function(d) { return [C.VARIABLE_CHANGE, d[0], d[2]] } %}

# Variable get, really just an Identifier
VariableGetExpression -> Identifier {% function(d) { return [C.VARIABLE_IDENTIFIER, d[0]] } %}

# Function call
# FUNCTION_CALL, function expression, call arguments
CallFunctionExpression -> Expression PassedArgumentList {% d => [C.FUNCTION_CALL, d[0], d[1]] %}
PassedArgumentList -> "(" _ PassedArgumentListContents _ ")" {% d => d[2] %}
PassedArgumentListContents -> Expression _ "," _ PassedArgumentListContents {% JoinRecursive %}
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
