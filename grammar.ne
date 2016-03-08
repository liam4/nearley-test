@{%
var C = require('./constants');

var ReturnNothing = function(d, l, r) {
  return null;
};

var JoinRecursive = function(a) {
  // not really sure how this works but it's magic and fixes everything
  // todo: figure out how it works
  var last = a[a.length - 1];
  return [a[0], ...last];
};
%}

@builtin "whitespace.ne"

Program -> _ _Program:? _ {% function(d) { return d[1] ? d[1] : [] } %}
_Program -> Expression _ ExpressionSeparator _ _Program {% JoinRecursive %}
          | Expression _ ExpressionSeparator _ {% function(d) { return [d[0]] } %}
ExpressionSeparator -> ";"

# General expression
Expression -> _Expression {% function(d) { return d[0][0] } %}
_Expression -> VariableAssignExpression
             | VariableChangeExpression
             | VariableGetExpression
             | CallFunctionExpression
             | StringExpression
             | FunctionExpression
             | BooleanExpression

# Function expression
FunctionExpression -> "fn" _ ArgumentList _ CodeBlock {% function(d) { return [C.FUNCTION_PRIM, d[2], d[4]] } %}
ArgumentList -> "(" _ ArgumentListContents:? _ ")" {% function(d) { return d[2] ? d[2] : [] } %}
ArgumentListContents -> Identifier _ "," _ ArgumentListContents {% JoinRecursive %}
                      | Identifier

CodeBlock -> "{" Program "}" {% function(d) { return d[1] } %}

# Variable assign
VariableAssignExpression -> Identifier _ "=>" _ Expression {% function(d) { return [C.VARIABLE_ASSIGN, d[0], d[4]] } %}

# Variable change
VariableChangeExpression -> Identifier _ "->" _ Expression {% function(d) { return [C.VARIABLE_CHANGE, d[0], d[4]] } %}

# Variable get, really just an Identifier
VariableGetExpression -> Identifier {% function(d) { return [C.VARIABLE_IDENTIFIER, d[0]] } %}

# Function call
CallFunctionExpression -> Expression _ PassedArgumentList {% d => [C.FUNCTION_CALL, d[0], d[2]] %}
PassedArgumentList -> "(" _ PassedArgumentListContents:? _ ")" {% d => d[2] ? d[2] : [] %}
PassedArgumentListContents -> Expression _ "," _ PassedArgumentListContents {% JoinRecursive %}
                            | Expression

# Boolean expression
BooleanExpression -> _BooleanExpression {% function(d) { return ["BOOLEAN_PRIM", d[0][0] === "true"] } %}
_BooleanExpression -> "true" | "false"

# String expression
StringExpression -> "\"" StringExpressionDoubleContents "\"" {% d => [C.STRING_PRIM, d[1]] %}
StringExpressionDoubleContents -> DoubleStringValidCharacter:* {% d => d[0].join('') %}
DoubleStringValidCharacter -> GenericValidCharacter {%
  function(data, location, reject) {
    if (data[0] === '"') return reject;
    else return data[0];
  }
%}

# Generic identifier
Identifier -> GenericValidIdentifierCharacter:+ {%
  function(data, location, reject) {
    return data[0].join('');
  }
%}
GenericValidIdentifierCharacter -> GenericValidCharacter {%
  function(data, location, reject) {
    return data[0] && C.SPECIAL_CHARS.indexOf(data[0]) === -1 ? data[0] : reject;
  }
%}

GenericValidCharacter -> .
