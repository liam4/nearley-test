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
  if (!assume(out)) {
    console.log('DERP');
  }
};

test('print("hello!");', function(res) {
  console.log('test');
  console.log('result:', res);
});
