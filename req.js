const chalk = require('chalk')

module.exports = function(code, dir, isTesting) {
  // this allows for `require('tulun')` in node code
  dir = dir || __dirname
  if (isTesting) {
    return require('./dist/run').run(code, dir)
  }

  return require('./dist/run').run(code, dir).catch(function(err) {
    // promises/async swallows errors by default ;-;
    console.log(chalk.red('Error:'), err.message)
    process.exit(1)
  })
}
