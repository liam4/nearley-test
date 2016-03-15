var lib = require('../lib');
var http = require('http');

export class LHTTPResponse extends lib.LObject {
  constructor(res) {
    super();
    this['__constructor__'] = LHTTPResponse;
    this.res = res;
  }
}

var LHTTPResponsePrototype = {
  write: new lib.LFunction(function(self, [what]) {
    self.res.write(lib.toJString(what));
  }),
  end: new lib.LFunction(function(self) {
    self.res.end();
  })
};

LHTTPResponse['__prototype__'] = LHTTPResponsePrototype;
LHTTPResponse['__super__'] = lib.LObject;

export class LHTTPRequest extends lib.LObject {
  constructor(req) {
    super();
    this['__constructor__'] = LHTTPRequest;
    this.req = req;
  }
}

var LHTTPRequestPrototype = {
  url: new lib.LFunction(function(self) {
    return lib.toLString(self.req.url);
  })
};

LHTTPRequest['__prototype__'] = LHTTPRequestPrototype;
LHTTPRequest['__super__'] = lib.LObject;

export class LHTTPServer extends lib.LObject {
  constructor(handle) {
    super();
    this['__constructor__'] = LHTTPServer;

    this.server = http.createServer(function(req, res) {
      var result = lib.call(
        handle, [new LHTTPRequest(req), new LHTTPResponse(res)]);
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

export var server = new lib.LFunction(function([handle]) {
  return new LHTTPServer(handle);
});
