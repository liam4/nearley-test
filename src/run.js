const nearley = require('nearley')
const grammar = require('./grammar')
const interp = require('./interp')

export function run(code, options) {
  let parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart)
  let asts = parser.feed(code).results

  if(asts.length > 1) {
    console.warn('!! AMBIGUOUS SYNTAX !!')
    let escape = String.fromCharCode(27)
    asts.forEach(function(ast, i) {
      console.warn(JSON.stringify(ast, null, 0))
      console.warn('\n----------------------------\n')
    })
    console.warn(`
A total of ${asts.length} ASTs were generated.
Please report this on the official issue tracker:
https://github.com/liam4/tlnccuwagnf/issues
Using first AST.
`)
  }

  let result = interp.interp(asts[0], options)
  return result
}
