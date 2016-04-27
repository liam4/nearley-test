const fs = require('fs')
const path = require('path')
const run = require('./run')
const interp = require('./interp')
const lib = require('./lib')
const chalk = require('chalk')
const C = require('./constants')

function exists(p) {
  // warning, this is synchronous
  try {
    fs.accessSync(p, fs.F_OK)
    return true
  } catch (err) {
    return false
  }
}

export function makeBuiltins(fsScope) {
  let variables = {}

  variables['print'] = new lib.Variable(new lib.LFunction(function(args) {
    console.log(...args.map(arg => {
      let a = arg.toString() || ''
      if (a === '<Boolean true>') a = chalk.green('true') // true
      else if (a === '<Boolean false>') a = chalk.red('false') // false
      else if (a === '<Function>') a = chalk.magenta(`function`) // function
      else if (a.substr(0, 8) === '<String ') a = `${a.substr(8, a.length-9)}` // string
      else if (a.substr(0, 8) === '<Number ') {
        if (Number(a.substr(8, a.length-9)) % 1 === 0) a = chalk.blue(`${a.substr(8, a.length-9)}`) // integer
        else a = chalk.blue(`${a.substr(8, a.length-9)}`) // float
      }
      return a
    }))
  }))

  variables['print-debug'] = new lib.Variable(new lib.LFunction(function(args) {
    console.log(...args)
  }))

  variables['concat'] = new lib.Variable(new lib.LFunction(function(args) {
    return lib.toLString(args.map(lib.toJString).join(''))
  }))

  variables['if'] = new lib.Variable(new lib.LFunction(function(args) {
    if (lib.toJBoolean(args[0])) {
      lib.call(args[1], [])
    } else {
      // optional `else`
      if (args[2]) lib.call(args[2], [])
    }
  }))

  variables['ifel'] = new lib.Variable(new lib.LFunction(function(args) {
    if (lib.toJBoolean(args[0])) {
      lib.call(args[1], [])
    } else {
      lib.call(args[2], [])
    }
  }))

  variables['sleep'] = new lib.Variable(new lib.LFunction(function([time]) {
    let e = new Date().getTime() + (lib.toJNumber(time) * 1000)
    while (new Date().getTime() <= e) { /* empty */ }
  }))

  variables['obj'] = new lib.Variable(new lib.LFunction(function(args) {
    return new lib.LObject()
  }))

  variables['array'] = new lib.Variable(new lib.LFunction(function(args) {
    return new lib.LArray()
  }))

  variables['+'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) + lib.toJNumber(y))
  }))
  variables['add'] = variables['+']

  variables['-'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) - lib.toJNumber(y))
  }))
  variables['minus'] = variables['-']

  variables['/'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) / lib.toJNumber(y))
  }))
  variables['divide'] = variables['/']

  variables['*'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLNumber(lib.toJNumber(x) * lib.toJNumber(y))
  }))
  variables['multiply'] = variables['&']

  variables['not'] = new lib.Variable(new lib.LFunction(function([bool]) {
    return lib.toLBoolean(!lib.toJBoolean(bool))
  }))
  variables['!'] = variables['not']

  variables['and'] = new lib.Variable(new lib.LFunction(function([b1, b2]) {
    return lib.toLBoolean(lib.toJBoolean(b1) && lib.toJBoolean(b2))
  }))
  variables['&'] = variables['and']

  variables['or'] = new lib.Variable(new lib.LFunction(function([b1, b2]) {
    return lib.toLBoolean(lib.toJBoolean(b1) || lib.toJBoolean(b2))
  }))
  variables['|'] = variables['or']

  variables['lt'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLBoolean(lib.toJNumber(x) < lib.toJNumber(y))
  }))
  variables['<'] = variables['lt']

  variables['gt'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLBoolean(lib.toJNumber(x) > lib.toJNumber(y))
  }))
  variables['>'] = variables['gt']

  variables['eq'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLBoolean(lib.toJNumber(x) === lib.toJNumber(y))
  }))
  variables['='] = variables['eq']

  variables['is'] = new lib.Variable(new lib.LFunction(function([x, y]) {
    return lib.toLBoolean(Object.is(x, y) || x.toString() === y.toString())
  }))

  variables['loop'] = new lib.Variable(new lib.LFunction(function([fn]) {
    while (lib.toJBoolean(lib.call(fn, []))) { /* empty */ }
  }))

  variables['use'] = new lib.Variable(new lib.LFunction(function([pathStr]) {
    let p = lib.toJString(pathStr)
    let locationInBuiltins = `${fsScope}/${p}`

    if (p.substr(0, 1) !== '.') {
      locationInBuiltins = `${__dirname}/../global-modules/${p}`
    }

    let ext = path.parse(locationInBuiltins).ext

    if (!ext) {
      locationInBuiltins += '.tul'
      ext = '.tul'

      if (!exists(locationInBuiltins)) {
        locationInBuiltins = `${locationInBuiltins.substr(0, locationInBuiltins.length - 3)}js`
        ext = '.js'
      }
    }

    if (exists(locationInBuiltins)) {
      if (ext === '.js') {
        let used = require(locationInBuiltins)(lib, fsScope)
        //var usedObj = lib.toLObject(used);
        return used
      } else if (ext === '.tul') {
        let program = fs.readFileSync(locationInBuiltins).toString()
        let result = run.run(program)
        if ('exports' in result.variables) {
          return result.variables.exports.value
        } else {
          return new lib.LObject()
        }
      } else {
        console.error(
          chalk.cyan(`use(...)`)
          +
          ': '
          +
          chalk.red(`Invalid extension ${chalk.yellow(ext)}.`)
        )
        process.exit(1)
      }
    } else {
      console.error(
        chalk.cyan(`use(...)`)
        +
        ': '
        +
        chalk.red(`Could not find module ${chalk.yellow(p)}.`)
      )
      process.exit(1)
    }
  }))

  let variableObject = new lib.LObject()

  lib.set(variableObject, 'make', new lib.LFunction(function([env, name, value]) {
    let v = new lib.Variable(value)
    env.vars[lib.toJString(name)] = v
    return v
  }))

  lib.set(variableObject, 'change', new lib.LFunction(function([variable, newValue]) {
    variable.value = newValue
  }))

  lib.set(variableObject, 'value', new lib.LFunction(function([variable]) {
    return variable.value
  }))

  lib.set(variableObject, 'from', new lib.LFunction(function([env, name]) {
    name = lib.toJString(name)
    let variable = env.vars[name]
    if (typeof variable === 'undefined') {
      throw new Error(`Can't access variable ${name} because it doesn't exist`)
    } else {
      return variable
    }
  }))

  lib.set(variableObject, 'exists', new lib.LFunction(function([env, name]) {
    return lib.toLBoolean(env.vars.hasOwnProperty(lib.toJString(name)))
  }))

  variables['Variable'] = new lib.Variable(variableObject)

  variables['set-timeout'] = new lib.Variable(new lib.LFunction(function([fn, ms]) {
    setTimeout(function() {
      lib.call(fn, [])
    }, lib.toJNumber(ms))
  }))

  return variables
}
