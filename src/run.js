const nearley = require('nearley')
const grammar = require('./grammar')
const interp = require('./interp')
const chalk = require('chalk')

export function run(code, dir) {
  let parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart)
  let asts

  try {
    asts = parser.feed(code).results
  } catch (e) {
    // there's been a syntax error :(

    let line = 1
    let lines = code.split('\n')
    lines.unshift('')
    for (let i = 0; i < e.offset; i++) {
      let char = code[i]
      if (char == '\n') line++
    }

    let ln = lines[line]

    if (line - 1 > 0) console.log(chalk.bold(line - 1), lines[line - 1])
    if (line) console.log(chalk.bold(line), chalk.red(ln))
    if (line + 1 < lines.length) console.log(chalk.bold(line + 1), lines[line + 1])
    console.error(chalk.red(`\nSyntax Error at ${chalk.cyan(`line ${line}`)}!`))

    process.exit(1)
  }

  if (asts.length > 1) {
    console.warn(chalk.red.bold('!! AMBIGUOUS SYNTAX !!'))
    let escape = String.fromCharCode(27)
    asts.forEach(function(ast, i) {
      console.warn(JSON.stringify(ast, null, 0))
      console.warn('\n----------------------------\n')
    })-
    console.warn(chalk.yellow(`
A total of ${chalk.cyan(asts.length)} ASTs were generated.
Please report this on the official issue tracker:
https://github.com/liam4/tlnccuwagnf/issues
Using first AST.
`))
  }

  let result = interp.interp(asts[0], dir)
  return result
}
