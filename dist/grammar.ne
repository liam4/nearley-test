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

Program -> _ (_Program _):? {% function(d) { return d[1] ? d[1][0] : [] } %}
_Program -> Command _ CommandSeparator _ _Program {% JoinRecursive %}
          | Command _ CommandSeparator {% function(d) { return [d[0]] } %}
          | Comment _ _Program {% function(d) { return d[2] } %}
          | Command
          | Comment
CommandSeparator -> ";"

# Command
Command -> Expression
         | SetPropertyUsingIdentifier
         | VariableAssign
         | VariableChange

# Variable assign
VariableAssign -> Identifier _ "=>" _ Expression {% function(d) { return [C.VARIABLE_ASSIGN, d[0], d[4]] } %}

# Variable change
VariableChange -> Identifier _ "->" _ Expression {% function(d) { return [C.VARIABLE_CHANGE, d[0], d[4]] } %}

# General expression
Expression -> _Expression {% function(d) { return d[0][0] } %}
_Expression -> CallFunctionExpression
             | CallFunctionSurroundExpression
             | GetPropertyUsingIdentifierExpression
             | FunctionLiteral
            #| ShorthandFunctionLiteral
             | StringExpression
             | BooleanExpression
             | NumberExpression
             | VariableGetExpression

# Set using identifier expression
SetPropertyUsingIdentifier -> Expression _ "." _ Identifier _ ">" _ Expression {% function(d) { return [C.SET_PROP_USING_IDENTIFIER, d[0], d[4], d[8]] } %}

# Get using identifier expression
GetPropertyUsingIdentifierExpression -> Expression _ "." _ Identifier {% function(d) { return [C.GET_PROP_USING_IDENTIFIER, d[0], d[4]] } %}

# Function expression
FunctionLiteral -> ("async" _):? (ArgumentList _):? CodeBlock {% function(d) { return [C.FUNCTION_PRIM, d[1] ? d[1][0] : [], d[2], !!d[0]] } %}
ArgumentList -> "(" _ ArgumentListContents:? _ ")" {% function(d) { return d[2] ? d[2] : [] } %}
ArgumentListContents -> Argument _ "," _ ArgumentListContents {% JoinRecursive %}
                      | Argument
Argument -> Identifier {% function(d) { return {type: "normal", name: d[0]} } %}
          | "unevaluated" __ Identifier {% function(d) { return {type: "unevaluated", name: d[2]} } %}
CodeBlock -> "{" Program "}" {% function(d) { return d[1] } %}

# Shorthand function literals. These arent implemented yet!
ShorthandFunctionLiteral -> ArgumentList _ ":" _ Expression {% function(d) { return [C.SHORTHAND_FUNCTION_PRIM, d[0], d[4]] } %}

# Variable get, really just an Identifier
VariableGetExpression -> Identifier {% function(d) { return [C.VARIABLE_IDENTIFIER, d[0]] } %}

# Function call
CallFunctionExpression -> Expression _ PassedArgumentList {% function(d) {
  return [C.FUNCTION_CALL, d[0], d[2]] } %}
PassedArgumentList -> "(" _ PassedArgumentListContents:? _ ")" {% function(d) { return d[2] ? d[2] : [] } %}
PassedArgumentListContents -> Expression _ "," _ PassedArgumentListContents {% JoinRecursive %}
                            | Expression

# Surround function call
# This is kind of confusing -- here's a paste from my workfile to explain:
#
# Implement magic things so that you can do this:
#
#   (arg1 fn arg2)
#
# as well as this:
#
#   fn(arg1, arg2)
#
# That makes this possible:
#
#   (3 + 4)
#
# instead of this:
#
#   +(3, 4)
#
# Ambiguity as to order of operations is easy -- the new function call syntax
# must always be wrapped in parenthesis.
#
# That means you HAVE to do this:
#
#   ((3 * 2) - (4 / 2))
#
# instead of this:
#
#   (3 * 2 - 4 / 2)
#
# ..but hey, it makes the order you're doing things clearer anyways.
CallFunctionSurroundExpression -> "(" Expression __ Expression __ (Expression __):* Expression _ ")" {% function(d) {
  return [ C.FUNCTION_CALL, d[3], [d[1]].concat(d[5].map(a => a[0])).concat([d[6]]) ];
} %}

# Boolean expression
BooleanExpression -> _BooleanExpression {% function(d) { return ["BOOLEAN_PRIM", d[0][0] === "true"] } %}
_BooleanExpression -> "true" | "false"

# String expression
StringExpression -> _StringExpression {% function(d) { return [C.STRING_PRIM, d[0][1]] } %}
_StringExpression -> "\"" StringExpressionDoubleContents "\""
                   | "'" StringExpressionSingleContents "'"
StringExpressionDoubleContents -> DoubleStringValidCharacter:* {% function(d) { return d[0].join('') } %}
DoubleStringValidCharacter -> EscapeCode | GenericValidCharacter {%
  function(data, location, reject) {
    if (data[0][0] === '"') return reject;
    else return data[0][0];
  }
%}
StringExpressionSingleContents -> SingleStringValidCharacter:* {% function(d) { return d[0].join('') } %}
SingleStringValidCharacter -> EscapeCode | GenericValidCharacter {%
  function(data, location, reject) {
    if (data[0][0] === '\'') return reject;
    else return data[0][0];
  }
%}

EscapeCode -> "\\" (. | "\n") {% function(d) { return d[1][0]; } %}

# Number expression
NumberExpression -> _Number {% function(d) { return [C.NUMBER_PRIM, d[0]] } %}
_Number -> "-":? (Digits "."):? Digits {% function(d) {
  var result = "";

  if (d[1]) {
    result = d[1][0] + "." + result;
  }

  result = result + d[2];

  if (d[0] === "-") {
    result = "-" + result;
  }

  return parseFloat(result);
} %}
Digits -> [0-9]:+ {% function(d) { return d[0].join('') } %}

# Generic identifier
Identifier -> GenericValidIdentifierCharacter:+ {%
  function(data, location, reject) {
    var id = data[0].join('');
    if (/[0-9]/.test(id[0])) {
      return reject;
    }
    if (C.KEYWORDS.indexOf(id) === -1) {
      return id;
    }
    return reject;
  }
%}
GenericValidIdentifierCharacter -> . {%
  function(data, location, reject) {
    //console.log(data[0], location)
    return data[0] && C.SPECIAL_CHARS.indexOf(data[0]) === -1 ? data[0] : reject;
  }
%}

GenericValidCharacter -> . {%
  function(data, location, reject) {
    return data[0] === '\\' ? reject : data
  }
%}

Comment -> "#" [^#]:* "#" {% function(d) { return [C.COMMENT] } %}
