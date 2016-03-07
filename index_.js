var code = `print("hi")`;

var nearley = require('nearley');
var grammar = require('./grammar');

var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);

var interp = require("./interp");
try {
  var ast = parser.feed(code).results;
  interp(ast);
} catch(parseError) {
  if (parseError.offset) {
    console.log("Error at character " + parseError.offset);
  } else {
    throw parseError;
  }
}
