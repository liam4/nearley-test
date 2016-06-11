const C = require('./constants')
const lib = require('./lib')
const chalk = require('chalk')
const builtins = require('./builtins')

if (!(console.group)) {
  try {
    require('console-group').install()
  } catch(err) {
    console.group = function(msg) {
      console.log(chalk.cyan(`Group: ${msg}`))
    }
    console.groupEnd = function() {
      console.log(chalk.cyan('Group end'))
    }
  }
}

export async function evaluateExpression(expression, environment) {
  // console.group(`Evaluate in environment ${environment}\n`, expression)
  const returnVal = await async function() {
    if (expression[0] === C.COMMENT) {
      return
    } else if (expression instanceof Array &&
               expression.every(e => e instanceof Array)) {
      const ret = await evaluateEachExpression(expression, environment)
      return ret
    }

    if (expression[0] === C.VARIABLE_IDENTIFIER && expression[1] === 'environment') {
      return environment
    } else if (expression[0] === C.FUNCTION_CALL) {
      // Call a function: "function(arg1, arg2, arg3...)"

      // Get the function and argument expressions from the expression list.
      const fnExpression = expression[1]
      const argExpressions = expression[2]

      // Evaluate the function expression to get the actual function.
      const fn = await evaluateExpression(fnExpression, environment)
      const varName = fnExpression[1]

      if (!(fn instanceof lib.LFunction)) {
        throw new Error(`${chalk.cyan(varName)} is not a function`)
      }

      fn.argumentScope = environment
      const args = argExpressions
      const takingArgs = fn.paramaterList || []

      // We need to discuss this... what's fn.builtin? This also should make sure
      // that the called function is not a JS function, because you can't really
      // get the number of paramaters from JS functions.
      // if (args.length !== takingArgs.length && !fn.builtin) {
      //   throw new Error(`Function ${chalk.cyan(varName)} expects ${chalk.bold(takingArgs.length)} arguments, was called with ${chalk.bold(args.length)}`)
      // }

      // Use lib.call to call the function with the evaluated arguments.
      return await lib.call(fn, args)
    } else if (expression[0] === C.VARIABLE_IDENTIFIER) {
      // Get a variable: "name"

      // Get the name from the expression list.
      const name = expression[1]

      // Return the variable's value, or, if the variable doesn't exist, throw an
      // error.
      if (environment.vars.hasOwnProperty(name)) {
        const ret = environment.vars[name].value
        return ret
      } else {
        throw new Error(`${chalk.cyan(name)} is not defined in ${Object.keys(environment.vars)}`)
      }
    } else if (expression[0] === C.VARIABLE_ASSIGN) {
      // Set a variable to a value: "name => value"

      // Get the name and value expression from the expression list.
      const name = expression[1]
      const valueExpression = expression[2]

      // console.log(`Setting variable ${name}...`)

      // Evaluate the value of the variable.
      const value = await evaluateExpression(valueExpression, environment)

      // console.log(`..value is ${value}`)

      // Set the variable in the variables object to a new variable with the
      // evaluated value.
      environment.vars[name] = new lib.Variable(value)
      return
    } else if (expression[0] === C.VARIABLE_CHANGE) {
      // Change a variable to a new value: "name -> newValue"

      // Get the name and value expression from the expression list.
      const name = expression[1]
      const valueExpression = expression[2]

      // Evaluate the new value of the variable.
      const value = await evaluateExpression(valueExpression, environment)

      // Change the value of the already defined variable.
      environment.vars[name].value = value
      return
    } else if (expression[0] === C.FUNCTION_PRIM) {
      // A function literal: "[async] [(arg1, arg2, arg3...)] { code }"

      // Get the code and paramaters from the expression list.
      const paramaters = expression[1]
      const code = expression[2]
      const isAsync = expression[3]

      // Create the function using the given code.
      const fn = new lib.LFunction(code)

      // Set the scope variables for the function to a copy of the current
      // variables.
      fn.environment = new lib.LEnvironment()
      fn.environment.parentEnvironment = environment
      fn.environment.comment = 'Function environment'
      fn.environment.addVars(environment.vars)

      // Set the paramaters for the function to the paramaters taken from the
      // expression list.
      fn.setParamaters(paramaters)

      fn.isAsynchronous = isAsync

      // Return the function.
      return fn
    } else if (expression[0] === C.SHORTHAND_FUNCTION_PRIM) {
      // >> OUTDATED CODE <<
      const paramaters = expression[1]
      const codeExpression = expression[2]
      const fn = new lib.LFunction(codeExpression)
      fn.isShorthand = true
      fn.setScopeVariables(Object.assign({}, environment))
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
      const obj = await evaluateExpression(objExpression, environment)
      const value = await evaluateExpression(valueExpression, environment)

      // Use lib.set to set the property of the evaluated object.
      lib.set(obj, key, value)

      return
    } else if (expression[0] === C.GET_PROP_USING_IDENTIFIER) {
      // Get a property of an object using an identifier literal: "obj.key"

      // Get object expression and key from the expression list.
      const objExpression = expression[1]
      const key = expression[2]

      // Evaluate the object expression.
      const obj = await evaluateExpression(objExpression, environment)

      // Get the value from lib.get.
      const value = lib.get(obj, key)

      // Return the gotten value.
      return value
    } else {
      throw new Error(`Invalid expression: ${chalk.cyan(expression[0])}`)
    }
  }()
  // console.log(chalk.bold('Return value: ' + returnVal))
  // console.groupEnd()
  return returnVal
}

export async function evaluateGetPropUsingIdentifier(variables, [_, objExpr, key]) {
  let obj = await evaluateExpression(objExpr, variables)
  return lib.get(obj, key)
}

export async function evaluateEachExpression(expressions, environment) {
  function checkBreak() {
    let breakEnv = environment.breakToEnvironment
    if (breakEnv !== null) {
      if (breakEnv !== environment.parentEnvironment) {
        environment.parentEnvironment.breakToEnvironment = breakEnv
      }
      return true
    }
    return false
  }

  if (checkBreak()) return []

  let results = []
  for (let expression of expressions) {
    results.push(await evaluateExpression(expression, environment))
    if (checkBreak()) break
  }

  return results
}

export async function interp(ast, dir) {
  if (ast) {
    const environment = new lib.LEnvironment()

    environment.comment = 'Master environment'

    environment.addVars(builtins.makeBuiltins(dir))

    let result = await evaluateEachExpression(ast, environment)

    return { result, environment }
  } else {
    throw new Error('Haha, you didn\'t pass me a tree!')
  }
}
