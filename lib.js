export class Variable {
  constructor(value) {
    this.value = value;
  }
}

export class Token {
  constructor() {}
}

export class FunctionToken extends Token {
  constructor(fn) {
    super();
    this.fn = fn;
  }

  __call__(args) {
    return defaultCall(this, args);
  }
}

export function defaultCall(fnToken, args) {
  return fnToken.fn(args);
}

export function call(fn, args) {
  return fn['__call__'](args);
};

