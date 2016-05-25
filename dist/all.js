'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.makeBuiltins = makeBuiltins;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var path = require('path');
var run = require('./run');
var interp = require('./interp');
var lib = require('./lib');
var chalk = require('chalk');
var C = require('./constants');

function exists(p) {
  // warning, this is synchronous
  try {
    fs.accessSync(p, fs.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

function makeBuiltins(fsScope) {
  var variables = {};

  variables['print'] = new lib.Variable(new lib.LFunction(function (args) {
    var _console;

    (_console = console).log.apply(_console, (0, _toConsumableArray3.default)(args.map(function (arg) {
      var a = arg.toString() || '';
      if (a === '<Boolean true>') a = chalk.green('true'); // true
      else if (a === '<Boolean false>') a = chalk.red('false'); // false
        else if (a === '<Function>') a = chalk.magenta('function'); // function
          else if (a.substr(0, 8) === '<String ') a = '' + a.substr(8, a.length - 9); // string
            else if (a.substr(0, 8) === '<Number ') {
                if (Number(a.substr(8, a.length - 9)) % 1 === 0) a = chalk.blue('' + a.substr(8, a.length - 9)); // integer
                else a = chalk.blue('' + a.substr(8, a.length - 9)); // float
              }
      return a;
    })));
  }));

  variables['process'] = new lib.Variable(lib.toLObject({
    exit: new lib.LFunction(function (_ref) {
      var _ref2 = (0, _slicedToArray3.default)(_ref, 1);

      var code = _ref2[0];

      code = code || 0;
      process.exit(code);
    })
  }));

  variables['print-debug'] = new lib.Variable(new lib.LFunction(function (args) {
    var _console2;

    (_console2 = console).log.apply(_console2, (0, _toConsumableArray3.default)(args));
  }));

  variables['concat'] = new lib.Variable(new lib.LFunction(function (args) {
    return lib.toLString(args.map(lib.toJString).join(''));
  }));

  variables['if'] = new lib.Variable(new lib.LFunction(function (args) {
    if (lib.toJBoolean(args[0])) {
      lib.call(args[1], []);
    } else {
      // optional `else`
      if (args[2]) lib.call(args[2], []);
    }
  }));

  variables['ifel'] = new lib.Variable(new lib.LFunction(function (args) {
    if (lib.toJBoolean(args[0])) {
      lib.call(args[1], []);
    } else {
      lib.call(args[2], []);
    }
  }));

  variables['sleep'] = new lib.Variable(new lib.LFunction(function (_ref3) {
    var _ref4 = (0, _slicedToArray3.default)(_ref3, 1);

    var time = _ref4[0];

    var e = new Date().getTime() + lib.toJNumber(time) * 1000;
    while (new Date().getTime() <= e) {/* empty */}
  }));

  variables['obj'] = new lib.Variable(new lib.LFunction(function (args) {
    return new lib.LObject();
  }));

  variables['array'] = new lib.Variable(new lib.LFunction(function (args) {
    return new lib.LArray();
  }));

  variables['+'] = new lib.Variable(new lib.LFunction(function (_ref5) {
    var _ref6 = (0, _slicedToArray3.default)(_ref5, 2);

    var x = _ref6[0];
    var y = _ref6[1];

    return lib.toLNumber(lib.toJNumber(x) + lib.toJNumber(y));
  }));
  variables['add'] = variables['+'];

  variables['-'] = new lib.Variable(new lib.LFunction(function (_ref7) {
    var _ref8 = (0, _slicedToArray3.default)(_ref7, 2);

    var x = _ref8[0];
    var y = _ref8[1];

    return lib.toLNumber(lib.toJNumber(x) - lib.toJNumber(y));
  }));
  variables['minus'] = variables['-'];

  variables['/'] = new lib.Variable(new lib.LFunction(function (_ref9) {
    var _ref10 = (0, _slicedToArray3.default)(_ref9, 2);

    var x = _ref10[0];
    var y = _ref10[1];

    return lib.toLNumber(lib.toJNumber(x) / lib.toJNumber(y));
  }));
  variables['divide'] = variables['/'];

  variables['*'] = new lib.Variable(new lib.LFunction(function (_ref11) {
    var _ref12 = (0, _slicedToArray3.default)(_ref11, 2);

    var x = _ref12[0];
    var y = _ref12[1];

    return lib.toLNumber(lib.toJNumber(x) * lib.toJNumber(y));
  }));
  variables['multiply'] = variables['&'];

  variables['^'] = new lib.Variable(new lib.LFunction(function (_ref13) {
    var _ref14 = (0, _slicedToArray3.default)(_ref13, 2);

    var x = _ref14[0];
    var y = _ref14[1];

    return lib.toLNumber(Math.pow(lib.toJNumber(x), lib.toJNumber(y)));
  }));

  variables['not'] = new lib.Variable(new lib.LFunction(function (_ref15) {
    var _ref16 = (0, _slicedToArray3.default)(_ref15, 1);

    var bool = _ref16[0];

    return lib.toLBoolean(!lib.toJBoolean(bool));
  }));
  variables['!'] = variables['not'];

  variables['and'] = new lib.Variable(new lib.LFunction(function (_ref17) {
    var _ref18 = (0, _slicedToArray3.default)(_ref17, 2);

    var b1 = _ref18[0];
    var b2 = _ref18[1];

    return lib.toLBoolean(lib.toJBoolean(b1) && lib.toJBoolean(b2));
  }));
  variables['&'] = variables['and'];

  variables['or'] = new lib.Variable(new lib.LFunction(function (_ref19) {
    var _ref20 = (0, _slicedToArray3.default)(_ref19, 2);

    var b1 = _ref20[0];
    var b2 = _ref20[1];

    return lib.toLBoolean(lib.toJBoolean(b1) || lib.toJBoolean(b2));
  }));
  variables['|'] = variables['or'];

  variables['lt'] = new lib.Variable(new lib.LFunction(function (_ref21) {
    var _ref22 = (0, _slicedToArray3.default)(_ref21, 2);

    var x = _ref22[0];
    var y = _ref22[1];

    return lib.toLBoolean(lib.toJNumber(x) < lib.toJNumber(y));
  }));
  variables['<'] = variables['lt'];

  variables['gt'] = new lib.Variable(new lib.LFunction(function (_ref23) {
    var _ref24 = (0, _slicedToArray3.default)(_ref23, 2);

    var x = _ref24[0];
    var y = _ref24[1];

    return lib.toLBoolean(lib.toJNumber(x) > lib.toJNumber(y));
  }));
  variables['>'] = variables['gt'];

  variables['eq'] = new lib.Variable(new lib.LFunction(function (_ref25) {
    var _ref26 = (0, _slicedToArray3.default)(_ref25, 2);

    var x = _ref26[0];
    var y = _ref26[1];

    return lib.toLBoolean(lib.toJNumber(x) === lib.toJNumber(y));
  }));
  variables['='] = variables['eq'];

  variables['is'] = new lib.Variable(new lib.LFunction(function (_ref27) {
    var _ref28 = (0, _slicedToArray3.default)(_ref27, 2);

    var x = _ref28[0];
    var y = _ref28[1];

    return lib.toLBoolean(x.toString() === y.toString());
  }));

  variables['loop'] = new lib.Variable(new lib.LFunction(function (_ref29) {
    var _ref30 = (0, _slicedToArray3.default)(_ref29, 1);

    var fn = _ref30[0];

    while (lib.toJBoolean(lib.call(fn, []))) {/* empty */}
  }));

  variables['use'] = new lib.Variable(new lib.LFunction(function (_ref31) {
    var _ref32 = (0, _slicedToArray3.default)(_ref31, 1);

    var pathStr = _ref32[0];

    var p = lib.toJString(pathStr);
    var locationInBuiltins = fsScope + '/' + p;

    if (p.substr(0, 1) !== '.') {
      locationInBuiltins = __dirname + '/../global-modules/' + p;
    }

    var ext = path.parse(locationInBuiltins).ext;

    if (!ext) {
      locationInBuiltins += '.tul';
      ext = '.tul';

      if (!exists(locationInBuiltins)) {
        locationInBuiltins = locationInBuiltins.substr(0, locationInBuiltins.length - 3) + 'js';
        ext = '.js';
      }
    }

    if (exists(locationInBuiltins)) {
      if (ext === '.js') {
        var used = require(locationInBuiltins)(lib, fsScope);
        //var usedObj = lib.toLObject(used);
        return used;
      } else if (ext === '.tul') {
        var program = fs.readFileSync(locationInBuiltins).toString();
        var result = run.run(program);
        if ('exports' in result.variables) {
          return result.variables.exports.value;
        } else {
          return new lib.LObject();
        }
      } else {
        console.error(chalk.cyan('use(...)') + ': ' + chalk.red('Invalid extension ' + chalk.yellow(ext) + '.'));
        process.exit(1);
      }
    } else {
      console.error(chalk.cyan('use(...)') + ': ' + chalk.red('Could not find ' + chalk.yellow(p) + ' ' + chalk.white.dim('@ ' + locationInBuiltins) + '.'));
      process.exit(1);
    }
  }));

  var variableObject = new lib.LObject();

  lib.set(variableObject, 'make', new lib.LFunction(function (_ref33) {
    var _ref34 = (0, _slicedToArray3.default)(_ref33, 3);

    var env = _ref34[0];
    var name = _ref34[1];
    var value = _ref34[2];

    var v = new lib.Variable(value);
    env.vars[lib.toJString(name)] = v;
    return v;
  }));

  lib.set(variableObject, 'change', new lib.LFunction(function (_ref35) {
    var _ref36 = (0, _slicedToArray3.default)(_ref35, 2);

    var variable = _ref36[0];
    var newValue = _ref36[1];

    variable.value = newValue;
  }));

  lib.set(variableObject, 'value', new lib.LFunction(function (_ref37) {
    var _ref38 = (0, _slicedToArray3.default)(_ref37, 1);

    var variable = _ref38[0];

    return variable.value;
  }));

  lib.set(variableObject, 'from', new lib.LFunction(function (_ref39) {
    var _ref40 = (0, _slicedToArray3.default)(_ref39, 2);

    var env = _ref40[0];
    var name = _ref40[1];

    name = lib.toJString(name);
    var variable = env.vars[name];
    if (typeof variable === 'undefined') {
      throw new Error(chalk.red('Can\'t access variable ' + chalk.cyan(name) + ' because it doesn\'t exist!'));
    } else {
      return variable;
    }
  }));

  lib.set(variableObject, 'exists', new lib.LFunction(function (_ref41) {
    var _ref42 = (0, _slicedToArray3.default)(_ref41, 2);

    var env = _ref42[0];
    var name = _ref42[1];

    return lib.toLBoolean(env.vars.hasOwnProperty(lib.toJString(name)));
  }));

  variables['Variable'] = new lib.Variable(variableObject);

  variables['set-timeout'] = new lib.Variable(new lib.LFunction(function (_ref43) {
    var _ref44 = (0, _slicedToArray3.default)(_ref43, 2);

    var fn = _ref44[0];
    var ms = _ref44[1];

    setTimeout(function () {
      lib.call(fn, []);
    }, lib.toJNumber(ms));
  }));

  (0, _keys2.default)(variables).map(function (value, index) {
    if (variables[value]) {
      if (variables[value].value instanceof lib.LFunction) variables[value].value.builtin = true;
    }
  });

  return variables;
}
'use strict';

var allExports = {};

var defineConstant = function defineConstant(name) {
  allExports[name] = name;
};

defineConstant('BOOLEAN_PRIM');
defineConstant('COMMENT');
defineConstant('FUNCTION_CALL');
defineConstant('FUNCTION_PRIM');
defineConstant('GET_PROP_USING_IDENTIFIER');
defineConstant('NUMBER_PRIM');
defineConstant('SET_PROP_USING_IDENTIFIER');
defineConstant('STRING_PRIM');
defineConstant('SHORTHAND_FUNCTION_PRIM');
defineConstant('VARIABLE_ASSIGN');
defineConstant('VARIABLE_CHANGE');
defineConstant('VARIABLE_IDENTIFIER');

// Characters that can't be used as parts of identifiers.
allExports.SPECIAL_CHARS = '(){}\'" .:;#';
// allExports.SPECIAL_CHARS = ['(',')','{','}','=>',"'",'"','.',':',';','#']

// Words that can't be used as identifiers.
allExports.KEYWORDS = ['true', 'false', '=>', '->', 'async'];

module.exports = allExports;
"use strict";

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
  function id(x) {
    return x[0];
  }

  var C = require('./constants');

  var ReturnNothing = function ReturnNothing(d, l, r) {
    return null;
  };

  var JoinRecursive = function JoinRecursive(a) {
    // not really sure how this works but it's magic and fixes everything
    // todo: figure out how it works
    var last = a[a.length - 1];
    return [a[0]].concat((0, _toConsumableArray3.default)(last));
  };

  var grammar = {
    ParserRules: [{ "name": "_$ebnf$1", "symbols": [] }, { "name": "_$ebnf$1", "symbols": ["wschar", "_$ebnf$1"], "postprocess": function arrconcat(d) {
        return [d[0]].concat(d[1]);
      } }, { "name": "_", "symbols": ["_$ebnf$1"], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "__$ebnf$1", "symbols": ["wschar"] }, { "name": "__$ebnf$1", "symbols": ["wschar", "__$ebnf$1"], "postprocess": function arrconcat(d) {
        return [d[0]].concat(d[1]);
      } }, { "name": "__", "symbols": ["__$ebnf$1"], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id }, { "name": "Program$ebnf$1$subexpression$1", "symbols": ["_Program", "_"] }, { "name": "Program$ebnf$1", "symbols": ["Program$ebnf$1$subexpression$1"], "postprocess": id }, { "name": "Program$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "Program", "symbols": ["_", "Program$ebnf$1"], "postprocess": function postprocess(d) {
        return d[1] ? d[1][0] : [];
      } }, { "name": "_Program", "symbols": ["Command", "_", "CommandSeparator", "_", "_Program"], "postprocess": JoinRecursive }, { "name": "_Program", "symbols": ["Command", "_", "CommandSeparator"], "postprocess": function postprocess(d) {
        return [d[0]];
      } }, { "name": "_Program", "symbols": ["Comment", "_", "_Program"], "postprocess": function postprocess(d) {
        return d[2];
      } }, { "name": "_Program", "symbols": ["Command"] }, { "name": "_Program", "symbols": ["Comment"] }, { "name": "CommandSeparator", "symbols": [{ "literal": ";" }] }, { "name": "Command", "symbols": ["Expression"] }, { "name": "Command", "symbols": ["SetPropertyUsingIdentifier"] }, { "name": "Command", "symbols": ["VariableAssign"] }, { "name": "Command", "symbols": ["VariableChange"] }, { "name": "VariableAssign$string$1", "symbols": [{ "literal": "=" }, { "literal": ">" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "VariableAssign", "symbols": ["Identifier", "_", "VariableAssign$string$1", "_", "Expression"], "postprocess": function postprocess(d) {
        return [C.VARIABLE_ASSIGN, d[0], d[4]];
      } }, { "name": "VariableChange$string$1", "symbols": [{ "literal": "-" }, { "literal": ">" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "VariableChange", "symbols": ["Identifier", "_", "VariableChange$string$1", "_", "Expression"], "postprocess": function postprocess(d) {
        return [C.VARIABLE_CHANGE, d[0], d[4]];
      } }, { "name": "Expression", "symbols": ["_Expression"], "postprocess": function postprocess(d) {
        return d[0][0];
      } }, { "name": "_Expression", "symbols": ["CallFunctionExpression"] }, { "name": "_Expression", "symbols": ["CallFunctionSurroundExpression"] }, { "name": "_Expression", "symbols": ["GetPropertyUsingIdentifierExpression"] }, { "name": "_Expression", "symbols": ["FunctionLiteral"] }, { "name": "_Expression", "symbols": ["StringExpression"] }, { "name": "_Expression", "symbols": ["BooleanExpression"] }, { "name": "_Expression", "symbols": ["NumberExpression"] }, { "name": "_Expression", "symbols": ["VariableGetExpression"] }, { "name": "SetPropertyUsingIdentifier", "symbols": ["Expression", "_", { "literal": "." }, "_", "Identifier", "_", { "literal": ">" }, "_", "Expression"], "postprocess": function postprocess(d) {
        return [C.SET_PROP_USING_IDENTIFIER, d[0], d[4], d[8]];
      } }, { "name": "GetPropertyUsingIdentifierExpression", "symbols": ["Expression", "_", { "literal": "." }, "_", "Identifier"], "postprocess": function postprocess(d) {
        return [C.GET_PROP_USING_IDENTIFIER, d[0], d[4]];
      } }, { "name": "FunctionLiteral$ebnf$1$subexpression$1$string$1", "symbols": [{ "literal": "a" }, { "literal": "s" }, { "literal": "y" }, { "literal": "n" }, { "literal": "c" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "FunctionLiteral$ebnf$1$subexpression$1", "symbols": ["FunctionLiteral$ebnf$1$subexpression$1$string$1", "_"] }, { "name": "FunctionLiteral$ebnf$1", "symbols": ["FunctionLiteral$ebnf$1$subexpression$1"], "postprocess": id }, { "name": "FunctionLiteral$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "FunctionLiteral$ebnf$2$subexpression$1", "symbols": ["ArgumentList", "_"] }, { "name": "FunctionLiteral$ebnf$2", "symbols": ["FunctionLiteral$ebnf$2$subexpression$1"], "postprocess": id }, { "name": "FunctionLiteral$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "FunctionLiteral", "symbols": ["FunctionLiteral$ebnf$1", "FunctionLiteral$ebnf$2", "CodeBlock"], "postprocess": function postprocess(d) {
        return [C.FUNCTION_PRIM, d[1] ? d[1][0] : [], d[2], !!d[0]];
      } }, { "name": "ArgumentList$ebnf$1", "symbols": ["ArgumentListContents"], "postprocess": id }, { "name": "ArgumentList$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "ArgumentList", "symbols": [{ "literal": "(" }, "_", "ArgumentList$ebnf$1", "_", { "literal": ")" }], "postprocess": function postprocess(d) {
        return d[2] ? d[2] : [];
      } }, { "name": "ArgumentListContents", "symbols": ["Argument", "_", { "literal": "," }, "_", "ArgumentListContents"], "postprocess": JoinRecursive }, { "name": "ArgumentListContents", "symbols": ["Argument"] }, { "name": "Argument", "symbols": ["Identifier"], "postprocess": function postprocess(d) {
        return { type: "normal", name: d[0] };
      } }, { "name": "Argument$string$1", "symbols": [{ "literal": "u" }, { "literal": "n" }, { "literal": "e" }, { "literal": "v" }, { "literal": "a" }, { "literal": "l" }, { "literal": "u" }, { "literal": "a" }, { "literal": "t" }, { "literal": "e" }, { "literal": "d" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "Argument", "symbols": ["Argument$string$1", "__", "Identifier"], "postprocess": function postprocess(d) {
        return { type: "unevaluated", name: d[2] };
      } }, { "name": "CodeBlock", "symbols": [{ "literal": "{" }, "Program", { "literal": "}" }], "postprocess": function postprocess(d) {
        return d[1];
      } }, { "name": "ShorthandFunctionLiteral", "symbols": ["ArgumentList", "_", { "literal": ":" }, "_", "Expression"], "postprocess": function postprocess(d) {
        return [C.SHORTHAND_FUNCTION_PRIM, d[0], d[4]];
      } }, { "name": "VariableGetExpression", "symbols": ["Identifier"], "postprocess": function postprocess(d) {
        return [C.VARIABLE_IDENTIFIER, d[0]];
      } }, { "name": "CallFunctionExpression", "symbols": ["Expression", "_", "PassedArgumentList"], "postprocess": function postprocess(d) {
        return [C.FUNCTION_CALL, d[0], d[2]];
      } }, { "name": "PassedArgumentList$ebnf$1", "symbols": ["PassedArgumentListContents"], "postprocess": id }, { "name": "PassedArgumentList$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "PassedArgumentList", "symbols": [{ "literal": "(" }, "_", "PassedArgumentList$ebnf$1", "_", { "literal": ")" }], "postprocess": function postprocess(d) {
        return d[2] ? d[2] : [];
      } }, { "name": "PassedArgumentListContents", "symbols": ["Expression", "_", { "literal": "," }, "_", "PassedArgumentListContents"], "postprocess": JoinRecursive }, { "name": "PassedArgumentListContents", "symbols": ["Expression"] }, { "name": "CallFunctionSurroundExpression$ebnf$1", "symbols": [] }, { "name": "CallFunctionSurroundExpression$ebnf$1$subexpression$1", "symbols": ["Expression", "__"] }, { "name": "CallFunctionSurroundExpression$ebnf$1", "symbols": ["CallFunctionSurroundExpression$ebnf$1$subexpression$1", "CallFunctionSurroundExpression$ebnf$1"], "postprocess": function arrconcat(d) {
        return [d[0]].concat(d[1]);
      } }, { "name": "CallFunctionSurroundExpression", "symbols": [{ "literal": "(" }, "Expression", "__", "Expression", "__", "CallFunctionSurroundExpression$ebnf$1", "Expression", "_", { "literal": ")" }], "postprocess": function postprocess(d) {
        return [C.FUNCTION_CALL, d[3], [d[1]].concat(d[5].map(function (a) {
          return a[0];
        })).concat([d[6]])];
      } }, { "name": "BooleanExpression", "symbols": ["_BooleanExpression"], "postprocess": function postprocess(d) {
        return ["BOOLEAN_PRIM", d[0][0] === "true"];
      } }, { "name": "_BooleanExpression$string$1", "symbols": [{ "literal": "t" }, { "literal": "r" }, { "literal": "u" }, { "literal": "e" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "_BooleanExpression", "symbols": ["_BooleanExpression$string$1"] }, { "name": "_BooleanExpression$string$2", "symbols": [{ "literal": "f" }, { "literal": "a" }, { "literal": "l" }, { "literal": "s" }, { "literal": "e" }], "postprocess": function joiner(d) {
        return d.join('');
      } }, { "name": "_BooleanExpression", "symbols": ["_BooleanExpression$string$2"] }, { "name": "StringExpression", "symbols": ["_StringExpression"], "postprocess": function postprocess(d) {
        return [C.STRING_PRIM, d[0][1]];
      } }, { "name": "_StringExpression", "symbols": [{ "literal": "\"" }, "StringExpressionDoubleContents", { "literal": "\"" }] }, { "name": "_StringExpression", "symbols": [{ "literal": "'" }, "StringExpressionSingleContents", { "literal": "'" }] }, { "name": "StringExpressionDoubleContents$ebnf$1", "symbols": [] }, { "name": "StringExpressionDoubleContents$ebnf$1", "symbols": ["DoubleStringValidCharacter", "StringExpressionDoubleContents$ebnf$1"], "postprocess": function arrconcat(d) {
        return [d[0]].concat(d[1]);
      } }, { "name": "StringExpressionDoubleContents", "symbols": ["StringExpressionDoubleContents$ebnf$1"], "postprocess": function postprocess(d) {
        return d[0].join('');
      } }, { "name": "DoubleStringValidCharacter", "symbols": ["EscapeCode"] }, { "name": "DoubleStringValidCharacter", "symbols": ["GenericValidCharacter"], "postprocess": function postprocess(data, location, reject) {
        if (data[0][0] === '"') return reject;else return data[0][0];
      }
    }, { "name": "StringExpressionSingleContents$ebnf$1", "symbols": [] }, { "name": "StringExpressionSingleContents$ebnf$1", "symbols": ["SingleStringValidCharacter", "StringExpressionSingleContents$ebnf$1"], "postprocess": function arrconcat(d) {
        return [d[0]].concat(d[1]);
      } }, { "name": "StringExpressionSingleContents", "symbols": ["StringExpressionSingleContents$ebnf$1"], "postprocess": function postprocess(d) {
        return d[0].join('');
      } }, { "name": "SingleStringValidCharacter", "symbols": ["EscapeCode"] }, { "name": "SingleStringValidCharacter", "symbols": ["GenericValidCharacter"], "postprocess": function postprocess(data, location, reject) {
        if (data[0][0] === '\'') return reject;else return data[0][0];
      }
    }, { "name": "EscapeCode$subexpression$1", "symbols": [/./] }, { "name": "EscapeCode$subexpression$1", "symbols": [{ "literal": "\n" }] }, { "name": "EscapeCode", "symbols": [{ "literal": "\\" }, "EscapeCode$subexpression$1"], "postprocess": function postprocess(d) {
        return d[1][0];
      } }, { "name": "NumberExpression", "symbols": ["_Number"], "postprocess": function postprocess(d) {
        return [C.NUMBER_PRIM, d[0]];
      } }, { "name": "_Number$ebnf$1", "symbols": [{ "literal": "-" }], "postprocess": id }, { "name": "_Number$ebnf$1", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "_Number$ebnf$2$subexpression$1", "symbols": ["Digits", { "literal": "." }] }, { "name": "_Number$ebnf$2", "symbols": ["_Number$ebnf$2$subexpression$1"], "postprocess": id }, { "name": "_Number$ebnf$2", "symbols": [], "postprocess": function postprocess(d) {
        return null;
      } }, { "name": "_Number", "symbols": ["_Number$ebnf$1", "_Number$ebnf$2", "Digits"], "postprocess": function postprocess(d) {
        var result = "";

        if (d[1]) {
          result = d[1][0] + "." + result;
        }

        result = result + d[2];

        if (d[0] === "-") {
          result = "-" + result;
        }

        return parseFloat(result);
      } }, { "name": "Digits$ebnf$1", "symbols": [/[0-9]/] }, { "name": "Digits$ebnf$1", "symbols": [/[0-9]/, "Digits$ebnf$1"], "postprocess": function arrconcat(d) {
        return [d[0]].concat(d[1]);
      } }, { "name": "Digits", "symbols": ["Digits$ebnf$1"], "postprocess": function postprocess(d) {
        return d[0].join('');
      } }, { "name": "Identifier$ebnf$1", "symbols": ["GenericValidIdentifierCharacter"] }, { "name": "Identifier$ebnf$1", "symbols": ["GenericValidIdentifierCharacter", "Identifier$ebnf$1"], "postprocess": function arrconcat(d) {
        return [d[0]].concat(d[1]);
      } }, { "name": "Identifier", "symbols": ["Identifier$ebnf$1"], "postprocess": function postprocess(data, location, reject) {
        var id = data[0].join('');
        if (/[0-9]/.test(id[0])) {
          return reject;
        }
        if (C.KEYWORDS.indexOf(id) === -1) {
          return id;
        }
        return reject;
      }
    }, { "name": "GenericValidIdentifierCharacter", "symbols": [/./], "postprocess": function postprocess(data, location, reject) {
        //console.log(data[0], location)
        return data[0] && C.SPECIAL_CHARS.indexOf(data[0]) === -1 ? data[0] : reject;
      }
    }, { "name": "GenericValidCharacter", "symbols": [/./], "postprocess": function postprocess(data, location, reject) {
        return data[0] === '\\' ? reject : data;
      }
    }, { "name": "Comment$ebnf$1", "symbols": [] }, { "name": "Comment$ebnf$1", "symbols": [/[^#]/, "Comment$ebnf$1"], "postprocess": function arrconcat(d) {
        return [d[0]].concat(d[1]);
      } }, { "name": "Comment", "symbols": [{ "literal": "#" }, "Comment$ebnf$1", { "literal": "#" }], "postprocess": function postprocess(d) {
        return [C.COMMENT];
      } }],
    ParserStart: "Program"
  };
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = grammar;
  } else {
    window.grammar = grammar;
  }
})();
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.interp = exports.evaluateEachExpression = exports.evaluateGetPropUsingIdentifier = exports.evaluateExpression = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var evaluateExpression = exports.evaluateExpression = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(expression, environment) {
    var ret, fnExpression, argExpressions, fn, varName, args, takingArgs, name, _ret, _name, valueExpression, value, _name2, _valueExpression, _value, paramaters, code, isAsync, _fn, _paramaters, codeExpression, _fn2, string, bool, number, objExpression, key, _valueExpression2, obj, _value2, _objExpression, _key, _obj, _value3;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(expression[0] === C.COMMENT)) {
              _context.next = 4;
              break;
            }

            return _context.abrupt('return');

          case 4:
            if (!(expression instanceof Array && expression.every(function (e) {
              return e instanceof Array;
            }))) {
              _context.next = 9;
              break;
            }

            _context.next = 7;
            return evaluateEachExpression(variables, expression);

          case 7:
            ret = _context.sent;
            return _context.abrupt('return', ret);

          case 9:
            if (!(expression[0] === C.VARIABLE_IDENTIFIER && expression[1] === 'environment')) {
              _context.next = 13;
              break;
            }

            return _context.abrupt('return', environment);

          case 13:
            if (!(expression[0] === C.FUNCTION_CALL)) {
              _context.next = 32;
              break;
            }

            // Call a function: "function(arg1, arg2, arg3...)"

            // Get the function and argument expressions from the expression list.
            fnExpression = expression[1];
            argExpressions = expression[2];

            // Evaluate the function expression to get the actual function.

            _context.next = 18;
            return evaluateExpression(fnExpression, variables);

          case 18:
            fn = _context.sent;
            varName = fnExpression[1];

            if (fn instanceof lib.LFunction) {
              _context.next = 22;
              break;
            }

            throw new Error(chalk.cyan(varName) + ' is not a function');

          case 22:

            fn.argumentScope = variables;
            args = argExpressions;
            takingArgs = fn.paramaterList || [];

            if (!(args.length !== takingArgs.length && !fn.builtin)) {
              _context.next = 27;
              break;
            }

            throw new Error('Function ' + chalk.cyan(varName) + ' expects ' + chalk.bold(takingArgs.length) + ' arguments, was called with ' + chalk.bold(args.length));

          case 27:
            _context.next = 29;
            return lib.call(fn, args);

          case 29:
            return _context.abrupt('return', _context.sent);

          case 32:
            if (!(expression[0] === C.VARIABLE_IDENTIFIER)) {
              _context.next = 42;
              break;
            }

            // Get a variable: "name"

            // Get the name from the expression list.
            name = expression[1];

            // console.log(`Getting variable ${name}...`)
            // console.log(name in variables)

            // Return the variable's value, or, if the variable doesn't exist, throw an
            // error.

            if (!(name in variables)) {
              _context.next = 39;
              break;
            }

            // console.log('Return:', variables[name])
            _ret = variables[name].value;
            return _context.abrupt('return', _ret);

          case 39:
            throw new Error(chalk.cyan(name) + ' is not defined');

          case 40:
            _context.next = 123;
            break;

          case 42:
            if (!(expression[0] === C.VARIABLE_ASSIGN)) {
              _context.next = 52;
              break;
            }

            // Set a variable to a value: "name => value"

            // Get the name and value expression from the expression list.
            _name = expression[1];
            valueExpression = expression[2];

            // console.log(`Setting variable ${name}...`)

            // Evaluate the value of the variable.

            _context.next = 47;
            return evaluateExpression(valueExpression, variables);

          case 47:
            value = _context.sent;


            // console.log(`..value is ${value}`)

            // Set the variable in the variables object to a new variable with the
            // evaluated value.
            variables[_name] = new lib.Variable(value);
            return _context.abrupt('return');

          case 52:
            if (!(expression[0] === C.VARIABLE_CHANGE)) {
              _context.next = 62;
              break;
            }

            // Change a variable to a new value: "name -> newValue"

            // Get the name and value expression from the expression list.
            _name2 = expression[1];
            _valueExpression = expression[2];

            // Evaluate the new value of the variable.

            _context.next = 57;
            return evaluateExpression(_valueExpression, variables);

          case 57:
            _value = _context.sent;


            // Change the value of the already defined variable.
            variables[_name2].value = _value;
            return _context.abrupt('return');

          case 62:
            if (!(expression[0] === C.FUNCTION_PRIM)) {
              _context.next = 73;
              break;
            }

            // A function literal: "[async] [(arg1, arg2, arg3...)] { code }"

            // Get the code and paramaters from the expression list.
            paramaters = expression[1];
            code = expression[2];
            isAsync = expression[3];

            // Create the function using the given code.

            _fn = new lib.LFunction(code);

            // Set the scope variables for the function to a copy of the current
            // variables.

            _fn.setScopeVariables((0, _assign2.default)({}, variables));

            // Set the paramaters for the function to the paramaters taken from the
            // expression list.
            _fn.setParamaters(paramaters);

            _fn.isAsynchronous = isAsync;

            // Return the function.
            return _context.abrupt('return', _fn);

          case 73:
            if (!(expression[0] === C.SHORTHAND_FUNCTION_PRIM)) {
              _context.next = 83;
              break;
            }

            _paramaters = expression[1];
            codeExpression = expression[2];
            _fn2 = new lib.LFunction(codeExpression);

            _fn2.isShorthand = true;
            _fn2.setScopeVariables((0, _assign2.default)({}, variables));
            _fn2.setParamaters(_paramaters);
            return _context.abrupt('return', _fn2);

          case 83:
            if (!(expression[0] === C.STRING_PRIM)) {
              _context.next = 88;
              break;
            }

            // String literal: "contents"

            // Get string from expression list.
            string = expression[1];

            // Convert string to a language-usable string, and return.

            return _context.abrupt('return', lib.toLString(string));

          case 88:
            if (!(expression[0] === C.BOOLEAN_PRIM)) {
              _context.next = 93;
              break;
            }

            // Boolean literal: true/false

            // Get boolean value from expression list.
            bool = expression[1];

            // Convert boolean value to a language-usable boolean, and return.

            return _context.abrupt('return', lib.toLBoolean(bool));

          case 93:
            if (!(expression[0] === C.NUMBER_PRIM)) {
              _context.next = 98;
              break;
            }

            // Number primitive: 1, 2, 3, 4, 7.25, -3, etc.

            // Get number value from expression list.
            number = expression[1];

            // Convert number value to a language-usable number, and return.

            return _context.abrupt('return', lib.toLNumber(number));

          case 98:
            if (!(expression[0] === C.SET_PROP_USING_IDENTIFIER)) {
              _context.next = 112;
              break;
            }

            // Set a property of an object using an identifier literal:
            // "obj.key > value"

            // Get object expression, key, and value expression from expression list.
            objExpression = expression[1];
            key = expression[2];
            _valueExpression2 = expression[3];

            // Evaluate the object and value expressions.

            _context.next = 104;
            return evaluateExpression(objExpression, variables);

          case 104:
            obj = _context.sent;
            _context.next = 107;
            return evaluateExpression(_valueExpression2, variables);

          case 107:
            _value2 = _context.sent;


            // Use lib.set to set the property of the evaluated object.
            lib.set(obj, key, _value2);
            return _context.abrupt('return');

          case 112:
            if (!(expression[0] === C.GET_PROP_USING_IDENTIFIER)) {
              _context.next = 122;
              break;
            }

            // Get a property of an object using an identifier literal: "obj.key"

            // Get object expression and key from the expression list.
            _objExpression = expression[1];
            _key = expression[2];

            // Evaluate the object expression.

            _context.next = 117;
            return evaluateExpression(_objExpression, variables);

          case 117:
            _obj = _context.sent;


            // Get the value from lib.get.
            _value3 = lib.get(_obj, _key);

            // Return the gotten value.

            return _context.abrupt('return', _value3);

          case 122:
            throw new Error('Invalid expression: ' + chalk.cyan(expression[0]));

          case 123:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return function evaluateExpression(_x, _x2) {
    return ref.apply(this, arguments);
  };
}();

var evaluateGetPropUsingIdentifier = exports.evaluateGetPropUsingIdentifier = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(variables, _ref) {
    var _ref2 = (0, _slicedToArray3.default)(_ref, 3);

    var _ = _ref2[0];
    var objExpr = _ref2[1];
    var key = _ref2[2];
    var obj;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return evaluateExpression(objExpr, variables);

          case 2:
            obj = _context2.sent;
            return _context2.abrupt('return', lib.get(obj, key));

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return function evaluateGetPropUsingIdentifier(_x3, _x4) {
    return ref.apply(this, arguments);
  };
}();

var evaluateEachExpression = exports.evaluateEachExpression = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(variables, expressions) {
    var results, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, expression;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            results = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context3.prev = 4;
            _iterator = (0, _getIterator3.default)(expressions);

          case 6:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context3.next = 16;
              break;
            }

            expression = _step.value;
            _context3.t0 = results;
            _context3.next = 11;
            return evaluateExpression(expression, variables);

          case 11:
            _context3.t1 = _context3.sent;

            _context3.t0.push.call(_context3.t0, _context3.t1);

          case 13:
            _iteratorNormalCompletion = true;
            _context3.next = 6;
            break;

          case 16:
            _context3.next = 22;
            break;

          case 18:
            _context3.prev = 18;
            _context3.t2 = _context3['catch'](4);
            _didIteratorError = true;
            _iteratorError = _context3.t2;

          case 22:
            _context3.prev = 22;
            _context3.prev = 23;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 25:
            _context3.prev = 25;

            if (!_didIteratorError) {
              _context3.next = 28;
              break;
            }

            throw _iteratorError;

          case 28:
            return _context3.finish(25);

          case 29:
            return _context3.finish(22);

          case 30:
            return _context3.abrupt('return', results);

          case 31:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[4, 18, 22, 30], [23,, 25, 29]]);
  }));
  return function evaluateEachExpression(_x5, _x6) {
    return ref.apply(this, arguments);
  };
}();

var interp = exports.interp = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(ast, dir) {
    var environment, result;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!ast) {
              _context4.next = 9;
              break;
            }

            environment = new lib.LEnvironment();


            environment.addVars(builtins.makeBuiltins(dir));

            _context4.next = 5;
            return evaluateEachExpression(environment, ast);

          case 5:
            result = _context4.sent;
            return _context4.abrupt('return', { result: result, environment: environment });

          case 9:
            throw new Error('Haha, you didn\'t pass me a tree!');

          case 10:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));
  return function interp(_x7, _x8) {
    return ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var C = require('./constants');
var lib = require('./lib');
var chalk = require('chalk');
var builtins = require('./builtins');
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LFunctionPrototype = exports.LArrayPrototype = exports.LObjectPrototype = exports.LEnvironment = exports.LFunction = exports.LArray = exports.LObject = exports.Token = exports.Variable = exports.defaultCall = exports.call = exports.NumberPrim = exports.BooleanPrim = exports.StringPrim = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _getOwnPropertyNames = require('babel-runtime/core-js/object/get-own-property-names');

var _getOwnPropertyNames2 = _interopRequireDefault(_getOwnPropertyNames);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

// Call function --------------------------------------------------------------

var call = exports.call = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(fn, args) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return fn['__call__'](args);

          case 2:
            return _context.abrupt('return', _context.sent);

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return function call(_x, _x2) {
    return ref.apply(this, arguments);
  };
}();

