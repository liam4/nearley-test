var lib = require('../lib');
var http = require('http');

export class LHTTPServer extends lib.LObject {
  constructor(handle) {
    super();
    this['__constructor__'] = LHTTPServer;

    this.server = http.createServer(function(req, res) {
      var result = lib.call(handle, []);
      console.log(result);
    });
  }
}

var LHTTPServerPrototype = {
  listen: new lib.LFunction(function(self, [port]) {
    port = lib.toJNumber(port);
    self.server.listen(port);
  })
};

LHTTPServer['__prototype__'] = LHTTPServerPrototype;
LHTTPServer['__super__'] = lib.LObject;

export class LHTTPRequest extends lib.LObject {
  constructor(handle) {
    super();
    this['__constructor__'] = LHTTPRequest;
  }
}

export var server = new lib.LFunction(function([handle]) {
  return new LHTTPServer(handle);
});
