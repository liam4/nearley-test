console.log('');

var code = `
x => obj();
x.y > obj();
x.y.z > "42";
print(x.y.z);
`;

var nearley = require('nearley');
var grammar = require('./grammar');
var interp = require('./interp');

var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);

try {
  var ast = parser.feed(code).results[0];
  var result = interp.interp(ast);
  // console.log('result:', interp.interp(ast));
  // console.log('code:', JSON.stringify(ast, null, 4));
} catch(e) {
  if (e.offset) {
    console.error("Syntax error on character " + e.offset);
    var i = e.offset;
    var line = '';
    while (code[i] && code[i] !== '\n') {
      line = code[i] + line;
      i--;
    }
    var lineStartOff = i + 1;
    i = e.offset + 1;
    while (code[i] && code[i] !== '\n') {
      line = line + code[i];
      i++;
    }
    console.error('line:\n' + line + '\n' + ' '.repeat(e.offset - lineStartOff) + '^');
  } else if (e.expr) {
    console.error(e.stack);
    console.error(e.expr);
  } else {
    throw e;
  }
}
