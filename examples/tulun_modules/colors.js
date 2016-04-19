var chalk = require('chalk')

module.exports = function(lib, fsScope) {
	return {
		enabled: new lib.LFunction(function() {
			return lib.toLBoolean(chalk.enabled)
		}),

		red: new lib.LFunction(function(args) {
			return lib.toLString(chalk.red(lib.toJString(args[0])))
		}),
		green: new lib.LFunction(function(args) {
			return lib.toLString(chalk.green(lib.toJString(args[0])))
		}),
		yellow: new lib.LFunction(function(args) {
			return lib.toLString(chalk.yellow(lib.toJString(args[0])))
		}),
		blue: new lib.LFunction(function(args) {
			return lib.toLString(chalk.blue(lib.toJString(args[0])))
		}),
		magenta: new lib.LFunction(function(args) {
			return lib.toLString(chalk.magenta(lib.toJString(args[0])))
		}),
		cyan: new lib.LFunction(function(args) {
			return lib.toLString(chalk.cyan(lib.toJString(args[0])))
		}),
		white: new lib.LFunction(function(args) {
			return lib.toLString(chalk.white(lib.toJString(args[0])))
		}),
		grey: new lib.LFunction(function(args) {
			return lib.toLString(chalk.gray(lib.toJString(args[0])))
		}),
		gray: new lib.LFunction(function(args) {
			return lib.toLString(chalk.gray(lib.toJString(args[0])))
		}),
		black: new lib.LFunction(function(args) {
			return lib.toLString(chalk.black(lib.toJString(args[0])))
		}),

		underlined: new lib.LFunction(function(args) {
			return lib.toLString(chalk.underline(lib.toJString(args[0])))
		}),
		italics: new lib.LFunction(function(args) {
			return lib.toLString(chalk.italic(lib.toJString(args[0])))
		}),
		bold: new lib.LFunction(function(args) {
			return lib.toLString(chalk.bold(lib.toJString(args[0])))
		})
	}
}