var defaultCall = exports.defaultCall = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(fnToken, args) {
    var _this = this;

    var argumentValues, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, argument, _ret;

    return _regenerator2.default.wrap(function _callee4$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (!(fnToken.fn instanceof Function)) {
              _context5.next = 34;
              break;
            }

            // it's a javascript function so just call it
            argumentValues = [];
            _iteratorNormalCompletion3 = true;
            _didIteratorError3 = false;
            _iteratorError3 = undefined;
            _context5.prev = 5;
            _iterator3 = (0, _getIterator3.default)(args);

          case 7:
            if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
              _context5.next = 17;
              break;
            }

            argument = _step3.value;
            _context5.t0 = argumentValues;
            _context5.next = 12;
            return interp.evaluateExpression(argument, fnToken.argumentScope);

          case 12:
            _context5.t1 = _context5.sent;

            _context5.t0.push.call(_context5.t0, _context5.t1);

          case 14:
            _iteratorNormalCompletion3 = true;
            _context5.next = 7;
            break;

          case 17:
            _context5.next = 23;
            break;

          case 19:
            _context5.prev = 19;
            _context5.t2 = _context5['catch'](5);
            _didIteratorError3 = true;
            _iteratorError3 = _context5.t2;

          case 23:
            _context5.prev = 23;
            _context5.prev = 24;

            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }

          case 26:
            _context5.prev = 26;

            if (!_didIteratorError3) {
              _context5.next = 29;
              break;
            }

            throw _iteratorError3;

          case 29:
            return _context5.finish(26);

          case 30:
            return _context5.finish(23);

          case 31:
            return _context5.abrupt('return', fnToken.fn(argumentValues));

          case 34:
            return _context5.delegateYield(_regenerator2.default.mark(function _callee3() {
              var isAsynchronous, resolve, donePromise, returnValue, scope, paramaters, _loop, i;

              return _regenerator2.default.wrap(function _callee3$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      // Might this function return anything? We can tell by if the `return`
                      // variable is referenced anywhere within the function's code. If so we
                      // need to do all sorts of promise-y things.
                      //
                      // Of course, this is all very hacky, and we would be better off using an
                      // "async {}" asynchronous function syntax...
                      /*
                      const isAsynchronous = searchTreeFor(
                        fnToken.fn, ['VARIABLE_IDENTIFIER', 'return'],
                        // New function literals get a new return, so ignore those
                        n => n[0] === 'FUNCTION_PRIM')
                      console.log('test:', isAsynchronous)
                      */
                      isAsynchronous = fnToken.isAsynchronous;

                      // Asynchronous things

                      resolve = void 0;
                      donePromise = new _promise2.default(function (_resolve) {
                        resolve = _resolve;
                      });

                      // Not asynchronous things

                      returnValue = null;
                      scope = (0, _assign2.default)({}, fnToken.scopeVariables);

                      scope.return = new Variable(new LFunction(function (_ref) {
                        var _ref2 = (0, _slicedToArray3.default)(_ref, 1);

                        var val = _ref2[0];

                        if (isAsynchronous) {
                          resolve(val);
                        } else {
                          returnValue = val;
                        }
                      }));
                      paramaters = fnToken.paramaterList;
                      _loop = _regenerator2.default.mark(function _loop(i) {
                        var value, paramater, evaluatedValue;
                        return _regenerator2.default.wrap(function _loop$(_context3) {
                          while (1) {
                            switch (_context3.prev = _context3.next) {
                              case 0:
                                value = args[i];
                                paramater = paramaters[i];

                                if (!(paramater.type === 'normal')) {
                                  _context3.next = 9;
                                  break;
                                }

                                _context3.next = 5;
                                return interp.evaluateExpression(value);

                              case 5:
                                evaluatedValue = _context3.sent;

                                scope[paramater.name] = new Variable(evaluatedValue);
                                _context3.next = 10;
                                break;

                              case 9:
                                if (paramater.type === 'unevaluated') {
                                  scope[paramater.name] = new Variable(new LFunction((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
                                    return _regenerator2.default.wrap(function _callee2$(_context2) {
                                      while (1) {
                                        switch (_context2.prev = _context2.next) {
                                          case 0:
                                            _context2.next = 2;
                                            return interp.evaluateExpression(value, fnToken.argumentScope);

                                          case 2:
                                            return _context2.abrupt('return', _context2.sent);

                                          case 3:
                                          case 'end':
                                            return _context2.stop();
                                        }
                                      }
                                    }, _callee2, this);
                                  }))));
                                }

                              case 10:
                              case 'end':
                                return _context3.stop();
                            }
                          }
                        }, _loop, _this);
                      });
                      i = 0;

                    case 9:
                      if (!(i < paramaters.length)) {
                        _context4.next = 14;
                        break;
                      }

                      return _context4.delegateYield(_loop(i), 't0', 11);

                    case 11:
                      i++;
                      _context4.next = 9;
                      break;

                    case 14:
                      if (!fnToken.isShorthand) {
                        _context4.next = 21;
                        break;
                      }

                      _context4.next = 17;
                      return interp.evaluateExpression(fnToken.fn, scope);

                    case 17:
                      _context4.t1 = _context4.sent;
                      return _context4.abrupt('return', {
                        v: _context4.t1
                      });

                    case 21:
                      _context4.next = 23;
                      return interp.evaluateEachExpression(scope, fnToken.fn);

                    case 23:
                      if (!isAsynchronous) {
                        _context4.next = 30;
                        break;
                      }

                      _context4.next = 26;
                      return donePromise;

                    case 26:
                      _context4.t2 = _context4.sent;
                      return _context4.abrupt('return', {
                        v: _context4.t2
                      });

                    case 30:
                      return _context4.abrupt('return', {
                        v: returnValue
                      });

                    case 31:
                    case 'end':
                      return _context4.stop();
                  }
                }
              }, _callee3, _this);
            })(), 't3', 35);

          case 35:
            _ret = _context5.t3;

            if (!((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object")) {
              _context5.next = 38;
              break;
            }

            return _context5.abrupt('return', _ret.v);

          case 38:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee4, this, [[5, 19, 23, 31], [24,, 26, 30]]);
  }));
  return function defaultCall(_x3, _x4) {
    return ref.apply(this, arguments);
  };
}();

