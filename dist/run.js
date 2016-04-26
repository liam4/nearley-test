'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;
var nearley = require('nearley');
var grammar = require('./grammar');
var interp = require('./interp');
var chalk = require('chalk');

function run(code, dir) {
  var parser = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);
  var asts = void 0;

  try {
    asts = parser.feed(code).results;
  } catch (e) {
    // there's been a syntax error :(

    var line = 1;
    var lines = code.split('\n');
    lines.unshift('');
    for (var i = 0; i < e.offset; i++) {
      var char = code[i];
      if (char == '\n') line++;
    }

    var ln = lines[line];

    if (line - 1 > 0) console.log(chalk.bold(line - 1), lines[line - 1]);
    if (line) console.log(chalk.bold(line), chalk.red(ln));
    if (line + 1 < lines.length) console.log(chalk.bold(line + 1), lines[line + 1]);
    console.error(chalk.red('\nSyntax Error at ' + chalk.cyan('line ' + line) + '!'));

    process.exit(1);
  }

  if (asts.length > 1) {
    console.warn(chalk.red.bold('!! AMBIGUOUS SYNTAX !!'));
    var _escape = String.fromCharCode(27);
    asts.forEach(function (ast, i) {
      console.warn(JSON.stringify(ast, null, 0));
      console.warn('\n----------------------------\n');
    }) - console.warn(chalk.yellow('\nA total of ' + chalk.cyan(asts.length) + ' ASTs were generated.\nPlease report this on the official issue tracker:\nhttps://github.com/liam4/tlnccuwagnf/issues\nUsing first AST.\n'));
  }

  var result = interp.interp(asts[0], dir);
  return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQUtnQixHLEdBQUEsRztBQUxoQixJQUFNLFVBQVUsUUFBUSxTQUFSLENBQWhCO0FBQ0EsSUFBTSxVQUFVLFFBQVEsV0FBUixDQUFoQjtBQUNBLElBQU0sU0FBUyxRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQU0sUUFBUSxRQUFRLE9BQVIsQ0FBZDs7QUFFTyxTQUFTLEdBQVQsQ0FBYSxJQUFiLEVBQW1CLEdBQW5CLEVBQXdCO0FBQzdCLE1BQUksU0FBUyxJQUFJLFFBQVEsTUFBWixDQUFtQixRQUFRLFdBQTNCLEVBQXdDLFFBQVEsV0FBaEQsQ0FBYjtBQUNBLE1BQUksYUFBSjs7QUFFQSxNQUFJO0FBQ0YsV0FBTyxPQUFPLElBQVAsQ0FBWSxJQUFaLEVBQWtCLE9BQXpCO0FBQ0QsR0FGRCxDQUVFLE9BQU8sQ0FBUCxFQUFVOzs7QUFHVixRQUFJLE9BQU8sQ0FBWDtBQUNBLFFBQUksUUFBUSxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQVo7QUFDQSxVQUFNLE9BQU4sQ0FBYyxFQUFkO0FBQ0EsU0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEVBQUUsTUFBdEIsRUFBOEIsR0FBOUIsRUFBbUM7QUFDakMsVUFBSSxPQUFPLEtBQUssQ0FBTCxDQUFYO0FBQ0EsVUFBSSxRQUFRLElBQVosRUFBa0I7QUFDbkI7O0FBRUQsUUFBSSxLQUFLLE1BQU0sSUFBTixDQUFUOztBQUVBLFFBQUksT0FBTyxDQUFQLEdBQVcsQ0FBZixFQUFrQixRQUFRLEdBQVIsQ0FBWSxNQUFNLElBQU4sQ0FBVyxPQUFPLENBQWxCLENBQVosRUFBa0MsTUFBTSxPQUFPLENBQWIsQ0FBbEM7QUFDbEIsUUFBSSxJQUFKLEVBQVUsUUFBUSxHQUFSLENBQVksTUFBTSxJQUFOLENBQVcsSUFBWCxDQUFaLEVBQThCLE1BQU0sR0FBTixDQUFVLEVBQVYsQ0FBOUI7QUFDVixRQUFJLE9BQU8sQ0FBUCxHQUFXLE1BQU0sTUFBckIsRUFBNkIsUUFBUSxHQUFSLENBQVksTUFBTSxJQUFOLENBQVcsT0FBTyxDQUFsQixDQUFaLEVBQWtDLE1BQU0sT0FBTyxDQUFiLENBQWxDO0FBQzdCLFlBQVEsS0FBUixDQUFjLE1BQU0sR0FBTix3QkFBK0IsTUFBTSxJQUFOLFdBQW1CLElBQW5CLENBQS9CLE9BQWQ7O0FBRUEsWUFBUSxJQUFSLENBQWEsQ0FBYjtBQUNEOztBQUVELE1BQUksS0FBSyxNQUFMLEdBQWMsQ0FBbEIsRUFBcUI7QUFDbkIsWUFBUSxJQUFSLENBQWEsTUFBTSxHQUFOLENBQVUsSUFBVixDQUFlLHdCQUFmLENBQWI7QUFDQSxRQUFJLFVBQVMsT0FBTyxZQUFQLENBQW9CLEVBQXBCLENBQWI7QUFDQSxTQUFLLE9BQUwsQ0FBYSxVQUFTLEdBQVQsRUFBYyxDQUFkLEVBQWlCO0FBQzVCLGNBQVEsSUFBUixDQUFhLEtBQUssU0FBTCxDQUFlLEdBQWYsRUFBb0IsSUFBcEIsRUFBMEIsQ0FBMUIsQ0FBYjtBQUNBLGNBQVEsSUFBUixDQUFhLGtDQUFiO0FBQ0QsS0FIRCxJQUlBLFFBQVEsSUFBUixDQUFhLE1BQU0sTUFBTixtQkFDSixNQUFNLElBQU4sQ0FBVyxLQUFLLE1BQWhCLENBREksK0lBQWIsQ0FKQTtBQVVEOztBQUVELE1BQUksU0FBUyxPQUFPLE1BQVAsQ0FBYyxLQUFLLENBQUwsQ0FBZCxFQUF1QixHQUF2QixDQUFiO0FBQ0EsU0FBTyxNQUFQO0FBQ0QiLCJmaWxlIjoicnVuLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgbmVhcmxleSA9IHJlcXVpcmUoJ25lYXJsZXknKVxuY29uc3QgZ3JhbW1hciA9IHJlcXVpcmUoJy4vZ3JhbW1hcicpXG5jb25zdCBpbnRlcnAgPSByZXF1aXJlKCcuL2ludGVycCcpXG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcblxuZXhwb3J0IGZ1bmN0aW9uIHJ1bihjb2RlLCBkaXIpIHtcbiAgbGV0IHBhcnNlciA9IG5ldyBuZWFybGV5LlBhcnNlcihncmFtbWFyLlBhcnNlclJ1bGVzLCBncmFtbWFyLlBhcnNlclN0YXJ0KVxuICBsZXQgYXN0c1xuXG4gIHRyeSB7XG4gICAgYXN0cyA9IHBhcnNlci5mZWVkKGNvZGUpLnJlc3VsdHNcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIHRoZXJlJ3MgYmVlbiBhIHN5bnRheCBlcnJvciA6KFxuXG4gICAgbGV0IGxpbmUgPSAxXG4gICAgbGV0IGxpbmVzID0gY29kZS5zcGxpdCgnXFxuJylcbiAgICBsaW5lcy51bnNoaWZ0KCcnKVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZS5vZmZzZXQ7IGkrKykge1xuICAgICAgbGV0IGNoYXIgPSBjb2RlW2ldXG4gICAgICBpZiAoY2hhciA9PSAnXFxuJykgbGluZSsrXG4gICAgfVxuXG4gICAgbGV0IGxuID0gbGluZXNbbGluZV1cblxuICAgIGlmIChsaW5lIC0gMSA+IDApIGNvbnNvbGUubG9nKGNoYWxrLmJvbGQobGluZSAtIDEpLCBsaW5lc1tsaW5lIC0gMV0pXG4gICAgaWYgKGxpbmUpIGNvbnNvbGUubG9nKGNoYWxrLmJvbGQobGluZSksIGNoYWxrLnJlZChsbikpXG4gICAgaWYgKGxpbmUgKyAxIDwgbGluZXMubGVuZ3RoKSBjb25zb2xlLmxvZyhjaGFsay5ib2xkKGxpbmUgKyAxKSwgbGluZXNbbGluZSArIDFdKVxuICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKGBcXG5TeW50YXggRXJyb3IgYXQgJHtjaGFsay5jeWFuKGBsaW5lICR7bGluZX1gKX0hYCkpXG5cbiAgICBwcm9jZXNzLmV4aXQoMSlcbiAgfVxuXG4gIGlmIChhc3RzLmxlbmd0aCA+IDEpIHtcbiAgICBjb25zb2xlLndhcm4oY2hhbGsucmVkLmJvbGQoJyEhIEFNQklHVU9VUyBTWU5UQVggISEnKSlcbiAgICBsZXQgZXNjYXBlID0gU3RyaW5nLmZyb21DaGFyQ29kZSgyNylcbiAgICBhc3RzLmZvckVhY2goZnVuY3Rpb24oYXN0LCBpKSB7XG4gICAgICBjb25zb2xlLndhcm4oSlNPTi5zdHJpbmdpZnkoYXN0LCBudWxsLCAwKSlcbiAgICAgIGNvbnNvbGUud2FybignXFxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxcbicpXG4gICAgfSktXG4gICAgY29uc29sZS53YXJuKGNoYWxrLnllbGxvdyhgXG5BIHRvdGFsIG9mICR7Y2hhbGsuY3lhbihhc3RzLmxlbmd0aCl9IEFTVHMgd2VyZSBnZW5lcmF0ZWQuXG5QbGVhc2UgcmVwb3J0IHRoaXMgb24gdGhlIG9mZmljaWFsIGlzc3VlIHRyYWNrZXI6XG5odHRwczovL2dpdGh1Yi5jb20vbGlhbTQvdGxuY2N1d2FnbmYvaXNzdWVzXG5Vc2luZyBmaXJzdCBBU1QuXG5gKSlcbiAgfVxuXG4gIGxldCByZXN1bHQgPSBpbnRlcnAuaW50ZXJwKGFzdHNbMF0sIGRpcilcbiAgcmV0dXJuIHJlc3VsdFxufVxuIl19