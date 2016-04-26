'use strict'

const fs = require('fs')
const chalk = require('chalk')

module.exports = function(lib, fsScope) {
  return lib.toLObject({
    read: new lib.LFunction(function(args) {
      let file = lib.toJString(args[0])
      fs.readFile(fsScope + '/' + file, 'utf8', function(err, data) {
        if (err) {
          console.error(
            chalk.cyan(`fs`)
            +
            ': '
            +
            chalk.red(`Failed to ${chalk.cyan('read(...)')} file ${chalk.yellow(file)}.`)
          )
        } else lib.call(args[2], lib.toLString(data))
      })
    }),

    sync: lib.toLObject({
      read: new lib.LFunction(function(args) {
        let file = lib.toJString(args[0])

        try {
          let data = fs.readFileSync(fsScope + '/' + file, 'utf8')
          return lib.toLString(data)
        } catch (e) {
          console.error(
          chalk.cyan(`fs`)
          +
          ': '
          +
          chalk.red(`Failed to ${chalk.cyan('sync.read(...)')} file ${chalk.yellow(file)}.`)
          )
        }
      }),

      write: new lib.LFunction(function(args) {
        let file = lib.toJString(args[0])
        try {
          let dat = lib.toJString(args[1])
          let data = fs.writeFileSync(fsScope + '/' + file, dat, 'utf8')
          return lib.toLString(data)
        } catch (e) {
          console.error(
          chalk.cyan(`fs`)
          +
          ': '
          +
          chalk.red(`Failed to ${chalk.cyan('sync.write(...)')} to file ${chalk.yellow(file)}.`)
          )
        }
      })
    }),

    write: new lib.LFunction(function(args) {
      let file = lib.toJString(args[0])
      let dat = lib.toJString(args[1])
      console.log(args[2])
      let data = fs.writeFile(fsScope + '/' + file, dat, 'utf8', function(err) {
        if (err) {
          console.error(
          chalk.cyan(`fs`)
          +
          ': '
          +
          chalk.red(`Failed to ${chalk.cyan('write(...)')} to file ${chalk.yellow(file)}.`)
          )
        } else lib.call(args[2], [data])
      })
    })
  })
}