// Has function ---------------------------------------------------------------

exports.toJString = toJString;
exports.toJBoolean = toJBoolean;
exports.toJNumber = toJNumber;
exports.toLString = toLString;
exports.toLBoolean = toLBoolean;
exports.toLNumber = toLNumber;
exports.toLObject = toLObject;
exports.searchTreeFor = searchTreeFor;
exports.has = has;
exports.get = get;
exports.defaultGet = defaultGet;
exports.set = set;
exports.defaultSet = defaultSet;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var interp = require('./interp');
var C = require('./constants');
var equal = require('deep-equal');

var StringPrim = exports.StringPrim = function () {
  function StringPrim(str) {
    (0, _classCallCheck3.default)(this, StringPrim);

    this.str = str;
  }

  (0, _createClass3.default)(StringPrim, [{
    key: 'toString',
    value: function toString() {
      return '<String ' + this.str + '>';
    }
  }, {
    key: 'str',
    set: function set(str) {
      this._str = String(str);
    },
    get: function get() {
      return String(this._str);
    }
  }]);
  return StringPrim;
}();

var BooleanPrim = exports.BooleanPrim = function () {
  function BooleanPrim(bool) {
    (0, _classCallCheck3.default)(this, BooleanPrim);

    this.bool = bool;
  }

  (0, _createClass3.default)(BooleanPrim, [{
    key: 'valueOf',
    value: function valueOf() {
      return this.bool;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '<Boolean ' + this.bool + '>';
    }
  }, {
    key: 'bool',
    set: function set(bool) {
      this._bool = Boolean(bool);
    },
    get: function get() {
      return Boolean(this._bool);
    }
  }]);
  return BooleanPrim;
}();

