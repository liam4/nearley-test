var allExports = {};

var defineConstant = function(name) {
  allExports[name] = name;
};

defineConstant('BOOLEAN_PRIM');
defineConstant('FUNCTION_CALL');
defineConstant('FUNCTION_PRIM');
defineConstant('STRING_PRIM');
defineConstant('VARIABLE_ASSIGN');
defineConstant('VARIABLE_CHANGE');
defineConstant('VARIABLE_IDENTIFIER');

// Characters that can't be used as parts of identifiers.
allExports.SPECIAL_CHARS = '(){}=>\'"';

module.exports = allExports;
