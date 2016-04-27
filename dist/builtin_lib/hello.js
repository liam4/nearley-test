const lib = require('../lib')

export let lol = new lib.LFunction(function() {
  console.log('Lololol!')
  return lib.toLNumber(1337)
})