var NumberPrim = exports.NumberPrim = function () {
  function NumberPrim(num) {
    (0, _classCallCheck3.default)(this, NumberPrim);

    this.num = num;
  }

  (0, _createClass3.default)(NumberPrim, [{
    key: 'valueOf',
    value: function valueOf() {
      return this.num;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '<Number ' + this.num + '>';
    }
  }, {
    key: 'num',
    set: function set(num) {
      this._num = Number(num);
    },
    get: function get() {
      return Number(this._num);
    }
  }]);
  return NumberPrim;
}();

// Converting language primatives to JS prims ---------------------------------

function toJString(str) {
  if (str instanceof StringPrim) {
    return str.str;
  } else {
    return String(str);
  }
}

function toJBoolean(bool) {
  if (bool instanceof BooleanPrim && bool.bool === true) {
    return true;
  } else {
    return false;
  }
}

function toJNumber(num) {
  if (num instanceof NumberPrim) {
    return num.num;
  } else {
    return Number(num);
  }
}

// Converting JS prims to language primitives ---------------------------------

function toLString(str) {
  return new StringPrim(str);
}

function toLBoolean(bool) {
  return new BooleanPrim(bool);
}

function toLNumber(num) {
  return new NumberPrim(num);
}

function toLObject(data) {
  var obj = new LObject();
  for (var key in data) {
    set(obj, key, data[key]);
  }
  return obj;
}

