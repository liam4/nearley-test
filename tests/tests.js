'use strict';

// idk, 109C wants me to make this.

const { run } = require('../dist/run');

const test = function(code, assume) {
  const oldLog = console.log;
  const out = [];
  console.log = function(...args) {
    out.push(args);
    oldLog('[test]', args);
  }
  run(code);
  console.log = oldLog;
  console.log('OUTPUT', out);
  if (!assume(out)) {
    console.log('DERP');
  }
};

try {
  // test('print("hello!");', r => r[0][1] === 'hello!');
  test('print("hello!")\n', r => r[0][1] === 'hello!');
  // test('print("hello!")', r => r[0][1] === 'hello!');
} catch(error) {
  console.log('Error!');
  console.error(error);
}
