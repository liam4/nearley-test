'use strict'

const equal = require('deep-equal')
const chalk = require('chalk')
const run = require('../req.js')
const oldLog = console.log

let passed = 0
let tests = 0

const test = function(code, assume) {
  tests++
  const out = []
  let o = chalk.yellow('[out]')
  console.log = function(...args) {
    out.push(args)
    oldLog(o, ...args)
  }
  chalk.enabled = false
  const promise = run(code)
  promise.then(function() {
    chalk.enabled = true
    console.log = oldLog
    if (!assume(out)) {
      oldLog(chalk.red('[err]'), 'Test failed!\n      '+chalk.cyan(code)+'\n')
    } else {
      passed++
      oldLog(chalk.green('[yay]'), 'Test passed!')
    }
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

console.time('Total tests time');
// semicolon so that it doesn't think console.time(...)(async function...)

(async function() {
  try {
    console.log('Basic printing ---')

    // Test print output
    await test(`print("hello!");`, checkOut`hello!`)
    // Test print with multiple arguments
    await test(`print("hello", "world");`, checkOut([`hello`, `world`]))

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
    await test(`print('single quoted');`, checkOut`single quoted`)
    await test(`print(concat("foo", "bar"));`, checkOut`foobar`)

    console.log('Math ---')
    // Test basic math operator functions
    await test(`print(+(3, 4));`, checkOut`7`)
    await test(`print(-(3, 4));`, checkOut`-1`)
    await test(`print(*(3, 4));`, checkOut`12`)
    await test(`print(/(3, 4));`, checkOut`0.75`)
    // Test decimals
    await test(`print(+(1.25, 1.755));`, checkOut`3.005`)

    console.log('If/else ---')
    // Test basic if
    await test(`
    if(true, {
      print("good");
    });`, checkOut`good`)
    // Test ifel (if condition do this; otherwise do that)
    await test(`
    ifel(false, {
      print("bad");
    }, {
      print("good");
    });`, checkOut`good`)
    // Test else-code as optional argument to if
    await test(`
    if(false, {
      print("bad");
    }, {
      print("good");
    });`, checkOut`good`)

    console.log('Logic and comparison ---')
    // Test logic operator functions
    await test(`print(and(true, false));`, checkOut`false`)
    await test(`print(or(true, false));`, checkOut`true`)
    await test(`print(not(true));`, checkOut`false`)
    await test(`print(not(false));`, checkOut`true`)
    // Test comparison operator functions
    await test(`print(eq(10, 20));`, checkOut`false`)
    await test(`print(eq(45, 45));`, checkOut`true`)
    await test(`print(lt(10, 20));`, checkOut`true`)
    await test(`print(lt(70, 30));`, checkOut`false`)
    await test(`print(lt(45, 45));`, checkOut`false`)
    await test(`print(gt(10, 20));`, checkOut`false`)
    await test(`print(gt(70, 30));`, checkOut`true`)
    await test(`print(gt(45, 45));`, checkOut`false`)

    console.log('Surround functions ---')
    await test(`print((true and false))`, checkOut`false`)
    await test(`print((true & true))`, checkOut`true`)
    await test(`print((99 + 1))`, checkOut`100`)
    await test(`print((20 > 1))`, checkOut`true`)
    await test(`print((1 - 1))`, checkOut`0`)
    await test(`print(('this' concat 'is' 'awesome'))`, checkOut`thisisawesome`)
  } catch (error) {
    console.log = oldLog
    console.log('\x1b[31m[Errored!]\x1b[0m Error in JS:')
    console.error(error)
  }
  console.timeEnd('Total tests time')
  console.log(chalk.bold(`${passed}/${tests} passed.`))
}())