// Tree parsing stuff ---------------------------------------------------------

function searchTreeFor(innerTree, searchFor, reject) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(innerTree), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var treeNode = _step.value;

      if (equal(treeNode, searchFor)) {
        return true;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = (0, _getIterator3.default)(innerTree.filter(function (n) {
      return n instanceof Array;
    }).filter(function (n) {
      return !(reject ? reject(n) : false);
    })), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _treeNode = _step2.value;

      if (searchTreeFor(_treeNode, searchFor, reject)) {
        return true;
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return false;
}function has(obj, key) {
  return key in obj;
}

// Get function ---------------------------------------------------------------

function get(obj, key) {
  return obj['__get__'](key);
}

function defaultGet(obj, key) {
  var keyString = toJString(key);
  if (keyString in obj.data) {
    return obj.data[keyString];
  } else {
    var _constructor = obj['__constructor__'];
    var prototype = _constructor['__prototype__'];
    var current = _constructor;
    while (current && prototype && !(key in prototype)) {
      current = current['__super__'];
      prototype = current ? current['__prototype__'] : null;
    }
    if (current) {
      var _ret3 = function () {
        var value = prototype[keyString];
        if (value instanceof LFunction) {
          // I was going to just bind to obj, but that generally involves using
          // the oh so terrible `this`.
          // Instead it returns a function that calls the given function with
          // obj as the first paramater.
          return {
            v: new LFunction(function () {
              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              return value.fn.apply(value, [obj].concat(args));
            })
          };
        }
        return {
          v: value
        };
      }();

      if ((typeof _ret3 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret3)) === "object") return _ret3.v;
    }
  }
}

