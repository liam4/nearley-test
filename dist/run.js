'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;
var nearley = require('nearley');
var grammar = require('./grammar');
var interp = require('./interp');

function run(code, options) {
  var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
  var asts = parser.feed(code).results;

  if (asts.length > 1) {
    console.warn('!! AMBIGUOUS SYNTAX !!');
    var _escape = String.fromCharCode(27);
    asts.forEach(function (ast, i) {
      console.warn(JSON.stringify(ast, null, 0));
      console.warn('\n----------------------------\n');
    });
    console.warn('\nA total of ' + asts.length + ' ASTs were generated.\nPlease report this on the official issue tracker:\nhttps://github.com/liam4/tlnccuwagnf/issues\nUsing first AST.\n');
  }

  var result = interp.interp(asts[0], options);
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQUlnQjtBQUpoQixJQUFNLFVBQVUsUUFBUSxTQUFSLENBQVY7QUFDTixJQUFNLFVBQVUsUUFBUSxXQUFSLENBQVY7QUFDTixJQUFNLFNBQVMsUUFBUSxVQUFSLENBQVQ7O0FBRUMsU0FBUyxHQUFULENBQWEsSUFBYixFQUFtQixPQUFuQixFQUE0QjtBQUNqQyxNQUFJLFNBQVMsSUFBSSxRQUFRLE1BQVIsQ0FBZSxRQUFRLFdBQVIsRUFBcUIsUUFBUSxXQUFSLENBQWpELENBRDZCO0FBRWpDLE1BQUksT0FBTyxPQUFPLElBQVAsQ0FBWSxJQUFaLEVBQWtCLE9BQWxCLENBRnNCOztBQUlqQyxNQUFHLEtBQUssTUFBTCxHQUFjLENBQWQsRUFBaUI7QUFDbEIsWUFBUSxJQUFSLENBQWEsd0JBQWIsRUFEa0I7QUFFbEIsUUFBSSxVQUFTLE9BQU8sWUFBUCxDQUFvQixFQUFwQixDQUFULENBRmM7QUFHbEIsU0FBSyxPQUFMLENBQWEsVUFBUyxHQUFULEVBQWMsQ0FBZCxFQUFpQjtBQUM1QixjQUFRLElBQVIsQ0FBYSxLQUFLLFNBQUwsQ0FBZSxHQUFmLEVBQW9CLElBQXBCLEVBQTBCLENBQTFCLENBQWIsRUFENEI7QUFFNUIsY0FBUSxJQUFSLENBQWEsa0NBQWIsRUFGNEI7S0FBakIsQ0FBYixDQUhrQjtBQU9sQixZQUFRLElBQVIsbUJBQ1MsS0FBSyxNQUFMLDhJQURULEVBUGtCO0dBQXBCOztBQWVBLE1BQUksU0FBUyxPQUFPLE1BQVAsQ0FBYyxLQUFLLENBQUwsQ0FBZCxFQUF1QixPQUF2QixDQUFULENBbkI2QjtBQW9CakMsU0FBTyxNQUFQLENBcEJpQztDQUE1QiIsImZpbGUiOiJydW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBuZWFybGV5ID0gcmVxdWlyZSgnbmVhcmxleScpXG5jb25zdCBncmFtbWFyID0gcmVxdWlyZSgnLi9ncmFtbWFyJylcbmNvbnN0IGludGVycCA9IHJlcXVpcmUoJy4vaW50ZXJwJylcblxuZXhwb3J0IGZ1bmN0aW9uIHJ1bihjb2RlLCBvcHRpb25zKSB7XG4gIGxldCBwYXJzZXIgPSBuZXcgbmVhcmxleS5QYXJzZXIoZ3JhbW1hci5QYXJzZXJSdWxlcywgZ3JhbW1hci5QYXJzZXJTdGFydClcbiAgbGV0IGFzdHMgPSBwYXJzZXIuZmVlZChjb2RlKS5yZXN1bHRzXG5cbiAgaWYoYXN0cy5sZW5ndGggPiAxKSB7XG4gICAgY29uc29sZS53YXJuKCchISBBTUJJR1VPVVMgU1lOVEFYICEhJylcbiAgICBsZXQgZXNjYXBlID0gU3RyaW5nLmZyb21DaGFyQ29kZSgyNylcbiAgICBhc3RzLmZvckVhY2goZnVuY3Rpb24oYXN0LCBpKSB7XG4gICAgICBjb25zb2xlLndhcm4oSlNPTi5zdHJpbmdpZnkoYXN0LCBudWxsLCAwKSlcbiAgICAgIGNvbnNvbGUud2FybignXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcbicpXG4gICAgfSlcbiAgICBjb25zb2xlLndhcm4oYFxuQSB0b3RhbCBvZiAke2FzdHMubGVuZ3RofSBBU1RzIHdlcmUgZ2VuZXJhdGVkLlxuUGxlYXNlIHJlcG9ydCB0aGlzIG9uIHRoZSBvZmZpY2lhbCBpc3N1ZSB0cmFja2VyOlxuaHR0cHM6Ly9naXRodWIuY29tL2xpYW00L3RsbmNjdXdhZ25mL2lzc3Vlc1xuVXNpbmcgZmlyc3QgQVNULlxuYClcbiAgfVxuXG4gIGxldCByZXN1bHQgPSBpbnRlcnAuaW50ZXJwKGFzdHNbMF0sIG9wdGlvbnMpXG4gIHJldHVybiByZXN1bHRcbn1cbiJdfQ==