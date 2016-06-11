'use strict'

require('string.prototype.repeat')

const equal = require('deep-equal')
const chalk = require('chalk')
const run = require('../req.js')

module.exports = function doTests() {
  const oldLog = console.log

  let passed = 0
  let tests = 0

  const area = function(title) {
    console.log('\n   ' + chalk.bold(title) + ' ' + '-'.repeat(30 - title.length))
  }

  const test = function(code, assume, title) {
    title = (title || code).toLowerCase()
    tests++
    const out = []
    console.log = function(...args) {
      out.push(args)
    }
    chalk.enabled = false
    const promise = run(code, __dirname, true)
    promise.then(function() {
      chalk.enabled = true
      console.log = oldLog
      if (!assume(out)) {
        oldLog(chalk.red(' ✗ ' + (title)))
        oldLog(out)
      } else {
        passed++
        oldLog(chalk.green(' ✓ ' + (title)))
      }
    })
    promise.catch((e) => {
      console.log = oldLog
      console.error(e)
    })
    return promise
  }

  const checkOut = function(compare) {
    // this should be called like this:
    // test(code, checkOut`compareThis`)
    // or like this:
    // test(code, checkOut(compareThese))

    return function(result) {
      return equal(result[0], compare)
    }
  }

  console.time('Total tests time')
  return (async function() {
    try {
      area('Print')
      // Test print output
      await test(`print("hello!");`, checkOut`hello!`, 'basic usage')
      // Test print with multiple arguments
      await test(`print("hello", "world");`, checkOut([`hello`, `world`]), 'Multiple Arguments')
      await test(`print({}, 123.456);`, checkOut([`function`, `123.456`]), 'Types')

      /* Commented this out. It works because of this grammar definition:
       * _Program -> ...
       *           | ...
       *           | Command
       * So a program can be a single command -- that's why this works.
       */
      /*
      try {
        // WHY IS THIS WORKING!?!?!?!?!?!??
        test('print("hello! this should not work!")\n', checkOut`hello! this should not work!`)
      } catch (err) {
        console.log('Newline as separator doesn\'t work, but it hasn\'t been' +
                    'implemented yet so that\'s okay.')
      }
      */
      // Test single quoted string
      area('Strings')
      await test(`print('single quoted');`, checkOut`single quoted`, 'Single Quotes')
      await test(`print(concat("foo", "bar"));`, checkOut`foobar`, 'Double Quotes')

      area('String Escapes')
      await test(`print('single quoted \\'escape');`, checkOut`single quoted 'escape`, 'Single Quotes')
      await test(`print("double quoted \\"escape");`, checkOut`double quoted "escape`, 'Double Quotes')
      await test(`print('newline\\\nescape');`, checkOut`newline\nescape`, 'Newline')
      await test(`print('escape \\\\escape');`, checkOut`escape \\escape`, 'Backslash')
      await test(`print('\\'single\\' and \\"double\\"')`, checkOut`'single' and "double"`, 'Single & Double Quotes')

      area('Math')
      // Test basic math operator functions
      await test(`print(+(3, 4));`, checkOut`7`, '+ add')
      await test(`print(-(3, 4));`, checkOut`-1`, '- subtract')
      await test(`print(*(3, 4));`, checkOut`12`, '* multiply')
      await test(`print(/(3, 4));`, checkOut`0.75`, '/ divide')
      // Test decimals
      await test(`print(+(1.25, 1.755));`, checkOut`3.005`, '  decimals')

      area('Conditionals')
      // Test basic if
      await test(`
      if(true, {
        print("good");
      });`, checkOut`good`, 'if')
      // Test ifel (if condition do this; otherwise do that)
      await test(`
      ifel(false, {
        print("bad");
      }, {
        print("good");
      });`, checkOut`good`, 'ifel')
      // Test else-code as optional argument to if
      await test(`
      if(false, {
        print("bad");
      }, {
        print("good");
      });`, checkOut`good`, 'else')

      area('Logic & Comparison')
      // Test logic operator functions
      await test(`print(and(true, false));`, checkOut`false`, '& and')
      await test(`print(or(true, false));`, checkOut`true`, '| or')
      await test(`print(not(true), not(false));`, checkOut([`false`, 'true']), '! not')
      // Test comparison operator functions
      await test(`print(eq(10, 20), eq(45, 45));`, checkOut([`false`, `true`]), '= eq')
      await test(`print(lt(10, 20), lt(70, 30), lt(45, 45));`, checkOut([`true`, `false`, `false`]), '< lt')
      await test(`print(gt(10, 20), gt(70, 30), gt(45, 45));`, checkOut([`false`, `true`, `false`]), '> gt')

      area('Surround Functions')
      await test(`print((true and false), (true & true), (99 + 1), (1 - 1), (20 > 1))`, checkOut([
        `false`,
        `true`,
        `100`,
        `0`,
        `true`
      ]), 'basic usage')
      await test(`print(('this' concat 'is' 'awesome'))`, checkOut`thisisawesome`, 'tertiary argument')

      area('Variables')
      await test(`foo => 'bar'; print(foo);`, checkOut`bar`, 'assigning & accessing')
      await test(`foo => 'bar'; foo -> 'baz'; print(foo);`, checkOut`baz`, 'changing')

    } catch (error) {
      console.log = oldLog
      console.log('\x1b[31m[Errored!]\x1b[0m Error in JS:')
      console.error(error.stack)
      process.exit(1)
    }
    console.log('\n');
    console.timeEnd('Total tests time')
    console.log(chalk.bold(`${passed}/${tests} tests passed.`))

    if(passed < tests) process.exit(1)
  }())
}
