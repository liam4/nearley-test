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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQUlnQjtBQUpoQixJQUFNLFVBQVUsUUFBUSxTQUFSLENBQVY7QUFDTixJQUFNLFVBQVUsUUFBUSxXQUFSLENBQVY7QUFDTixJQUFNLFNBQVMsUUFBUSxVQUFSLENBQVQ7O0FBRUMsU0FBUyxHQUFULENBQWEsSUFBYixFQUFtQixHQUFuQixFQUF3QjtBQUM3QixNQUFJLFNBQVMsSUFBSSxRQUFRLE1BQVIsQ0FBZSxRQUFRLFdBQVIsRUFBcUIsUUFBUSxXQUFSLENBQWpELENBRHlCO0FBRTdCLE1BQUksT0FBTyxPQUFPLElBQVAsQ0FBWSxJQUFaLEVBQWtCLE9BQWxCLENBRmtCOztBQUk3QixNQUFJLEtBQUssTUFBTCxHQUFjLENBQWQsRUFBaUI7QUFDbkIsWUFBUSxJQUFSLENBQWEsd0JBQWIsRUFEbUI7QUFFbkIsUUFBSSxVQUFTLE9BQU8sWUFBUCxDQUFvQixFQUFwQixDQUFULENBRmU7QUFHbkIsU0FBSyxPQUFMLENBQWEsVUFBUyxHQUFULEVBQWMsQ0FBZCxFQUFpQjtBQUM1QixjQUFRLElBQVIsQ0FBYSxLQUFLLFNBQUwsQ0FBZSxHQUFmLEVBQW9CLElBQXBCLEVBQTBCLENBQTFCLENBQWIsRUFENEI7QUFFNUIsY0FBUSxJQUFSLENBQWEsa0NBQWIsRUFGNEI7S0FBakIsQ0FBYixHQUlBLFFBQVEsSUFBUixtQkFDUyxLQUFLLE1BQUwsOElBRFQsQ0FKQSxDQUhtQjtHQUFyQjs7QUFlQSxNQUFJLFNBQVMsT0FBTyxNQUFQLENBQWMsS0FBSyxDQUFMLENBQWQsRUFBdUIsR0FBdkIsQ0FBVCxDQW5CeUI7QUFvQjdCLFNBQU8sTUFBUCxDQXBCNkI7Q0FBeEIiLCJmaWxlIjoicnVuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgbmVhcmxleSA9IHJlcXVpcmUoJ25lYXJsZXknKVxuY29uc3QgZ3JhbW1hciA9IHJlcXVpcmUoJy4vZ3JhbW1hcicpXG5jb25zdCBpbnRlcnAgPSByZXF1aXJlKCcuL2ludGVycCcpXG5cbmV4cG9ydCBmdW5jdGlvbiBydW4oY29kZSwgZGlyKSB7XG4gIGxldCBwYXJzZXIgPSBuZXcgbmVhcmxleS5QYXJzZXIoZ3JhbW1hci5QYXJzZXJSdWxlcywgZ3JhbW1hci5QYXJzZXJTdGFydClcbiAgbGV0IGFzdHMgPSBwYXJzZXIuZmVlZChjb2RlKS5yZXN1bHRzXG5cbiAgaWYgKGFzdHMubGVuZ3RoID4gMSkge1xuICAgIGNvbnNvbGUud2FybignISEgQU1CSUdVT1VTIFNZTlRBWCAhIScpXG4gICAgbGV0IGVzY2FwZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoMjcpXG4gICAgYXN0cy5mb3JFYWNoKGZ1bmN0aW9uKGFzdCwgaSkge1xuICAgICAgY29uc29sZS53YXJuKEpTT04uc3RyaW5naWZ5KGFzdCwgbnVsbCwgMCkpXG4gICAgICBjb25zb2xlLndhcm4oJ1xcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cXG4nKVxuICAgIH0pLVxuICAgIGNvbnNvbGUud2FybihgXG5BIHRvdGFsIG9mICR7YXN0cy5sZW5ndGh9IEFTVHMgd2VyZSBnZW5lcmF0ZWQuXG5QbGVhc2UgcmVwb3J0IHRoaXMgb24gdGhlIG9mZmljaWFsIGlzc3VlIHRyYWNrZXI6XG5odHRwczovL2dpdGh1Yi5jb20vbGlhbTQvdGxuY2N1d2FnbmYvaXNzdWVzXG5Vc2luZyBmaXJzdCBBU1QuXG5gKVxuICB9XG5cbiAgbGV0IHJlc3VsdCA9IGludGVycC5pbnRlcnAoYXN0c1swXSwgZGlyKVxuICByZXR1cm4gcmVzdWx0XG59XG4iXX0=