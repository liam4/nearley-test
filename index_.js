console.log('');

var code = `print("hi", "world", "banana")`;

var nearley = require('nearley');
var grammar = require('./grammar');

var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);

var interp = require("./interp");
try {
  var ast = parser.feed(code).results;
  // interp(ast);
  console.log(JSON.stringify(ast, null, 1));
} catch(e) {
  if (e.offset) {
    console.error("Error at character " + e.offset);
  } else if (e.expr) {
    console.error(e.toString());
    console.error(e.expr);
  } else {
    throw e;
  }
}
