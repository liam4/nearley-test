const GRAMMAR_OUT = 'grammar.js';
const GRAMMAR_IN = 'grammar.ne';

var fs = require('fs');
var gulp = require('gulp');

var nearley = require('./node_modules/nearley/lib/nearley.js');
var generate = require('./node_modules/nearley/lib/generate.js');
var Compile = require('./node_modules/nearley/lib/compile.js');
var StreamWrapper = require('./node_modules/nearley/lib/stream.js');

gulp.task('compile-grammar', function(cb) {
  // nearley compiling totally not a copy of
  // https://github.com/Hardmath123/nearley/blob/master/bin/nearleyc.js

  var input = fs.createReadStream(GRAMMAR_IN);
  var output = fs.createWriteStream(GRAMMAR_OUT);

  var parserGrammar = new require('./node_modules/nearley/lib/' +
                                  'nearley-language-bootstrapped.js');
  var parser = new nearley.Parser(parserGrammar.ParserRules, parserGrammar.ParserStart);

  var stream = input
    .pipe(new StreamWrapper(parser))
    .on('finish', function() {
      var c = Compile(parser.results[0], {});
      output.write(generate(c, 'grammar'));
      setTimeout(cb, 1000);
    });
});

gulp.task('default', ['compile-grammar'], function() {
  require('./index.js');
});
