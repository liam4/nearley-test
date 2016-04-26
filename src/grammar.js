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
    {"name": "Program$ebnf$1$subexpression$1", "symbols": ["_Program", "_"]},
    {"name": "Program$ebnf$1", "symbols": ["Program$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "Program$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Program", "symbols": ["_", "Program$ebnf$1"], "postprocess": function(d) { return d[1] ? d[1][0] : [] }},
    {"name": "_Program", "symbols": ["Command", "_", "CommandSeparator", "_", "_Program"], "postprocess": JoinRecursive},
    {"name": "_Program", "symbols": ["Command", "_", "CommandSeparator"], "postprocess": function(d) { return [d[0]] }},
    {"name": "_Program", "symbols": ["Comment", "_", "_Program"], "postprocess": function(d) { return d[2] }},
    {"name": "_Program", "symbols": ["Command"]},
    {"name": "_Program", "symbols": ["Comment"]},
    {"name": "CommandSeparator", "symbols": [{"literal":";"}]},
    {"name": "Command", "symbols": ["Expression"]},
    {"name": "Command", "symbols": ["SetPropertyUsingIdentifier"]},
    {"name": "Command", "symbols": ["VariableAssign"]},
    {"name": "Command", "symbols": ["VariableChange"]},
    {"name": "VariableAssign$string$1", "symbols": [{"literal":"="}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "VariableAssign", "symbols": ["Identifier", "_", "VariableAssign$string$1", "_", "Expression"], "postprocess": function(d) { return [C.VARIABLE_ASSIGN, d[0], d[4]] }},
    {"name": "VariableChange$string$1", "symbols": [{"literal":"-"}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "VariableChange", "symbols": ["Identifier", "_", "VariableChange$string$1", "_", "Expression"], "postprocess": function(d) { return [C.VARIABLE_CHANGE, d[0], d[4]] }},
    {"name": "Expression", "symbols": ["_Expression"], "postprocess": function(d) { return d[0][0] }},
    {"name": "_Expression", "symbols": ["CallFunctionExpression"]},
    {"name": "_Expression", "symbols": ["CallFunctionSurroundExpression"]},
    {"name": "_Expression", "symbols": ["GetPropertyUsingIdentifierExpression"]},
    {"name": "_Expression", "symbols": ["FunctionLiteral"]},
    {"name": "_Expression", "symbols": ["StringExpression"]},
    {"name": "_Expression", "symbols": ["BooleanExpression"]},
    {"name": "_Expression", "symbols": ["NumberExpression"]},
    {"name": "_Expression", "symbols": ["VariableGetExpression"]},
    {"name": "SetPropertyUsingIdentifier", "symbols": ["Expression", "_", {"literal":"."}, "_", "Identifier", "_", {"literal":">"}, "_", "Expression"], "postprocess": function(d) { return [C.SET_PROP_USING_IDENTIFIER, d[0], d[4], d[8]] }},
    {"name": "GetPropertyUsingIdentifierExpression", "symbols": ["Expression", "_", {"literal":"."}, "_", "Identifier"], "postprocess": function(d) { return [C.GET_PROP_USING_IDENTIFIER, d[0], d[4]] }},
    {"name": "FunctionLiteral$ebnf$1$subexpression$1", "symbols": ["ArgumentList", "_"]},
    {"name": "FunctionLiteral$ebnf$1", "symbols": ["FunctionLiteral$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "FunctionLiteral$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "FunctionLiteral", "symbols": ["FunctionLiteral$ebnf$1", "CodeBlock"], "postprocess": function(d) { return [C.FUNCTION_PRIM, d[0] ? d[0][0] : [], d[1]] }},
    {"name": "ArgumentList$ebnf$1", "symbols": ["ArgumentListContents"], "postprocess": id},
    {"name": "ArgumentList$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "ArgumentList", "symbols": [{"literal":"("}, "_", "ArgumentList$ebnf$1", "_", {"literal":")"}], "postprocess": function(d) { return d[2] ? d[2] : [] }},
    {"name": "ArgumentListContents", "symbols": ["Argument", "_", {"literal":","}, "_", "ArgumentListContents"], "postprocess": JoinRecursive},
    {"name": "ArgumentListContents", "symbols": ["Argument"]},
    {"name": "Argument", "symbols": ["Identifier"], "postprocess": function(d) { return {type: "normal", name: d[0]} }},
    {"name": "Argument$string$1", "symbols": [{"literal":"u"}, {"literal":"n"}, {"literal":"e"}, {"literal":"v"}, {"literal":"a"}, {"literal":"l"}, {"literal":"u"}, {"literal":"a"}, {"literal":"t"}, {"literal":"e"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Argument", "symbols": ["Argument$string$1", "__", "Identifier"], "postprocess": function(d) { return {type: "unevaluated", name: d[2]} }},
    {"name": "CodeBlock", "symbols": [{"literal":"{"}, "Program", {"literal":"}"}], "postprocess": function(d) { return d[1] }},
    {"name": "ShorthandFunctionLiteral", "symbols": ["ArgumentList", "_", {"literal":":"}, "_", "Expression"], "postprocess": function(d) { return [C.SHORTHAND_FUNCTION_PRIM, d[0], d[4]] }},
    {"name": "VariableGetExpression", "symbols": ["Identifier"], "postprocess": function(d) { return [C.VARIABLE_IDENTIFIER, d[0]] }},
    {"name": "CallFunctionExpression", "symbols": ["Expression", "_", "PassedArgumentList"], "postprocess":  function(d) {
        return [C.FUNCTION_CALL, d[0], d[2]] } },
    {"name": "PassedArgumentList$ebnf$1", "symbols": ["PassedArgumentListContents"], "postprocess": id},
    {"name": "PassedArgumentList$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "PassedArgumentList", "symbols": [{"literal":"("}, "_", "PassedArgumentList$ebnf$1", "_", {"literal":")"}], "postprocess": function(d) { return d[2] ? d[2] : [] }},
    {"name": "PassedArgumentListContents", "symbols": ["Expression", "_", {"literal":","}, "_", "PassedArgumentListContents"], "postprocess": JoinRecursive},
    {"name": "PassedArgumentListContents", "symbols": ["Expression"]},
    {"name": "CallFunctionSurroundExpression$ebnf$1", "symbols": []},
    {"name": "CallFunctionSurroundExpression$ebnf$1$subexpression$1", "symbols": ["Expression", "__"]},
    {"name": "CallFunctionSurroundExpression$ebnf$1", "symbols": ["CallFunctionSurroundExpression$ebnf$1$subexpression$1", "CallFunctionSurroundExpression$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "CallFunctionSurroundExpression", "symbols": [{"literal":"("}, "Expression", "__", "Expression", "__", "CallFunctionSurroundExpression$ebnf$1", "Expression", "_", {"literal":")"}], "postprocess":  function(d) {
          return [ C.FUNCTION_CALL, d[3], [d[1]].concat(d[5].map(a => a[0])).concat([d[6]]) ];
        } },
    {"name": "BooleanExpression", "symbols": ["_BooleanExpression"], "postprocess": function(d) { return ["BOOLEAN_PRIM", d[0][0] === "true"] }},
    {"name": "_BooleanExpression$string$1", "symbols": [{"literal":"t"}, {"literal":"r"}, {"literal":"u"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "_BooleanExpression", "symbols": ["_BooleanExpression$string$1"]},
    {"name": "_BooleanExpression$string$2", "symbols": [{"literal":"f"}, {"literal":"a"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "_BooleanExpression", "symbols": ["_BooleanExpression$string$2"]},
    {"name": "StringExpression", "symbols": ["_StringExpression"], "postprocess": function(d) { return [C.STRING_PRIM, d[0][1]] }},
    {"name": "_StringExpression", "symbols": [{"literal":"\""}, "StringExpressionDoubleContents", {"literal":"\""}]},
    {"name": "_StringExpression", "symbols": [{"literal":"'"}, "StringExpressionSingleContents", {"literal":"'"}]},
    {"name": "StringExpressionDoubleContents$ebnf$1", "symbols": []},
    {"name": "StringExpressionDoubleContents$ebnf$1", "symbols": ["DoubleStringValidCharacter", "StringExpressionDoubleContents$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "StringExpressionDoubleContents", "symbols": ["StringExpressionDoubleContents$ebnf$1"], "postprocess": function(d) { return d[0].join('') }},
    {"name": "DoubleStringValidCharacter", "symbols": ["GenericValidCharacter"], "postprocess": 
        function(data, location, reject) {
          if (data[0][0] === '"') return reject;
          else return data[0][0];
        }
        },
    {"name": "StringExpressionSingleContents$ebnf$1", "symbols": []},
    {"name": "StringExpressionSingleContents$ebnf$1", "symbols": ["SingleStringValidCharacter", "StringExpressionSingleContents$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "StringExpressionSingleContents", "symbols": ["StringExpressionSingleContents$ebnf$1"], "postprocess": function(d) { return d[0].join('') }},
    {"name": "SingleStringValidCharacter", "symbols": ["GenericValidCharacter"], "postprocess": 
        function(data, location, reject) {
          if (data[0][0] === '\'') return reject;
          else return data[0][0];
        }
        },
    {"name": "NumberExpression", "symbols": ["_Number"], "postprocess": function(d) { return [C.NUMBER_PRIM, d[0]] }},
    {"name": "_Number$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "_Number$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "_Number$ebnf$2$subexpression$1", "symbols": ["Digits", {"literal":"."}]},
    {"name": "_Number$ebnf$2", "symbols": ["_Number$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "_Number$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "_Number", "symbols": ["_Number$ebnf$1", "_Number$ebnf$2", "Digits"], "postprocess":  function(d) {
          var result = "";
        
          if (d[1]) {
            result = d[1][0] + "." + result;
          }
        
          result = result + d[2];
        
          if (d[0] === "-") {
            result = "-" + result;
          }
        
          return parseFloat(result);
        } },
    {"name": "Digits$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "Digits$ebnf$1", "symbols": [/[0-9]/, "Digits$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "Digits", "symbols": ["Digits$ebnf$1"], "postprocess": function(d) { return d[0].join('') }},
    {"name": "Identifier$ebnf$1", "symbols": ["GenericValidIdentifierCharacter"]},
    {"name": "Identifier$ebnf$1", "symbols": ["GenericValidIdentifierCharacter", "Identifier$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "Identifier", "symbols": ["Identifier$ebnf$1"], "postprocess": 
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
        },
    {"name": "GenericValidIdentifierCharacter", "symbols": ["GenericValidCharacter"], "postprocess": 
        function(data, location, reject) {
          //console.log(data[0], location)
          return data[0] && C.SPECIAL_CHARS.indexOf(data[0]) === -1 ? data[0] : reject;
        }
        },
    {"name": "GenericValidCharacter", "symbols": [/./]},
    {"name": "Comment$ebnf$1", "symbols": []},
    {"name": "Comment$ebnf$1", "symbols": [/[^#]/, "Comment$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "Comment", "symbols": [{"literal":"#"}, "Comment$ebnf$1", {"literal":"#"}], "postprocess": function(d) { return [C.COMMENT] }}
]
  , ParserStart: "Program"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
