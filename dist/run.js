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
//# sourceMappingURL=run.js.map
