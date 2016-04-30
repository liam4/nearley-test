module.exports = function(code, dir) {
  // this allows for `require('tulun')` in node code
  dir = dir || __dirname
  return require('./dist/run').run(code, dir)
}