// Set function ---------------------------------------------------------------

function set(obj, key, value) {
  return obj['__set__'](key, value);
}

function defaultSet(obj, key, value) {
  return obj.data[toJString(key)] = value;
}

// Variable class -------------------------------------------------------------
// * this should never *ever* be accessed through anywhere except set/get
//   Variable functions
// * takes one paramater, value, which is stored in inst.value and represents
//   the value of the Variable

var Variable = exports.Variable = function () {
  function Variable(value) {
    (0, _classCallCheck3.default)(this, Variable);

    this.value = value;
  }

  (0, _createClass3.default)(Variable, [{
    key: 'toString',
    value: function toString() {
      return '<Variable>';
    }
  }]);
  return Variable;
}();

// Base token class -----------------------------------------------------------
// * doesn't do anything on its own
// * use x instanceof Token to check if x is any kind of token

var Token = exports.Token = function Token() {
  (0, _classCallCheck3.default)(this, Token);
};

// Object token class ---------------------------------------------------------

var LObject = exports.LObject = function (_Token) {
  (0, _inherits3.default)(LObject, _Token);

  function LObject() {
    (0, _classCallCheck3.default)(this, LObject);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LObject).call(this));

    _this2.data = {};
    _this2['__constructor__'] = LObject;
    return _this2;
  }

  (0, _createClass3.default)(LObject, [{
    key: '__get__',
    value: function __get__(key) {
      return defaultGet(this, key);
    }
  }, {
    key: '__set__',
    value: function __set__(key, value) {
      return defaultSet(this, key, value);
    }
  }]);
  return LObject;
}(Token);

var LArray = exports.LArray = function (_LObject) {
  (0, _inherits3.default)(LArray, _LObject);

  function LArray() {
    (0, _classCallCheck3.default)(this, LArray);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LArray).call(this));

    _this3['__constructor__'] = LArray;
    _this3.data.length = 0;
    return _this3;
  }

  return LArray;
}(LObject);

// Function token class -------------------------------------------------------
// [[this needs to be rewritten]]
// * takes one paramater, fn, which is stored in inst.fn and represents the
//     function that will be called
// * you can also set scopeVariables (using setScopeVariables), which is
//     generally only used for internal creation of function expressions; it
//     represents the closure Variables that can be accessed from within the
//     function
// * you can also set fnArguments (using setArguments), which is generally also
//     only used for internal creation of function expressions; it tells what
//     call arguments should be mapped to in the Variables context of running
//     the code block
// * use inst.__call__ to call the function (with optional arguments)

var LFunction = exports.LFunction = function (_LObject2) {
  (0, _inherits3.default)(LFunction, _LObject2);

  function LFunction(fn, asynchronous) {
    (0, _classCallCheck3.default)(this, LFunction);

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LFunction).call(this));

    _this4['__constructor__'] = LFunction;
    _this4.fn = fn;
    _this4.scopeVariables = null;

    _this4.unevaluatedArgs = [];
    _this4.normalArgs = [];
    if (asynchronous) _this4.isAsynchronous = true;
    return _this4;
  }

  (0, _createClass3.default)(LFunction, [{
    key: '__call__',
    value: function __call__(args) {
      // Call this function. By default uses defaultCall, but can be overriden
      // by subclasses.
      return defaultCall(this, args);
    }
  }, {
    key: 'setScopeVariables',
    value: function setScopeVariables(scopeVariables) {
      this.scopeVariables = scopeVariables;
    }
  }, {
    key: 'setParamaters',
    value: function setParamaters(paramaterList) {
      this.paramaterList = paramaterList;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '<Function>';
    }
  }]);
  return LFunction;
}(LObject);

