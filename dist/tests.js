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

require('string.prototype.repeat');

var equal = require('deep-equal');
var chalk = require('chalk');
var run = require('../req.js');

module.exports = function doTests() {
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
    promise.catch(function (e) {
      console.log = oldLog;
      console.error(e);
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
  return (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
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
            return test('\n      if(true, {\n        print("good");\n      });', checkOut(_templateObject14), 'if');

          case 38:
            _context.next = 40;
            return test('\n      ifel(false, {\n        print("bad");\n      }, {\n        print("good");\n      });', checkOut(_templateObject14), 'ifel');

          case 40:
            _context.next = 42;
            return test('\n      if(false, {\n        print("bad");\n      }, {\n        print("good");\n      });', checkOut(_templateObject14), 'else');

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
            _context.next = 73;
            break;

          case 67:
            _context.prev = 67;
            _context.t0 = _context['catch'](0);

            console.log = oldLog;
            console.log('\x1b[31m[Errored!]\x1b[0m Error in JS:');
            console.error(_context.t0.stack);
            process.exit(1);

          case 73:
            console.log('\n');
            console.timeEnd('Total tests time');
            console.log(chalk.bold(passed + '/' + tests + ' tests passed.'));

            if (passed < tests) process.exit(1);

          case 77:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 67]]);
  }))();
};
//# sourceMappingURL=tests.js.map
