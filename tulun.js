#!/usr/bin/env node

var args = process.argv.slice(2)

if(args.length === 1) {
  main(args[0])
} else if(args.length === 2 && args[0] === 'dev') {
  var spawn = require('child_process').spawn
  var build = spawn('gulp', ['build'])
  build.stdout.on('data', function(d) {
    process.stdout.write(d.toString())
  })
  build.on('exit', function() {
    main(args[1])
  })
} else {
  console.error('Usage: tulun [dev] <file>')
  process.exit()
}

function main(f) {
  var fs = require('fs')

  fs.readFile(f, function(err, data) {
    if(err) {
      if(err.errno === -2) {
        console.error('That program doesn\'t exist!')
      } else if(err.errno === -21) {
        console.error('Can\'t run a directory!')
      } else {
        console.error(err)
      }
      process.exit()
    }

    try {
      require('./dist/run').run(data.toString())
      console.log('Done!')
    } catch(err) {
      console.error(err.stack)
    }
  })
}