var LEnvironment = exports.LEnvironment = function () {
  function LEnvironment() {
    (0, _classCallCheck3.default)(this, LEnvironment);

    this['__constructor__'] = LEnvironment;
    this.vars = {};
  }

  (0, _createClass3.default)(LEnvironment, [{
    key: 'addVars',
    value: function addVars(variables) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = (0, _getIterator3.default)((0, _getOwnPropertyNames2.default)(variables)), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var name = _step4.value;

          this.vars[name] = variables[name];
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }, {
    key: '__set__',
    value: function __set__(variableName, value) {
      this.vars[variableName] = new Variable(value);
    }
  }, {
    key: '__get__',
    value: function __get__(variableName) {
      return this.vars[variableName].value;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return (0, _stringify2.default)((0, _keys2.default)(this.vars));
    }
  }]);
  return LEnvironment;
}();

// ETC. that requires above definitions ---------------------------------------

var LObjectPrototype = exports.LObjectPrototype = {};

var LArrayPrototype = exports.LArrayPrototype = {
  push: new LFunction(function (self, what) {
    self.data[self.data.length] = what;
    self.data.length = self.data.length + 1;
  }),
  pop: new LFunction(function (self) {
    delete self.data[self.data.length - 1];
    self.data.length = self.data.length - 1;
  })
};

var LFunctionPrototype = exports.LFunctionPrototype = {
  debug: new LFunction(function (self) {
    console.log('** DEBUG **');
    console.log(self.fn.toString());
  })
};

LObject['__prototype__'] = LObjectPrototype;
LObject['__super__'] = null;

LArray['__prototype__'] = LArrayPrototype;
LArray['__super__'] = LObject;

LFunction['__prototype__'] = LFunctionPrototype;
LFunction['__super__'] = LObject;
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var run = exports.run = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(code, dir) {
    var parser, asts, line, lines, i, char, ln, _escape, result;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
            asts = void 0;
            _context.prev = 2;

            asts = parser.feed(code).results;
            _context.next = 17;
            break;

          case 6:
            _context.prev = 6;
            _context.t0 = _context['catch'](2);

            // there's been a syntax error :(

            line = 1;
            lines = code.split('\n');

            lines.unshift('');
            for (i = 0; i < _context.t0.offset; i++) {
              char = code[i];

              if (char == '\n') line++;
            }

            ln = lines[line];


            if (line - 1 > 0) console.log(chalk.bold(line - 1), lines[line - 1]);
            if (line) console.log(chalk.bold(line), chalk.red(ln));
            if (line + 1 < lines.length) console.log(chalk.bold(line + 1), lines[line + 1]);
            throw new Error(chalk.red('\nSyntax Error at ' + chalk.cyan('line ' + line) + '!'));

          case 17:

            if (asts.length > 1) {
              console.warn(chalk.red.bold('!! AMBIGUOUS SYNTAX !!'));
              _escape = String.fromCharCode(27);

              asts.forEach(function (ast, i) {
                console.warn((0, _stringify2.default)(ast, null, 0));
                console.warn('\n----------------------------\n');
              }) - console.warn(chalk.yellow('\nA total of ' + chalk.cyan(asts.length) + ' ASTs were generated.\nPlease report this on the official issue tracker:\nhttps://github.com/liam4/tlnccuwagnf/issues\nUsing first AST.\n'));
            }

            _context.next = 20;
            return interp.interp(asts[0], dir);

          case 20:
            result = _context.sent;
            return _context.abrupt('return', result);

          case 22:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[2, 6]]);
  }));
  return function run(_x, _x2) {
    return ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var nearley = require('nearley');
var grammar = require('./grammar');
var interp = require('./interp');
var chalk = require('chalk');
'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _taggedTemplateLiteral2 = require('babel-runtime/helpers/taggedTemplateLiteral');

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _templateObject = (0, _taggedTemplateLiteral3.default)(['hello!'], ['hello!']),
    _templateObject2 = (0, _taggedTemplateLiteral3.default)(['single quoted'], ['single quoted']),
    _templateObject3 = (0, _taggedTemplateLiteral3.default)(['foobar'], ['foobar']),
    _templateObject4 = (0, _taggedTemplateLiteral3.default)(['single quoted \'escape'], ['single quoted \'escape']),
    _templateObject5 = (0, _taggedTemplateLiteral3.default)(['double quoted "escape'], ['double quoted "escape']),
    _templateObject6 = (0, _taggedTemplateLiteral3.default)(['newline\nescape'], ['newline\\nescape']),
    _templateObject7 = (0, _taggedTemplateLiteral3.default)(['escape \\escape'], ['escape \\\\escape']),
    _templateObject8 = (0, _taggedTemplateLiteral3.default)(['\'single\' and "double"'], ['\'single\' and "double"']),
    _templateObject9 = (0, _taggedTemplateLiteral3.default)(['7'], ['7']),
    _templateObject10 = (0, _taggedTemplateLiteral3.default)(['-1'], ['-1']),
    _templateObject11 = (0, _taggedTemplateLiteral3.default)(['12'], ['12']),
    _templateObject12 = (0, _taggedTemplateLiteral3.default)(['0.75'], ['0.75']),
    _templateObject13 = (0, _taggedTemplateLiteral3.default)(['3.005'], ['3.005']),
    _templateObject14 = (0, _taggedTemplateLiteral3.default)(['good'], ['good']),
    _templateObject15 = (0, _taggedTemplateLiteral3.default)(['false'], ['false']),
    _templateObject16 = (0, _taggedTemplateLiteral3.default)(['true'], ['true']),
    _templateObject17 = (0, _taggedTemplateLiteral3.default)(['thisisawesome'], ['thisisawesome']),
    _templateObject18 = (0, _taggedTemplateLiteral3.default)(['bar'], ['bar']),
    _templateObject19 = (0, _taggedTemplateLiteral3.default)(['baz'], ['baz']);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var equal = require('deep-equal');
var chalk = require('chalk');
var run = require('../req.js');
var oldLog = console.log;

var passed = 0;
var tests = 0;

var area = function area(title) {
  console.log('\n   ' + chalk.bold(title) + ' ' + '-'.repeat(30 - title.length));
};

var test = function test(code, assume, title) {
  title = (title || code).toLowerCase();
  tests++;
  var out = [];
  console.log = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    out.push(args);
  };
  chalk.enabled = false;
  var promise = run(code, __dirname, true);
  promise.then(function () {
    chalk.enabled = true;
    console.log = oldLog;
    if (!assume(out)) {
      oldLog(chalk.red(' ✗ ' + title));
      oldLog(out);
    } else {
      passed++;
      oldLog(chalk.green(' ✓ ' + title));
    }
  });
  return promise;
};

var checkOut = function checkOut(compare) {
  // this should be called like this:
  // test(code, checkOut`compareThis`)
  // or like this:
  // test(code, checkOut(compareThese))

  return function (result) {
    return equal(result[0], compare);
  };
};

console.time('Total tests time');
// semicolon so that it doesn't think console.time(...)(async function...)

