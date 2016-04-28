const interp = require('./interp')
const C = require('./constants')

export class StringPrim {
  constructor(str) {
    this.str = str
  }

  set str(str) {
    this._str = String(str)
  }

  get str() {
    return String(this._str)
  }

  toString() {
    return '<String ' + this.str + '>'
  }
}

export class BooleanPrim {
  constructor(bool) {
    this.bool = bool
  }

  set bool(bool) {
    this._bool = Boolean(bool)
  }

  get bool() {
    return Boolean(this._bool)
  }

  valueOf() {
    return this.bool
  }

  toString() {
    return `<Boolean ${this.bool}>`
  }
}

export class NumberPrim {
  constructor(num) {
    this.num = num
  }

  set num(num) {
    this._num = Number(num)
  }

  get num() {
    return Number(this._num)
  }

  valueOf() {
    return this.num
  }

  toString() {
    return '<Number ' + this.num + '>'
  }
}

// Converting language primatives to JS prims ---------------------------------

export function toJString(str) {
  if (str instanceof StringPrim) {
    return str.str
  } else {
    return String(str)
  }
}

export function toJBoolean(bool) {
  if (bool instanceof BooleanPrim && bool.bool === true) {
    return true
  } else {
    return false
  }
}

export function toJNumber(num) {
  if (num instanceof NumberPrim) {
    return num.num
  } else {
    return Number(num)
  }
}

// Converting JS prims to language primitives ---------------------------------

export function toLString(str) {
  return new StringPrim(str)
}

export function toLBoolean(bool) {
  return new BooleanPrim(bool)
}

export function toLNumber(num) {
  return new NumberPrim(num)
}

export function toLObject(data) {
  let obj = new LObject()
  for (let key in data) {
    set(obj, key, data[key])
  }
  return obj
}

// Call function --------------------------------------------------------------

export async function call(fn, args) {
  return await fn['__call__'](args)
}

export async function defaultCall(fnToken, args) {
  if (fnToken.fn instanceof Function) {
    // it's a javascript function so just call it
    const argumentValues = [];
    for (let argument of args) {
      argumentValues.push(await interp.evaluateExpression(
        argument, fnToken.argumentScope))
    }
    return fnToken.fn(argumentValues)
  } else {
    const scope = Object.assign({}, fnToken.scopeVariables)
    let returnValue = null
    scope.return = new Variable(new LFunction(function([val]) {
      returnValue = val
    }))
    const paramaters = fnToken.paramaterList
    for (let i = 0; i < paramaters.length; i++) {
      const value = args[i]
      const paramater = paramaters[i]
      if (paramater.type === 'normal') {
        const evaluatedValue = await interp.evaluateExpression(value)
        scope[paramater.name] = new Variable(evaluatedValue)
      } else if (paramater.type === 'unevaluated') {
        scope[paramater.name] = new Variable(new LFunction(async function() {
          return await interp.evaluateExpression(value, fnToken.argumentScope)
        }))
      }
    }

    if (fnToken.isShorthand) {
      return await interp.evaluateExpression(fnToken.fn, scope)
    } else {
      await interp.evaluateEachExpression(scope, fnToken.fn)
      return returnValue
    }
  }
}

// Has function ---------------------------------------------------------------

export function has(obj, key) {
  return key in obj
}

// Get function ---------------------------------------------------------------

export function get(obj, key) {
  return obj['__get__'](key)
}

export function defaultGet(obj, key) {
  let keyString = toJString(key)
  if (keyString in obj.data) {
    return obj.data[keyString]
  } else {
    let constructor = obj['__constructor__']
    let prototype = constructor['__prototype__']
    let current = constructor
    while (current && prototype && !(key in prototype)) {
      current = current['__super__']
      prototype = current ? current['__prototype__'] : null
    }
    if (current) {
      let value = prototype[keyString]
      if (value instanceof LFunction) {
        // I was going to just bind to obj, but that generally involves using
        // the oh so terrible `this`.
        // Instead it returns a function that calls the given function with
        // obj as the first paramater.
        return new LFunction(function(...args) {
          return value.fn(obj, ...args)
        })
      }
      return value
    }
  }
}

// Set function ---------------------------------------------------------------

export function set(obj, key, value) {
  return obj['__set__'](key, value)
}

export function defaultSet(obj, key, value) {
  return obj.data[toJString(key)] = value
}

// Variable class -------------------------------------------------------------
// * this should never *ever* be accessed through anywhere except set/get
//   Variable functions
// * takes one paramater, value, which is stored in inst.value and represents
//   the value of the Variable
export class Variable {
  constructor(value) {
    this.value = value
  }

  toString() {
    return '<Variable>'
  }
}

// Base token class -----------------------------------------------------------
// * doesn't do anything on its own
// * use x instanceof Token to check if x is any kind of token

export class Token {
  constructor() {}
}

// Object token class ---------------------------------------------------------

export class LObject extends Token {
  constructor() {
    super()
    this.data = {}
    this['__constructor__'] = LObject
  }

  __get__(key) {
    return defaultGet(this, key)
  }

  __set__(key, value) {
    return defaultSet(this, key, value)
  }
}

export class LArray extends LObject {
  constructor() {
    super()
    this['__constructor__'] = LArray
    this.data.length = 0
  }
}

// Function token class -------------------------------------------------------
// [[this needs to be rewritten]]
// * takes one paramater, fn, which is stored in inst.fn and represents the
//     function that will be called
// * you can also set scopeVariables (using setScopeVariables), which is
//     generally only used for internal creation of function expressions; it
//     represents the closure Variables that can be accessed from within the
//     function
// * you can also set fnArguments (using setArguments), which is generally also
//     only used for internal creation of function expressions; it tells what
//     call arguments should be mapped to in the Variables context of running
//     the code block
// * use inst.__call__ to call the function (with optional arguments)

export class LFunction extends LObject {
  constructor(fn) {
    super()
    this['__constructor__'] = LFunction
    this.fn = fn
    this.scopeVariables = null

    this.unevaluatedArgs = []
    this.normalArgs = []
  }

  __call__(args) {
    // Call this function. By default uses defaultCall, but can be overriden
    // by subclasses.
    return defaultCall(this, args)
  }

  setScopeVariables(scopeVariables) {
    this.scopeVariables = scopeVariables
  }

  setParamaters(paramaterList) {
    this.paramaterList = paramaterList
  }

  toString() {
    return '<Function>'
  }
}

export class LEnvironment {
  constructor(variables) {
    this['__constructor__'] = LEnvironment
    this.vars = variables
  }

  __set__(variableName, value) {
    this.vars[variableName] = new Variable(value)
  }

  __get__(variableName) {
    return this.vars[variableName].value
  }

  toString() {
    return JSON.stringify(Object.keys(this.vars))
  }
}

// ETC. that requires above definitions ---------------------------------------

export let LObjectPrototype = {}

export let LArrayPrototype = {
  push: new LFunction(function(self, what) {
    self.data[self.data.length] = what
    self.data.length = self.data.length + 1
  }),
  pop: new LFunction(function(self) {
    delete self.data[self.data.length - 1]
    self.data.length = self.data.length - 1
  })
}

export let LFunctionPrototype = {
  debug: new LFunction(function(self) {
    console.log('** DEBUG **')
    console.log(self.fn.toString())
  })
}

LObject['__prototype__'] = LObjectPrototype
LObject['__super__'] = null

LArray['__prototype__'] = LArrayPrototype
LArray['__super__'] = LObject

LFunction['__prototype__'] = LFunctionPrototype
LFunction['__super__'] = LObject
