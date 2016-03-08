// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

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
var grammar = {
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["wschar", "_$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["wschar", "__$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "Program$ebnf$1", "symbols": ["_Program"], "postprocess": id},
    {"name": "Program$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Program", "symbols": ["_", "Program$ebnf$1", "_"], "postprocess": function(d) { return d[1] ? d[1] : [] }},
    {"name": "_Program", "symbols": ["Expression", "_", {"literal":";"}, "_", "_Program"], "postprocess": JoinRecursive},
    {"name": "_Program", "symbols": ["Expression"]},
    {"name": "Expression", "symbols": ["_Expression"], "postprocess": function(d) { return d[0][0] }},
    {"name": "_Expression", "symbols": ["VariableAssignExpression"]},
    {"name": "_Expression", "symbols": ["VariableChangeExpression"]},
    {"name": "_Expression", "symbols": ["VariableGetExpression"]},
    {"name": "_Expression", "symbols": ["CallFunctionExpression"]},
    {"name": "_Expression", "symbols": ["StringExpression"]},
    {"name": "_Expression", "symbols": ["FunctionExpression"]},
    {"name": "FunctionExpression$string$1", "symbols": [{"literal":"f"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "FunctionExpression", "symbols": ["FunctionExpression$string$1", "_", "ArgumentList", "_", "CodeBlock"], "postprocess": function(d) { return [C.FUNCTION_PRIM, d[2], d[4]] }},
    {"name": "ArgumentList$ebnf$1", "symbols": ["ArgumentListContents"], "postprocess": id},
    {"name": "ArgumentList$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ArgumentList", "symbols": [{"literal":"("}, "_", "ArgumentList$ebnf$1", "_", {"literal":")"}], "postprocess": function(d) { return d[2] ? d[2] : [] }},
    {"name": "ArgumentListContents", "symbols": ["Identifier", "_", {"literal":","}, "_", "ArgumentListContents"], "postprocess": JoinRecursive},
    {"name": "ArgumentListContents", "symbols": ["Identifier"]},
    {"name": "CodeBlock", "symbols": [{"literal":"{"}, "Program", {"literal":"}"}], "postprocess": function(d) { return d[1] }},
    {"name": "VariableAssignExpression$string$1", "symbols": [{"literal":"="}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "VariableAssignExpression", "symbols": ["Identifier", "_", "VariableAssignExpression$string$1", "_", "Expression"], "postprocess": function(d) { return [C.VARIABLE_ASSIGN, d[0], d[4]] }},
    {"name": "VariableChangeExpression$string$1", "symbols": [{"literal":"-"}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "VariableChangeExpression", "symbols": ["Identifier", "_", "VariableChangeExpression$string$1", "_", "Expression"], "postprocess": function(d) { return [C.VARIABLE_CHANGE, d[0], d[4]] }},
    {"name": "VariableGetExpression", "symbols": ["Identifier"], "postprocess": function(d) { return [C.VARIABLE_IDENTIFIER, d[0]] }},
    {"name": "CallFunctionExpression", "symbols": ["Expression", "PassedArgumentList"], "postprocess": d => [C.FUNCTION_CALL, d[0], d[1]]},
    {"name": "PassedArgumentList$ebnf$1", "symbols": ["PassedArgumentListContents"], "postprocess": id},
    {"name": "PassedArgumentList$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "PassedArgumentList", "symbols": [{"literal":"("}, "_", "PassedArgumentList$ebnf$1", "_", {"literal":")"}], "postprocess": d => d[2] ? d[2] : []},
    {"name": "PassedArgumentListContents", "symbols": ["Expression", "_", {"literal":","}, "_", "PassedArgumentListContents"], "postprocess": JoinRecursive},
    {"name": "PassedArgumentListContents", "symbols": ["Expression"]},
    {"name": "BooleanExpression", "symbols": ["_BooleanExpression"], "postprocess": function(d) { return ["BOOLEAN_PRIM", d[0] === "true"] }},
    {"name": "_BooleanExpression$string$1", "symbols": [{"literal":"t"}, {"literal":"r"}, {"literal":"u"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "_BooleanExpression", "symbols": ["_BooleanExpression$string$1"]},
    {"name": "_BooleanExpression$string$2", "symbols": [{"literal":"f"}, {"literal":"a"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "_BooleanExpression", "symbols": ["_BooleanExpression$string$2"]},
    {"name": "StringExpression", "symbols": [{"literal":"\""}, "StringExpressionDoubleContents", {"literal":"\""}], "postprocess": d => [C.STRING_PRIM, d[1]]},
    {"name": "StringExpressionDoubleContents$ebnf$1", "symbols": []},
    {"name": "StringExpressionDoubleContents$ebnf$1", "symbols": ["GenericValidCharacter", "StringExpressionDoubleContents$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "StringExpressionDoubleContents", "symbols": ["StringExpressionDoubleContents$ebnf$1"], "postprocess": d => d[0].join('')},
    {"name": "Identifier$ebnf$1", "symbols": ["GenericValidCharacter"]},
    {"name": "Identifier$ebnf$1", "symbols": ["GenericValidCharacter", "Identifier$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "Identifier", "symbols": ["Identifier$ebnf$1"], "postprocess": 
        function(data, location, reject) {
          return data[0].join('');
        }
        },
    {"name": "GenericValidCharacter", "symbols": [/[a-zA-Z0-9]/]}
]
  , ParserStart: "Program"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
