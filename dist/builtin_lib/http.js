const lib = require('../lib')
const http = require('http')
const https = require('https')
const url = require('url')

export class LHTTPServerResponse extends lib.LObject {
  constructor(res) {
    super()
    this['__constructor__'] = LHTTPServerResponse
    this.res = res
  }
}

let LHTTPServerResponsePrototype = {
  write: new lib.LFunction(function(self, [what]) {
    self.res.write(lib.toJString(what))
  }),
  end: new lib.LFunction(function(self) {
    self.res.end()
  })
}

LHTTPServerResponse['__prototype__'] = LHTTPServerResponsePrototype
LHTTPServerResponse['__super__'] = lib.LObject

export class LHTTPServerRequest extends lib.LObject {
  constructor(req) {
    super()
    this['__constructor__'] = LHTTPServerRequest
    this.req = req
  }
}

let LHTTPServerRequestPrototype = {
  url: new lib.LFunction(function(self) {
    return lib.toLString(self.req.url)
  }),
  method: new lib.LFunction(function(self) {
    return lib.toLString(self.req.method)
  })
}

LHTTPServerRequest['__prototype__'] = LHTTPServerRequestPrototype
LHTTPServerRequest['__super__'] = lib.LObject

export class LHTTPServer extends lib.LObject {
  constructor(handle) {
    super()
    this['__constructor__'] = LHTTPServer

    this.server = http.createServer(function(req, res) {
      lib.call(handle, [
        new LHTTPServerRequest(req), new LHTTPServerResponse(res)])
    })
  }
}

let LHTTPServerPrototype = {
  listen: new lib.LFunction(function(self, [port]) {
    port = lib.toJNumber(port)
    self.server.listen(port)
  })
}

LHTTPServer['__prototype__'] = LHTTPServerPrototype
LHTTPServer['__super__'] = lib.LObject

export class LHTTPRequest extends lib.LObject {
  constructor(method, url, callback) {
    super()
    this['__constructor__'] = LHTTPRequest
    this.method = method
    this.url = url
    this.cb = callback
  }
}


let LHTTPRequestPrototype = {
  send: new lib.LFunction(function(self) {
    let handle = function(response) {
      let body = ''
      response.setEncoding('utf8')
      response.on('data', function(d) {
        body += d.toString()
      })
      response.on('end', function() {
        lib.call(self.cb, [lib.toLString(body)])
      })
    }

    let u = url.parse(lib.toJString(self.url))
    let isGet = lib.toJString(self.method).toLowerCase() === 'get'
    if (u.protocol === 'http:') {
      if (isGet) {
        http.get(lib.toJString(self.url), handle)
      } else {
        console.log('Invalid method:', lib.toJString(self.method))
      }
    } else if (u.protocol === 'https:') {
      if (isGet) {
        https.get(lib.toJString(self.url), handle)
      } else {
        console.log('Invalid method:', lib.toJString(self.method))
      }
    } else {
      console.log('Invalid protocol:', u.protocol)
    }
  })
}

LHTTPRequest['__prototype__'] = LHTTPRequestPrototype
LHTTPRequest['__super__'] = lib.LObject

export let server = new lib.LFunction(function([handle]) {
  return new LHTTPServer(handle)
})

export let request = new lib.LFunction(function([method, url, callback]) {
  return new LHTTPRequest(method, url, callback)
})
