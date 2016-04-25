'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;
var nearley = require('nearley');
var grammar = require('./grammar');
var interp = require('./interp');

function run(code, dir) {
  var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
  var asts = parser.feed(code).results;

  if (asts.length > 1) {
    console.warn('!! AMBIGUOUS SYNTAX !!');
    var _escape = String.fromCharCode(27);
    asts.forEach(function (ast, i) {
      console.warn(JSON.stringify(ast, null, 0));
      console.warn('\n----------------------------\n');
    }) - console.warn('\nA total of ' + asts.length + ' ASTs were generated.\nPlease report this on the official issue tracker:\nhttps://github.com/liam4/tlnccuwagnf/issues\nUsing first AST.\n');
  }

  var result = interp.interp(asts[0], dir);
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQUlnQixHLEdBQUEsRztBQUpoQixJQUFNLFVBQVUsUUFBUSxTQUFSLENBQWhCO0FBQ0EsSUFBTSxVQUFVLFFBQVEsV0FBUixDQUFoQjtBQUNBLElBQU0sU0FBUyxRQUFRLFVBQVIsQ0FBZjs7QUFFTyxTQUFTLEdBQVQsQ0FBYSxJQUFiLEVBQW1CLEdBQW5CLEVBQXdCO0FBQzdCLE1BQUksU0FBUyxJQUFJLFFBQVEsTUFBWixDQUFtQixRQUFRLFdBQTNCLEVBQXdDLFFBQVEsV0FBaEQsQ0FBYjtBQUNBLE1BQUksT0FBTyxPQUFPLElBQVAsQ0FBWSxJQUFaLEVBQWtCLE9BQTdCOztBQUVBLE1BQUksS0FBSyxNQUFMLEdBQWMsQ0FBbEIsRUFBcUI7QUFDbkIsWUFBUSxJQUFSLENBQWEsd0JBQWI7QUFDQSxRQUFJLFVBQVMsT0FBTyxZQUFQLENBQW9CLEVBQXBCLENBQWI7QUFDQSxTQUFLLE9BQUwsQ0FBYSxVQUFTLEdBQVQsRUFBYyxDQUFkLEVBQWlCO0FBQzVCLGNBQVEsSUFBUixDQUFhLEtBQUssU0FBTCxDQUFlLEdBQWYsRUFBb0IsSUFBcEIsRUFBMEIsQ0FBMUIsQ0FBYjtBQUNBLGNBQVEsSUFBUixDQUFhLGtDQUFiO0FBQ0QsS0FIRCxJQUlBLFFBQVEsSUFBUixtQkFDUyxLQUFLLE1BRGQsK0lBSkE7QUFVRDs7QUFFRCxNQUFJLFNBQVMsT0FBTyxNQUFQLENBQWMsS0FBSyxDQUFMLENBQWQsRUFBdUIsR0FBdkIsQ0FBYjtBQUNBLFNBQU8sTUFBUDtBQUNEIiwiZmlsZSI6InJ1bi5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IG5lYXJsZXkgPSByZXF1aXJlKCduZWFybGV5JylcbmNvbnN0IGdyYW1tYXIgPSByZXF1aXJlKCcuL2dyYW1tYXInKVxuY29uc3QgaW50ZXJwID0gcmVxdWlyZSgnLi9pbnRlcnAnKVxuXG5leHBvcnQgZnVuY3Rpb24gcnVuKGNvZGUsIGRpcikge1xuICBsZXQgcGFyc2VyID0gbmV3IG5lYXJsZXkuUGFyc2VyKGdyYW1tYXIuUGFyc2VyUnVsZXMsIGdyYW1tYXIuUGFyc2VyU3RhcnQpXG4gIGxldCBhc3RzID0gcGFyc2VyLmZlZWQoY29kZSkucmVzdWx0c1xuXG4gIGlmIChhc3RzLmxlbmd0aCA+IDEpIHtcbiAgICBjb25zb2xlLndhcm4oJyEhIEFNQklHVU9VUyBTWU5UQVggISEnKVxuICAgIGxldCBlc2NhcGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDI3KVxuICAgIGFzdHMuZm9yRWFjaChmdW5jdGlvbihhc3QsIGkpIHtcbiAgICAgIGNvbnNvbGUud2FybihKU09OLnN0cmluZ2lmeShhc3QsIG51bGwsIDApKVxuICAgICAgY29uc29sZS53YXJuKCdcXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuJylcbiAgICB9KS1cbiAgICBjb25zb2xlLndhcm4oYFxuQSB0b3RhbCBvZiAke2FzdHMubGVuZ3RofSBBU1RzIHdlcmUgZ2VuZXJhdGVkLlxuUGxlYXNlIHJlcG9ydCB0aGlzIG9uIHRoZSBvZmZpY2lhbCBpc3N1ZSB0cmFja2VyOlxuaHR0cHM6Ly9naXRodWIuY29tL2xpYW00L3RsbmNjdXdhZ25mL2lzc3Vlc1xuVXNpbmcgZmlyc3QgQVNULlxuYClcbiAgfVxuXG4gIGxldCByZXN1bHQgPSBpbnRlcnAuaW50ZXJwKGFzdHNbMF0sIGRpcilcbiAgcmV0dXJuIHJlc3VsdFxufVxuIl19