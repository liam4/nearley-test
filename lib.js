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

export function toBoolean(bool) {
  if (bool && bool[0] === C.BOOLEAN_PRIM && bool[1] === true) {
    return true;
  } else {
    return false;
  }
}

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
    interp.evaluateEachExpression(fnToken.fn, scope);
    return;
  }
}
