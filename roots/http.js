//http server root
var http = require('http');
var engine = require('../lib/engine');
var config = require('../lib/config');
var server = http.createServer(handler);

function handler(req, res) {
    
}

//entry config
//search for via
//via(expand_to_config)

ROOT("http");
ALIAS("http", "location");