var lib = require('../lib');

export var lol = new lib.LFunction(function() {
  console.log("Lololol!");
  return lib.toLNumber(1337);
});
