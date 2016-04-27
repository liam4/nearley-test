'use strict'

const rl = require('readline-sync')
const tulun = require('../req.js')

module.exports = function(lib, fsScope) {
  return lib.toLObject({
    run: new lib.LFunction(function(args) {
      tulun(lib.toJString(args[0]), fsScope)
    }),

    forever: new lib.LFunction(function(args) {
      while (true) {
        if (lib.toJString(lib.call(args[0])) === 'finish') {
          break
        }
      }
    }),

    prompt: new lib.LFunction(function(args) {
      return lib.toLString(rl.prompt())
    })
  })
}
