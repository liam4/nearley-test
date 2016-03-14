var nearley = require('nearley');
var grammar = require('./grammar');
var interp = require('./interp');

export function run(code) {
  var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
  var ast = parser.feed(code).results[0];
  var result = interp.interp(ast);
  return result;
}
