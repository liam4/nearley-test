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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQUlnQixHLEdBQUEsRztBQUpoQixJQUFNLFVBQVUsUUFBUSxTQUFSLENBQWhCO0FBQ0EsSUFBTSxVQUFVLFFBQVEsV0FBUixDQUFoQjtBQUNBLElBQU0sU0FBUyxRQUFRLFVBQVIsQ0FBZjs7QUFFTyxTQUFTLEdBQVQsQ0FBYSxJQUFiLEVBQW1CLE9BQW5CLEVBQTRCO0FBQ2pDLE1BQUksU0FBUyxJQUFJLFFBQVEsTUFBWixDQUFtQixRQUFRLFdBQTNCLEVBQXdDLFFBQVEsV0FBaEQsQ0FBYjtBQUNBLE1BQUksT0FBTyxPQUFPLElBQVAsQ0FBWSxJQUFaLEVBQWtCLE9BQTdCOztBQUVBLE1BQUcsS0FBSyxNQUFMLEdBQWMsQ0FBakIsRUFBb0I7QUFDbEIsWUFBUSxJQUFSLENBQWEsd0JBQWI7QUFDQSxRQUFJLFVBQVMsT0FBTyxZQUFQLENBQW9CLEVBQXBCLENBQWI7QUFDQSxTQUFLLE9BQUwsQ0FBYSxVQUFTLEdBQVQsRUFBYyxDQUFkLEVBQWlCO0FBQzVCLGNBQVEsSUFBUixDQUFhLEtBQUssU0FBTCxDQUFlLEdBQWYsRUFBb0IsSUFBcEIsRUFBMEIsQ0FBMUIsQ0FBYjtBQUNBLGNBQVEsSUFBUixDQUFhLGtDQUFiO0FBQ0QsS0FIRDtBQUlBLFlBQVEsSUFBUixtQkFDUyxLQUFLLE1BRGQ7QUFNRDs7QUFFRCxNQUFJLFNBQVMsT0FBTyxNQUFQLENBQWMsS0FBSyxDQUFMLENBQWQsRUFBdUIsT0FBdkIsQ0FBYjtBQUNBLFNBQU8sTUFBUDtBQUNEIiwiZmlsZSI6InJ1bi5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IG5lYXJsZXkgPSByZXF1aXJlKCduZWFybGV5JylcbmNvbnN0IGdyYW1tYXIgPSByZXF1aXJlKCcuL2dyYW1tYXInKVxuY29uc3QgaW50ZXJwID0gcmVxdWlyZSgnLi9pbnRlcnAnKVxuXG5leHBvcnQgZnVuY3Rpb24gcnVuKGNvZGUsIG9wdGlvbnMpIHtcbiAgbGV0IHBhcnNlciA9IG5ldyBuZWFybGV5LlBhcnNlcihncmFtbWFyLlBhcnNlclJ1bGVzLCBncmFtbWFyLlBhcnNlclN0YXJ0KVxuICBsZXQgYXN0cyA9IHBhcnNlci5mZWVkKGNvZGUpLnJlc3VsdHNcblxuICBpZihhc3RzLmxlbmd0aCA+IDEpIHtcbiAgICBjb25zb2xlLndhcm4oJyEhIEFNQklHVU9VUyBTWU5UQVggISEnKVxuICAgIGxldCBlc2NhcGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDI3KVxuICAgIGFzdHMuZm9yRWFjaChmdW5jdGlvbihhc3QsIGkpIHtcbiAgICAgIGNvbnNvbGUud2FybihKU09OLnN0cmluZ2lmeShhc3QsIG51bGwsIDApKVxuICAgICAgY29uc29sZS53YXJuKCdcXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXFxuJylcbiAgICB9KVxuICAgIGNvbnNvbGUud2FybihgXG5BIHRvdGFsIG9mICR7YXN0cy5sZW5ndGh9IEFTVHMgd2VyZSBnZW5lcmF0ZWQuXG5QbGVhc2UgcmVwb3J0IHRoaXMgb24gdGhlIG9mZmljaWFsIGlzc3VlIHRyYWNrZXI6XG5odHRwczovL2dpdGh1Yi5jb20vbGlhbTQvdGxuY2N1d2FnbmYvaXNzdWVzXG5Vc2luZyBmaXJzdCBBU1QuXG5gKVxuICB9XG5cbiAgbGV0IHJlc3VsdCA9IGludGVycC5pbnRlcnAoYXN0c1swXSwgb3B0aW9ucylcbiAgcmV0dXJuIHJlc3VsdFxufVxuIl19