console.log('');

var code = `
x => "hi";
f => fn() {
  x -> "new value!!!###@#$#$@#%$^*&^%(*^)_[]S:DLKFJ\\./<<>?,";
};
print(x);
f();
print(x);
`;

var nearley = require('nearley');
var grammar = require('./grammar');
var interp = require('./interp');

var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);

try {
  var ast = parser.feed(code).results[0];
  console.log(interp.interp(ast));
  // console.log(JSON.stringify(ast, null, 1));
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