(0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;

          area('Print');
          // Test print output
          _context.next = 4;
          return test('print("hello!");', checkOut(_templateObject), 'basic usage');

        case 4:
          _context.next = 6;
          return test('print("hello", "world");', checkOut(['hello', 'world']), 'Multiple Arguments');

        case 6:
          _context.next = 8;
          return test('print({}, 123.456);', checkOut(['function', '123.456']), 'Types');

        case 8:

          /* Commented this out. It works because of this grammar definition:
           * _Program -> ...
           *           | ...
           *           | Command
           * So a program can be a single command -- that's why this works.
           */
          /*
          try {
            // WHY IS THIS WORKING!?!?!?!?!?!??
            test('print("hello! this should not work!")\n', checkOut`hello! this should not work!`)
          } catch (err) {
            console.log('Newline as separator doesn\'t work, but it hasn\'t been' +
                        'implemented yet so that\'s okay.')
          }
          */
          // Test single quoted string
          area('Strings');
          _context.next = 11;
          return test('print(\'single quoted\');', checkOut(_templateObject2), 'Single Quotes');

        case 11:
          _context.next = 13;
          return test('print(concat("foo", "bar"));', checkOut(_templateObject3), 'Double Quotes');

        case 13:

          area('String Escapes');
          _context.next = 16;
          return test('print(\'single quoted \\\'escape\');', checkOut(_templateObject4), 'Single Quotes');

        case 16:
          _context.next = 18;
          return test('print("double quoted \\"escape");', checkOut(_templateObject5), 'Double Quotes');

        case 18:
          _context.next = 20;
          return test('print(\'newline\\\nescape\');', checkOut(_templateObject6), 'Newline');

        case 20:
          _context.next = 22;
          return test('print(\'escape \\\\escape\');', checkOut(_templateObject7), 'Backslash');

        case 22:
          _context.next = 24;
          return test('print(\'\\\'single\\\' and \\"double\\"\')', checkOut(_templateObject8), 'Single & Double Quotes');

        case 24:

          area('Math');
          // Test basic math operator functions
          _context.next = 27;
          return test('print(+(3, 4));', checkOut(_templateObject9), '+ add');

        case 27:
          _context.next = 29;
          return test('print(-(3, 4));', checkOut(_templateObject10), '- subtract');

        case 29:
          _context.next = 31;
          return test('print(*(3, 4));', checkOut(_templateObject11), '* multiply');

        case 31:
          _context.next = 33;
          return test('print(/(3, 4));', checkOut(_templateObject12), '/ divide');

        case 33:
          _context.next = 35;
          return test('print(+(1.25, 1.755));', checkOut(_templateObject13), '  decimals');

        case 35:

          area('Conditionals');
          // Test basic if
          _context.next = 38;
          return test('\n    if(true, {\n      print("good");\n    });', checkOut(_templateObject14), 'if');

        case 38:
          _context.next = 40;
          return test('\n    ifel(false, {\n      print("bad");\n    }, {\n      print("good");\n    });', checkOut(_templateObject14), 'ifel');

        case 40:
          _context.next = 42;
          return test('\n    if(false, {\n      print("bad");\n    }, {\n      print("good");\n    });', checkOut(_templateObject14), 'else');

        case 42:

          area('Logic & Comparison');
          // Test logic operator functions
          _context.next = 45;
          return test('print(and(true, false));', checkOut(_templateObject15), '& and');

        case 45:
          _context.next = 47;
          return test('print(or(true, false));', checkOut(_templateObject16), '| or');

        case 47:
          _context.next = 49;
          return test('print(not(true), not(false));', checkOut(['false', 'true']), '! not');

        case 49:
          _context.next = 51;
          return test('print(eq(10, 20), eq(45, 45));', checkOut(['false', 'true']), '= eq');

        case 51:
          _context.next = 53;
          return test('print(lt(10, 20), lt(70, 30), lt(45, 45));', checkOut(['true', 'false', 'false']), '< lt');

        case 53:
          _context.next = 55;
          return test('print(gt(10, 20), gt(70, 30), gt(45, 45));', checkOut(['false', 'true', 'false']), '> gt');

        case 55:

          area('Surround Functions');
          _context.next = 58;
          return test('print((true and false), (true & true), (99 + 1), (1 - 1), (20 > 1))', checkOut(['false', 'true', '100', '0', 'true']), 'basic usage');

        case 58:
          _context.next = 60;
          return test('print((\'this\' concat \'is\' \'awesome\'))', checkOut(_templateObject17), 'tertiary argument');

        case 60:

          area('Variables');
          _context.next = 63;
          return test('foo => \'bar\'; print(foo);', checkOut(_templateObject18), 'assigning & accessing');

        case 63:
          _context.next = 65;
          return test('foo => \'bar\'; foo -> \'baz\'; print(foo);', checkOut(_templateObject19), 'changing');

        case 65:
          _context.next = 72;
          break;

        case 67:
          _context.prev = 67;
          _context.t0 = _context['catch'](0);

          console.log = oldLog;
          console.log('\x1b[31m[Errored!]\x1b[0m Error in JS:');
          console.error(_context.t0);

        case 72:
          console.log('\n');
          console.timeEnd('Total tests time');
          console.log(chalk.bold(passed + '/' + tests + ' tests passed.'));

          if (passed < tests) process.exit(1);

        case 76:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this, [[0, 67]]);
}))();
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var lib = require('../lib');

var lol = exports.lol = new lib.LFunction(function () {
  console.log('Lololol!');
  return lib.toLNumber(1337);
});
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = exports.server = exports.LHTTPRequest = exports.LHTTPServer = exports.LHTTPServerRequest = exports.LHTTPServerResponse = undefined;

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lib = require('../lib');
var http = require('http');
var https = require('https');
var url = require('url');

var LHTTPServerResponse = exports.LHTTPServerResponse = function (_lib$LObject) {
  (0, _inherits3.default)(LHTTPServerResponse, _lib$LObject);

  function LHTTPServerResponse(res) {
    (0, _classCallCheck3.default)(this, LHTTPServerResponse);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LHTTPServerResponse).call(this));

    _this['__constructor__'] = LHTTPServerResponse;
    _this.res = res;
    return _this;
  }

  return LHTTPServerResponse;
}(lib.LObject);

var LHTTPServerResponsePrototype = {
  write: new lib.LFunction(function (self, _ref) {
    var _ref2 = (0, _slicedToArray3.default)(_ref, 1);

    var what = _ref2[0];

    self.res.write(lib.toJString(what));
  }),
  end: new lib.LFunction(function (self) {
    self.res.end();
  })
};

LHTTPServerResponse['__prototype__'] = LHTTPServerResponsePrototype;
LHTTPServerResponse['__super__'] = lib.LObject;

var LHTTPServerRequest = exports.LHTTPServerRequest = function (_lib$LObject2) {
  (0, _inherits3.default)(LHTTPServerRequest, _lib$LObject2);

  function LHTTPServerRequest(req) {
    (0, _classCallCheck3.default)(this, LHTTPServerRequest);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LHTTPServerRequest).call(this));

    _this2['__constructor__'] = LHTTPServerRequest;
    _this2.req = req;
    return _this2;
  }

  return LHTTPServerRequest;
}(lib.LObject);

var LHTTPServerRequestPrototype = {
  url: new lib.LFunction(function (self) {
    return lib.toLString(self.req.url);
  }),
  method: new lib.LFunction(function (self) {
    return lib.toLString(self.req.method);
  })
};

LHTTPServerRequest['__prototype__'] = LHTTPServerRequestPrototype;
LHTTPServerRequest['__super__'] = lib.LObject;

var LHTTPServer = exports.LHTTPServer = function (_lib$LObject3) {
  (0, _inherits3.default)(LHTTPServer, _lib$LObject3);

  function LHTTPServer(handle) {
    (0, _classCallCheck3.default)(this, LHTTPServer);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LHTTPServer).call(this));

    _this3['__constructor__'] = LHTTPServer;

    _this3.server = http.createServer(function (req, res) {
      lib.call(handle, [new LHTTPServerRequest(req), new LHTTPServerResponse(res)]);
    });
    return _this3;
  }

  return LHTTPServer;
}(lib.LObject);

var LHTTPServerPrototype = {
  listen: new lib.LFunction(function (self, _ref3) {
    var _ref4 = (0, _slicedToArray3.default)(_ref3, 1);

    var port = _ref4[0];

    port = lib.toJNumber(port);
    self.server.listen(port);
  })
};

LHTTPServer['__prototype__'] = LHTTPServerPrototype;
LHTTPServer['__super__'] = lib.LObject;

var LHTTPRequest = exports.LHTTPRequest = function (_lib$LObject4) {
  (0, _inherits3.default)(LHTTPRequest, _lib$LObject4);

  function LHTTPRequest(method, url, callback) {
    (0, _classCallCheck3.default)(this, LHTTPRequest);

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LHTTPRequest).call(this));

    _this4['__constructor__'] = LHTTPRequest;
    _this4.method = method;
    _this4.url = url;
    _this4.cb = callback;
    return _this4;
  }

  return LHTTPRequest;
}(lib.LObject);

var LHTTPRequestPrototype = {
  send: new lib.LFunction(function (self) {
    var handle = function handle(response) {
      var body = '';
      response.setEncoding('utf8');
      response.on('data', function (d) {
        body += d.toString();
      });
      response.on('end', function () {
        lib.call(self.cb, [lib.toLString(body)]);
      });
    };

    var u = url.parse(lib.toJString(self.url));
    var isGet = lib.toJString(self.method).toLowerCase() === 'get';
    if (u.protocol === 'http:') {
      if (isGet) {
        http.get(lib.toJString(self.url), handle);
      } else {
        console.log('Invalid method:', lib.toJString(self.method));
      }
    } else if (u.protocol === 'https:') {
      if (isGet) {
        https.get(lib.toJString(self.url), handle);
      } else {
        console.log('Invalid method:', lib.toJString(self.method));
      }
    } else {
      console.log('Invalid protocol:', u.protocol);
    }
  })
};

LHTTPRequest['__prototype__'] = LHTTPRequestPrototype;
LHTTPRequest['__super__'] = lib.LObject;

var server = exports.server = new lib.LFunction(function (_ref5) {
  var _ref6 = (0, _slicedToArray3.default)(_ref5, 1);

  var handle = _ref6[0];

  return new LHTTPServer(handle);
});

var request = exports.request = new lib.LFunction(function (_ref7) {
  var _ref8 = (0, _slicedToArray3.default)(_ref7, 3);

  var method = _ref8[0];
  var url = _ref8[1];
  var callback = _ref8[2];

  return new LHTTPRequest(method, url, callback);
});
//# sourceMappingURL=all.js.map
