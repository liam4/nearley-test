var fs = require('fs')

module.exports = function(lib, fsScope) {
	return {
		read: new lib.LFunction(function(args) {
			try {
				var file = lib.toJString(args[0])
				var data = fs.readFileSync(fsScope + '/' + file, 'utf8' )
				return lib.toLString(data)
			} catch(e) {
				console.error(
          chalk.cyan(`fs`)
          +
          ': '
          +
          chalk.red(`Failed to ${chalk.cyan('read(...)')} file ${chalk.yellow(file)}.`)
        );
        process.exit(1);
			}
		}),

		write: new lib.LFunction(function(args) {
			try {
				var file = lib.toJString(args[0])
				var dat = lib.toJString(args[1])
				var data = fs.writeFileSync(fsScope + '/' + file, dat, 'utf8')
				return lib.toLString(data)
			} catch(e) {
				console.error(
          chalk.cyan(`fs`)
          +
          ': '
          +
          chalk.red(`Failed to ${chalk.cyan('write(...)')} to file ${chalk.yellow(file)}.`)
        );
        process.exit(1);
			}
		})
	}
}
