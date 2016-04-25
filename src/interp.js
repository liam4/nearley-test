const C = require('./constants')
const lib = require('./lib')
const chalk = require('chalk')
const builtins = require('./builtins')

export function evaluateExpression(expression, variables) {
  if (expression[0] === C.COMMENT) {
    return
  } else if (expression instanceof Array &&
             expression.every(e => e instanceof Array)) {
    return evaluateEachExpression(variables, expression)
  } if (expression[0] === C.VARIABLE_IDENTIFIER && expression[1] === 'environment') {
    return new lib.LEnvironment(variables)
  } else if (expression[0] === C.FUNCTION_CALL) {
    // Call a function: "function(arg1, arg2, arg3...)"

    // Get the function and argument expressions from the expression list.
    const fnExpression = expression[1]
    const argExpressions = expression[2]

    // Evaluate the function expression to get the actual function.
    const fn = evaluateExpression(fnExpression, variables)

    if (!(fn instanceof lib.LFunction)) {
      throw new Error(`Can't call ${chalk.cyan(fn)} because it's not a function`)
    }

    /* This code *used* to work but it doesn't any more, because some
     * parameters of the function could be unevaluated. Now argument evaluation
     * is done from within the call method of the function.
     */
    // Evaluate all of the arguments passed to the function.
    //const args = argExpressions.map(arg => evaluateExpression(arg, variables));
    fn.argumentScope = variables
    const args = argExpressions

    // Use lib.call to call the function with the evaluated arguments.
    return lib.call(fn, args)
  } else if (expression[0] === C.VARIABLE_IDENTIFIER) {
    // Get a variable: "name"

    // Get the name from the expression list.
    const name = expression[1]

    // Return the variable's value, or, if the variable doesn't exist, throw an
    // error.
    if (name in variables) {
      return variables[name].value
    } else {
      // FIXME: Change this message not to include *all* the variables within
      // the scope; maybe just say "variable (name) not found"?
      throw `variable ${name} not in [${Object.keys(variables)}]`
    }
  } else if (expression[0] === C.VARIABLE_ASSIGN) {
    // Set a variable to a value: "name => value"

    // Get the name and value expression from the expression list.
    const name = expression[1]
    const valueExpression = expression[2]

    // Evaluate the value of the variable.
    const value = evaluateExpression(valueExpression, variables)

    // Set the variable in the variables object to a new variable with the
    // evaluated value.
    variables[name] = new lib.Variable(value)
    return
  } else if (expression[0] === C.VARIABLE_CHANGE) {
    // Change a variable to a new value: "name -> newValue"

    // Get the name and value expression from the expression list.
    const name = expression[1]
    const valueExpression = expression[2]

    // Evaluate the new value of the variable.
    const value = evaluateExpression(valueExpression, variables)

    // Change the value of the already defined variable.
    variables[name].value = value
    return
  } else if (expression[0] === C.FUNCTION_PRIM) {
    // A function literal: "fn(arg1, arg2, arg3...) { code }"

    // Get the code and paramaters from the expression list.
    const paramaters = expression[1]
    const code = expression[2]

    // Create the function using the given code.
    const fn = new lib.LFunction(code)

    // Set the scope variables for the function to a copy of the current
    // variables.
    fn.setScopeVariables(Object.assign({}, variables))

    // Set the paramaters for the function to the paramaters taken from the
    // expression list.
    fn.setParamaters(paramaters)

    // Return the function.
    return fn
  } else if (expression[0] === C.SHORTHAND_FUNCTION_PRIM) {
    const paramaters = expression[1]
    const codeExpression = expression[2]
    const fn = new lib.LFunction(codeExpression)
    fn.isShorthand = true
    fn.setScopeVariables(Object.assign({}, variables))
    fn.setParamaters(paramaters)
    return fn
  } else if (expression[0] === C.STRING_PRIM) {
    // String literal: "contents"

    // Get string from expression list.
    const string = expression[1]

    // Convert string to a language-usable string, and return.
    return lib.toLString(string)
  } else if (expression[0] === C.BOOLEAN_PRIM) {
    // Boolean literal: true/false

    // Get boolean value from expression list.
    const bool = expression[1]

    // Convert boolean value to a language-usable boolean, and return.
    return lib.toLBoolean(bool)
  } else if (expression[0] === C.NUMBER_PRIM) {
    // Number primitive: 1, 2, 3, 4, 7.25, -3, etc.

    // Get number value from expression list.
    const number = expression[1]

    // Convert number value to a language-usable number, and return.
    return lib.toLNumber(number)
  } else if (expression[0] === C.SET_PROP_USING_IDENTIFIER) {
    // Set a property of an object using an identifier literal:
    // "obj.key > value"

    // Get object expression, key, and value expression from expression list.
    const objExpression = expression[1]
    const key = expression[2]
    const valueExpression = expression[3]

    // Evaluate the object and value expressions.
    const obj = evaluateExpression(objExpression, variables)
    const value = evaluateExpression(valueExpression, variables)

    // Use lib.set to set the property of the evaluated object.
    lib.set(obj, key, value)
    return
  } else if (expression[0] === C.GET_PROP_USING_IDENTIFIER) {
    // Get a property of an object using an identifier literal: "obj.key"

    // Get object expression and key from the expression list.
    const objExpression = expression[1]
    const key = expression[2]

    // Evaluate the object expression.
    const obj = evaluateExpression(objExpression, variables)

    // Get the value from lib.get.
    const value = lib.get(obj, key)

    // Return the gotten value.
    return value
  } else {
    throw new Error(`Invalid expression type: ${expression[0]}`)
  }
}

export function evaluateGetPropUsingIdentifier(variables, [_, objExpr, key]) {
  let obj = evaluateExpression(objExpr, variables)
  return lib.get(obj, key)
}

export function evaluateEachExpression(variables, expressions) {
  return expressions.map(e => evaluateExpression(e, variables))
}

export function interp(ast, dir) {
  if (ast) {
    let variables = {}

    Object.assign(variables, builtins.makeBuiltins(dir))

    let result = evaluateEachExpression(variables, ast)

    return { result, variables }
  } else {
    console.error('Haha, you didn\'t pass me a tree!')
  }
}
