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

// Function token class -------------------------------------------------------
// * takes two paramaters:
//   - fn, which is stored in inst.fn and represents the function that will be
//     called
//   - scopeVariables, which is generally only used for internal creation of
//     function expressions; it represents the closure variables that can be
//     accessed from within the function and is stored in inst.scopeVariables
// * use inst.__call__ to call the function (with optional arguments)

export class FunctionToken extends Token {
  constructor(fn, scopeVariables) {
    super();
    this.fn = fn;
    this.scopeVariables = scopeVariables;
  }

  __call__(args) {
    // Call this function. By default uses defaultCall, but can be overriden
    // by subclasses.
    return defaultCall(this, args);
  }
}

// Call function --------------------------------------------------------------

export function call(fn, args) {
  return fn['__call__'](args);
}

export function defaultCall(fnToken, args) {
  return fnToken.fn(args);
}
