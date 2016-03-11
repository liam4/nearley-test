var code = `

# Variable assign..                             #
#  v--- Variable identifier                     #
#  v    vvvv--- A boolean literal.              #
   x => true;

#  v--- Get a variable using identifier "if",   #
#  |    this is built-in so all programs will   #
#  |    automatically have "if" as a variable.  #
#  |  v--- Get a variable using identifier "x", #
#  |  |    which we assigned earlier.           #
#  |  |  vvvvvv--- A function literal.          #
   if(x, fn() {

#    vvvvv--- Get a variable using identifier   #
#    |||||    "print", which is also built-in.  #
#    ||||| vvvvvvvv--- A string literal.        #
     print("Hello!");

   });

`;

var nearley = require('nearley');
var grammar = require('./grammar');
var interp = require('./interp');

var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);

try {
  var asts = parser.feed(code).results;
  var ast = asts[0];
  var result = interp.interp(ast);
  // console.log('result:', result);
  // console.log('all ASTs:', JSON.stringify(asts, null, 1));
  // console.log('AST:', JSON.stringify(ast, null, 1));
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
