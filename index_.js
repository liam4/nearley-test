console.log('');

var code = `
thing_descriptor => obj();
thing_descriptor.init > fn(self, name) {
  self.name > name;
  print("You set my name to");
  print(name);
};
thing_descriptor.msg > fn(self) {
  print("Hello! My name is");
  print(self.name);
};
thing => class(thing_descriptor);
instance => construct(thing);
instance.init("Foo");
instance.msg();
`;

/*
var code = `

thing_descriptor => obj();
thing_descriptor.x > fn() {
  print("x");
};
declared_after_x => "hi";
thing_descriptor.y > fn() {
  print("y");
};
thing => class(thing_descriptor);
instance => construct(thing);
instance.x();
instance.y();

`;
*/

/*
var code = `
x => obj();
x . y > "Hi";
print(x.y);
`;
*/

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
