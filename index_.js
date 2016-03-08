console.log('');

var code = `
a => fn(x) {
  print(x)
};
a("foo")
`;

import * as interp from './interp';

var nearley = require('nearley');
var grammar = require('./grammar');

var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);

try {
  var ast = parser.feed(code).results[0];
  interp.interp(ast);
  // console.log(JSON.stringify(ast, null, 1));
} catch(e) {
  if (e.offset) {
    console.error("Error at character " + e.offset);
  } else if (e.expr) {
    console.error(e.stack);
    console.error(e.expr);
  } else {
    throw e;
  }
}
