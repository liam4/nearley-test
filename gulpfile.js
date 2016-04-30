'use strict'

const GRAMMAR_OUT = 'src/grammar.js'
const GRAMMAR_IN = 'src/grammar.ne'

const fs = require('fs')
const gulp = require('gulp')

const babel = require('gulp-babel')

const nearley = require('./node_modules/nearley/lib/nearley.js')
const generate = require('./node_modules/nearley/lib/generate.js')
const Compile = require('./node_modules/nearley/lib/compile.js')
const StreamWrapper = require('./node_modules/nearley/lib/stream.js')

gulp.task('compile-grammar', function(cb) {
  // nearley compiling totally not a copy of
  // https://github.com/Hardmath123/nearley/blob/master/bin/nearleyc.js

  let input = fs.createReadStream(GRAMMAR_IN)
  let output = fs.createWriteStream(GRAMMAR_OUT)

  let parserGrammar = new require('./node_modules/nearley/lib/' +
                                  'nearley-language-bootstrapped.js')
  let parser = new nearley.Parser(parserGrammar.ParserRules, parserGrammar.ParserStart)

  let stream = input
    .pipe(new StreamWrapper(parser))
    .on('finish', function() {
      let c = Compile(parser.results[0], {})
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
    .pipe(babel())
    .pipe(gulp.dest('dist'))
})

gulp.task('default', ['build'], function() {})

gulp.task('watch', ['default'], function() {
  gulp.watch('./*/**/*.tul', ['default'])
})

gulp.task('test', ['default'], function() {
  setImmediate(function() {
    require('./dist/tests')
  })
})
