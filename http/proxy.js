const http = require('http');

function clientHandler(req, res) {
    
}

var server = http.createServer(clientHandler);
server.listen(config.port);
