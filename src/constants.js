let allExports = {}

const defineConstant = function(name) {
  allExports[name] = name
}

defineConstant('BOOLEAN_PRIM')
defineConstant('COMMENT')
defineConstant('FUNCTION_CALL')
defineConstant('FUNCTION_PRIM')
defineConstant('GET_PROP_USING_IDENTIFIER')
defineConstant('NUMBER_PRIM')
defineConstant('SET_PROP_USING_IDENTIFIER')
defineConstant('STRING_PRIM')
defineConstant('SHORTHAND_FUNCTION_PRIM')
defineConstant('VARIABLE_ASSIGN')
defineConstant('VARIABLE_CHANGE')
defineConstant('VARIABLE_IDENTIFIER')

// Characters that can't be used as parts of identifiers.
allExports.SPECIAL_CHARS = '(){}\'" .:;#'
// allExports.SPECIAL_CHARS = ['(',')','{','}','=>',"'",'"','.',':',';','#']

// Words that can't be used as identifiers.
allExports.KEYWORDS = ['true', 'false', '=>', '->', 'async']

module.exports = allExports
