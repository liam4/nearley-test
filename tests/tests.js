'use strict'

const run = require('../dist/run').run
const oldLog = console.log

const test = function(code, assume) {
  const out = []
  console.log = function(...args) {
    out.push(args)
    oldLog('\x1b[33;2m[Test Output]\x1b[39m', ...args, '\x1b[0m')
  }
  run(code)
  console.log = oldLog
  if (!assume(out)) {
    oldLog(`\x1b[31m[Errored!]\x1b[0m Assumption failed:\n\x1b[36m${code}\x1b[0m`)
  }
}

const checkOut = function(compare) {
  // this should be called like this:
  // test(code, checkOut`compareThis`)

  // compare: [ compareThis ]
  return function(result) {
    // result: [ [ '{Print}', compareThis ] ]
    return result[0][1] === compare[0]
  }
}

try {
  console.log('Basic printing ---')
  test('print("hello!");', checkOut`hello!`)

  try {
    // WHY IS THIS WORKING!?!?!?!?!?!??
    test('print("hello! this should not work!")\n', checkOut`hello! this should not work!`)
  } catch (err) {
    console.log('Newline as separator doesn\'t work, but it hasn\'t been' +
                'implemented yet so that\'s okay.')
  }
  test('print("hello!")', checkOut`hello!`)
  test("print('single quoted');", checkOut`single quoted`)

  console.log('Math ---')
  test('print(+(3, 4));', checkOut`7`)
  test('print(-(3, 4));', checkOut`-1`)
  test('print(*(3, 4));', checkOut`12`)
  test('print(/(3, 4));', checkOut`0.75`)
  test('print(+(1.25, 1.755));', checkOut`3.005`)

  console.log('If/else ---')
  test(`if(true, fn() {print("good"); });`, checkOut`good`)
} catch (error) {
  console.log = oldLog
  console.log('\x1b[31m[Errored!]\x1b[0m Error in JS:')
  console.error(error)
}
