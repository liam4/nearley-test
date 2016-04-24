#!/usr/bin/env node

'use strict'

const args = process.argv.slice(2)

if(args.length === 1) {
  main(args[0], true)
} else {
  console.error('Usage: tulun <file.tul>')
  process.exit()
}

function main(f, again) {
  const fs = require('fs')

  fs.readFile(f, 'utf8', function(err, data) {
    if(err) {
      if(again) {
        main(`${f}.tul`, false)
      } else {
        if(err.errno === -2) {
          console.error('That program doesn\'t exist!')
        } else if(err.errno === -21) {
          console.error('Can\'t run a directory!')
        } else {
          console.error(err)
        }
      }

      try {
        require('./dist/run').run(data.toString(), `${process.cwd()}/${require('path').dirname(f)}`)
      } catch(err) {
        if(err.stack) console.error(err.stack)
        else console.error(err)
        process.exit(1)
      }
    }
  })
}
