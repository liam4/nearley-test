// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

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
var grammar = {
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["wschar", "_$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["wschar", "__$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "Expression", "symbols": ["_Expression"], "postprocess": function(d) { return d[0][0]; }},
    {"name": "_Expression", "symbols": ["VariableGetExpression"]},
    {"name": "_Expression", "symbols": ["CallFunctionExpression"]},
    {"name": "_Expression", "symbols": ["StringExpression"]},
    {"name": "VariableGetExpression", "symbols": ["Identifier"], "postprocess": function(d) { return [C.VARIABLE_IDENTIFIER, d[0]] }},
    {"name": "CallFunctionExpression", "symbols": ["Expression", "PassedArgumentList"], "postprocess": d => [C.FUNCTION_CALL, d[0], d[1]]},
    {"name": "PassedArgumentList", "symbols": [{"literal":"("}, "_", "PassedArgumentListContents", "_", {"literal":")"}], "postprocess": d => d[2]},
    {"name": "PassedArgumentListContents", "symbols": ["Expression", "_", {"literal":","}, "_", "PassedArgumentListContents"], "postprocess": JoinFirstLast},
    {"name": "PassedArgumentListContents", "symbols": ["Expression"]},
    {"name": "StringExpression", "symbols": [{"literal":"\""}, "StringExpressionDoubleContents", {"literal":"\""}], "postprocess": d => [C.STRING_PRIM, d[1]]},
    {"name": "StringExpressionDoubleContents$ebnf$1", "symbols": []},
    {"name": "StringExpressionDoubleContents$ebnf$1", "symbols": [/[a-zA-Z]/, "StringExpressionDoubleContents$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "StringExpressionDoubleContents", "symbols": ["StringExpressionDoubleContents$ebnf$1"], "postprocess": d => d[0].join('')},
    {"name": "Identifier$ebnf$1", "symbols": [/[a-zA-Z]/]},
    {"name": "Identifier$ebnf$1", "symbols": [/[a-zA-Z]/, "Identifier$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "Identifier", "symbols": ["Identifier$ebnf$1"], "postprocess": 
        function(data, location, reject) {
          return data[0].join('');
        }
        }
]
  , ParserStart: "Expression"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
