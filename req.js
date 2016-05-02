const chalk = require('chalk')

module.exports = function(code, dir) {
  // this allows for `require('tulun')` in node code
  dir = dir || __dirname
  require('./dist/run').run(code, dir).catch(function(err) {
    // promises/async swallows errors by default ;-;
    console.log(chalk.red('Error:'), err.message)
    process.exit(1)
  })
}
