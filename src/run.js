'use strict'

const nearley = require('nearley')
const grammar = require('./grammar')
const interp = require('./interp')
const chalk = require('chalk')

export function run(code, fsScope) {
  fsScope = fsScope || __dirname

  let parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart)
  let asts = parser.feed(code).results

  if(asts.length > 1) {
    /*
    console.log(
chalk.yellow(`${chalk.red(`${chalk.bold('Warning')}: ambiguous syntax!`)}
A total of ${asts.length} ASTs were generated.
Please report this on the official issue tracker:
${chalk.cyan('https://github.com/nanalan/tlnccuwagnf/issues')}.
Using first AST as a fallback...
      `)
    */
  }

  var result = interp.interp(asts, fsScope)
  return result
}
