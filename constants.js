var allExports = {};

var defineConstant = function(name) {
  allExports[name] = name;
};

defineConstant('FUNCTION_CALL');
defineConstant('FUNCTION_PRIM');
defineConstant('STRING_PRIM');
defineConstant('VARIABLE_ASSIGN');
defineConstant('VARIABLE_CHANGE');
defineConstant('VARIABLE_IDENTIFIER');

module.exports = allExports;
