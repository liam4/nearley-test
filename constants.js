var allExports = {};

var defineConstant = function(name) {
  allExports[name] = name;
};

defineConstant('FUNCTION_CALL');
defineConstant('STRING_PRIM');
defineConstant('VARIABLE_IDENTIFIER');

module.exports = allExports;
