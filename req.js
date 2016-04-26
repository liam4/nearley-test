module.exports = function(code) {
  // this allows for `require('tulun')` in node code
  require('./dist/run').run(code)
}
