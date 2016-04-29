module.exports = function(code) {
  // this allows for `require('tulun')` in node code
  return require('./dist/run').run(code)
}
