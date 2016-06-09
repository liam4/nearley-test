'use strict'

var GRAMMAR_OUT = 'src/grammar.js'
var GRAMMAR_IN = 'src/grammar.ne'

var fs = require('fs')
var gulp = require('gulp')

var babel = require('gulp-babel')
var sourcemaps = require('gulp-sourcemaps')
var concat = require('gulp-concat')

var nearley = require('./node_modules/nearley/lib/nearley.js')
var generate = require('./node_modules/nearley/lib/generate.js')
var Compile = require('./node_modules/nearley/lib/compile.js')
var StreamWrapper = require('./node_modules/nearley/lib/stream.js')

gulp.task('compile-grammar', function(cb) {
  // nearley compiling totally not a copy of
  // https://github.com/Hardmath123/nearley/blob/master/bin/nearleyc.js

  var input = fs.createReadStream(GRAMMAR_IN)
  var output = fs.createWriteStream(GRAMMAR_OUT)

  var parserGrammar = new require('./node_modules/nearley/lib/' +
                                  'nearley-language-bootstrapped.js')
  var parser = new nearley.Parser(parserGrammar.ParserRules, parserGrammar.ParserStart)

  var stream = input
    .pipe(new StreamWrapper(parser))
    .on('finish', function() {
      var c = Compile(parser.results[0], {})
      output.write(generate(c, 'grammar'))
      cb()
    })
})

gulp.task('copy-all', ['compile-grammar'], function() {
  return gulp.src('src/**/*')
    .pipe(gulp.dest('dist'))
})

gulp.task('build', ['copy-all'], function() {
  console.log('Building...')
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
      .pipe(babel({
        "presets": ["es2015"],
        "plugins": [
          "transform-async-to-generator",
          "transform-runtime"
        ]
      }))
      //.pipe(concat('all.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
})

gulp.task('default', ['build'], function() {})

gulp.task('watch', ['default'], function() {
  gulp.watch('./*/**/*.tul', ['default'])
})

gulp.task('test', ['default'], function(cb) {
  var doTests = require('./dist/tests')
  doTests()
    .then(function() { cb() })
})
