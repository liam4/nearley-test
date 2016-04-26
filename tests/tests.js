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
  console.log = function() {
    let args = [].slice.call(arguments, 0)
    out.push(args)
    oldLog(o, ...args)
  }
  chalk.enabled = false
  run(code)
  chalk.enabled = true
  console.log = oldLog
  if (!assume(out)) {
    oldLog(chalk.red('[err]'), 'Test failed!\n      '+chalk.cyan(code)+'\n')
  } else {
    passed++
    oldLog(chalk.green('[yay]'), 'Test passed!')
  }
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
try {
  console.log('Basic printing ---')

  // Test print output
  test(`print("hello!");`, checkOut`hello!`)
  // Test print with multiple arguments
  test(`print("hello", "world");`, checkOut([`hello`, `world`]))

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
  test(`print('single quoted');`, checkOut`single quoted`)
  test(`print(concat("foo", "bar"));`, checkOut`foobar`)

  console.log('Math ---')
  // Test basic math operator functions
  test(`print(+(3, 4));`, checkOut`7`)
  test(`print(-(3, 4));`, checkOut`-1`)
  test(`print(*(3, 4));`, checkOut`12`)
  test(`print(/(3, 4));`, checkOut`0.75`)
  // Test decimals
  test(`print(+(1.25, 1.755));`, checkOut`3.005`)

  console.log('If/else ---')
  // Test basic if
  test(`
  if(true, {
    print("good");
  });`, checkOut`good`)
  // Test ifel (if condition do this; otherwise do that)
  test(`
  ifel(false, {
    print("bad");
  }, {
    print("good");
  });`, checkOut`good`)
  // Test else-code as optional argument to if
  test(`
  if(false, {
    print("bad");
  }, {
    print("good");
  });`, checkOut`good`)

  console.log('Logic and comparison ---')
  // Test logic operator functions
  test(`print(and(true, false));`, checkOut`false`)
  test(`print(or(true, false));`, checkOut`true`)
  test(`print(not(true));`, checkOut`false`)
  test(`print(not(false));`, checkOut`true`)
  // Test comparison operator functions
  test(`print(eq(10, 20));`, checkOut`false`)
  test(`print(eq(45, 45));`, checkOut`true`)
  test(`print(lt(10, 20));`, checkOut`true`)
  test(`print(lt(70, 30));`, checkOut`false`)
  test(`print(lt(45, 45));`, checkOut`false`)
  test(`print(gt(10, 20));`, checkOut`false`)
  test(`print(gt(70, 30));`, checkOut`true`)
  test(`print(gt(45, 45));`, checkOut`false`)
} catch (error) {
  console.log = oldLog
  console.log('\x1b[31m[Errored!]\x1b[0m Error in JS:')
  console.error(error)
}
console.timeEnd('Total tests time')
console.log(chalk.bold(`${passed}/${tests} passed.`))
