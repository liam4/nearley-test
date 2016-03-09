var interp = require('./interp');
var C = require('./constants');

// Variable class -------------------------------------------------------------
// * this should never *ever* be accessed through anywhere except set/get
//   variable functions
// * takes one paramater, value, which is stored in inst.value and represents
//   the value of the variable
export class Variable {
  constructor(value) {
    this.value = value;
  }
}

// Base token class -----------------------------------------------------------
// * doesn't do anything on its own
// * use x instanceof Token to check if x is any kind of token

export class Token {
  constructor() {}
}

// Object token class ---------------------------------------------------------

export class ObjectToken extends Token {
  constructor() {
    super();
    this.map = new Map();
  }

  __get__(key) {
    return defaultGet(this, key);
  }

  __set__(key, value) {
    return defaultSet(this, key, value);
  }
}

// Function token class -------------------------------------------------------
// * takes one paramater, fn, which is stored in inst.fn and represents the
//     function that will be called
// * you can also set scopeVariables (using setScopeVariables), which is
//     generally only used for internal creation of function expressions; it
//     represents the closure variables that can be accessed from within the
//     function
// * you can also set fnArguments (using setArguments), which is generally also
//     only used for internal creation of function expressions; it tells what
//     call arguments should be mapped to in the variables context of running
//     the code block
// * use inst.__call__ to call the function (with optional arguments)

export class FunctionToken extends Token {
  constructor(fn) {
    super();
    this.fn = fn;
    this.scopeVariables = null;
    this.fnArguments = null;
  }

  __call__(args) {
    // Call this function. By default uses defaultCall, but can be overriden
    // by subclasses.
    return defaultCall(this, args);
  }

  setScopeVariables(scopeVariables) {
    this.scopeVariables = scopeVariables;
  }

  setArguments(fnArguments) {
    this.fnArguments = fnArguments;
  }
}

// Converting language primatives to JS prims ---------------------------------

export function toJString(str) {
  if (str && str[0] === C.STRING_PRIM) {
    return String(str[1]);
  } else {
    return String(str);
  }
}

export function toJBoolean(bool) {
  if (bool && bool[0] === C.BOOLEAN_PRIM && bool[1] === true) {
    return true;
  } else {
    return false;
  }
}

// Converting JS prims to language primitives ---------------------------------

export function toLString(string) {
  return [C.STRING_PRIM, string.toString()];
};

// Call function --------------------------------------------------------------

export function call(fn, args) {
  return fn['__call__'](args);
}

export function defaultCall(fnToken, args) {
  if (fnToken.fn instanceof Function) {
    // it's a javascript function so just call it
    return fnToken.fn(args);
  } else {
    var scope = Object.assign({}, fnToken.scopeVariables);
    var fnArgs = fnToken.fnArguments;
    for (var i = 0; i < fnArgs.length; i++) {
      var value = args[i];
      scope[fnArgs[i]] = new Variable(value);
    }
    return interp.evaluateEachExpression(fnToken.fn, scope);
  }
}

// Has function ---------------------------------------------------------------

export function has(obj, key) {
  return key in obj;
}

// Get function ---------------------------------------------------------------

export function get(obj, key) {
  return obj['__get__'](key);
}

export function defaultGet(obj, key) {
  return obj.map.get(toJString(key));
}

// Set function ---------------------------------------------------------------

export function set(obj, key, value) {
  return obj['__set__'](key, value);
}

export function defaultSet(obj, key, value) {
  return obj.map.set(toJString(key), value);
}
