#!/usr/bin/env node

'use strict'

const args = process.argv.slice(2)
const chalk = require('chalk')
const TULUN = `
  ████████╗ ██╗   ██╗ ██╗      ██╗   ██╗ ███╗   ██╗
  ╚══██╔══╝ ██║   ██║ ██║      ██║   ██║ ████╗  ██║
     ██║    ██║   ██║ ██║      ██║   ██║ ██╔██╗ ██║
     ██║    ██║   ██║ ██║      ██║   ██║ ██║╚██╗██║
     ██║    ╚██████╔╝ ███████╗ ╚██████╔╝ ██║ ╚████║
     ╚═╝     ╚═════╝  ╚══════╝  ╚═════╝  ╚═╝  ╚═══╝
                                               `

function build(fn) {
  console.log(chalk.cyan('Building...'))
  let spawn = require('child_process').spawn
  let build = spawn('gulp', ['build', '--silent'])
  build.stdout.on('data', function(d) {
    //process.stdout.write(chalk.cyan(d.toString()))
  })
  build.on('exit', fn)
}

function version() {
  let ver = require('./package.json').version
  console.log(
    `${chalk.cyan(TULUN)}

                          v${chalk.bold(ver)}`
  )
}

if (args.length === 1) {
  if (args[0] === 'rebuild' || args[0] === '-r') build(() => {})
  else if (args[0] === 'version') version()
  else if (args[0] === 'help') {
    console.log(`${chalk.green(TULUN)}
    ${chalk.bold('Command')}       | ${chalk.bold('Description')}
  ――――――――――――――――+――――――――――――――――――――――――――――――――
    ${chalk.cyan('tulun        ')} | enters REPL
    ${chalk.cyan('tulun')} ${chalk.green('<file> ')} | runs ${chalk.yellow('<file>')}.tul
    ${chalk.cyan('tulun')} ${chalk.green('help   ')} | this screen, silly
    ${chalk.cyan('tulun')} ${chalk.green('version')} | outputs version number
    ${chalk.cyan('tulun')} ${chalk.green('rebuild')} | rebuilds source`)
    process.exit()
  } else main(args[0], true)
} else if (args.length === 2 && args[0] === 'rebuild') {
  build(() => main(args[1], true))
} else if (args.length === 2 && args[1] === 'rebuild') {
  build(() => main(args[0], true))
} else if (args[0] === '--version' || args[0] === '-v') version()
  else {

}

function main(f, again) {
  const fs = require('fs')

  fs.readFile(f, 'utf8', function(err, data) {
    if (err) {
      if (again) {
        main(`${f}.tul`, false)
        return
      } else {
        if (err.errno === -2) {
          console.error(chalk.red(`${chalk.cyan(f)} doesn't exist!`))
          process.exit(1)
        } else if (err.errno === -21) {
          console.error(chalk.red('Can\'t run a directory!'))
          process.exit(1)
        } else {
          console.error(chalk.red(err))
          process.exit(1)
        }
      }
    }

    let code = data.toString()

    try {
      require('./dist/run').run(code, `${process.cwd()}/${require('path').dirname(f)}`)
    } catch (err) {
      if (err.stack) console.error(chalk.red(err.stack))
      else console.error(chalk.red(err))
      process.exit(1)
    }
  })
}
