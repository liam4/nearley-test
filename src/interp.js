const C = require('./constants')
const lib = require('./lib')
const chalk = require('chalk')
const builtins = require('./builtins')

export async function evaluateExpression(expression, variables) {
  // console.log('evaluating expression', expression)
  if (expression[0] === C.COMMENT) {
    return
  } else if (expression instanceof Array &&
             expression.every(e => e instanceof Array)) {
    // console.log('Fo...')
    const ret = await evaluateEachExpression(variables, expression)
    // console.log('Ba.', ret)
    return ret
  } if (expression[0] === C.VARIABLE_IDENTIFIER && expression[1] === 'environment') {
    return new lib.LEnvironment(variables)
  } else if (expression[0] === C.FUNCTION_CALL) {
    // Call a function: "function(arg1, arg2, arg3...)"

    // Get the function and argument expressions from the expression list.
    const fnExpression = expression[1]
    const argExpressions = expression[2]

    // Evaluate the function expression to get the actual function.
    const fn = await evaluateExpression(fnExpression, variables)

    if (!(fn instanceof lib.LFunction)) {
      throw new Error(`Can't call ${chalk.cyan(fn)} because it's not a function`)
    }

    fn.argumentScope = variables
    const args = argExpressions

    // Use lib.call to call the function with the evaluated arguments.
    return await lib.call(fn, args)
  } else if (expression[0] === C.VARIABLE_IDENTIFIER) {
    // Get a variable: "name"

    // Get the name from the expression list.
    const name = expression[1]

    // console.log(`Getting variable ${name}...`)
    // console.log(name in variables)

    // Return the variable's value, or, if the variable doesn't exist, throw an
    // error.
    if (name in variables) {
      // console.log('Return:', variables[name])
      const ret = variables[name].value
      return ret
    } else {
      throw new Error(`${chalk.cyan(name)} is not defined.`)
    }
  } else if (expression[0] === C.VARIABLE_ASSIGN) {
    // Set a variable to a value: "name => value"

    // Get the name and value expression from the expression list.
    const name = expression[1]
    const valueExpression = expression[2]

    // console.log(`Setting variable ${name}...`)

    // Evaluate the value of the variable.
    const value = await evaluateExpression(valueExpression, variables)

    // console.log(`..value is ${value}`)

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
    const value = await evaluateExpression(valueExpression, variables)

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
    const obj = await evaluateExpression(objExpression, variables)
    const value = await evaluateExpression(valueExpression, variables)

    // Use lib.set to set the property of the evaluated object.
    lib.set(obj, key, value)
    return
  } else if (expression[0] === C.GET_PROP_USING_IDENTIFIER) {
    // Get a property of an object using an identifier literal: "obj.key"

    // Get object expression and key from the expression list.
    const objExpression = expression[1]
    const key = expression[2]

    // Evaluate the object expression.
    const obj = await evaluateExpression(objExpression, variables)

    // Get the value from lib.get.
    const value = lib.get(obj, key)

    // Return the gotten value.
    return value
  } else {
    throw new Error(`Invalid expression: ${chalk.cyan(expression[0])}`)
  }
}

export async function evaluateGetPropUsingIdentifier(variables, [_, objExpr, key]) {
  let obj = await evaluateExpression(objExpr, variables)
  return lib.get(obj, key)
}

export async function evaluateEachExpression(variables, expressions) {
  let results = []
  for (let expression of expressions) {
    results.push(await evaluateExpression(expression, variables))
  }
  return results
}

export async function interp(ast, dir) {
  if (ast) {
    let variables = {}

    Object.assign(variables, builtins.makeBuiltins(dir))

    let result = await evaluateEachExpression(variables, ast)
    // console.log('derrrp (THIS IS GOOD)')

    return { result, variables }
  } else {
    throw new Error('Haha, you didn\'t pass me a tree!')
  }
}
