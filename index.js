var fs = require('fs'),
static = require('node-static'),
fileServer = new static.Server('./');

let options = {
  key: fs.readFileSync('./app/cert/localhost.key'),
  cert: fs.readFileSync('./app/cert/localhost.cert'),
  ciphers: "ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384:!MEDIUM:!LOW",
  ecdhCurve: "secp384r1:secp521r1:sect409k1:sect409r1:sect571k1:sect571r1",
  honorCipherOrder: true,
  minVersion: "TLSv1.2"
};
require('https').createServer(options, function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(8080);
