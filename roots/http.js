//http server root
var http = require('http');
var url = require("url");
var engine = require('../lib/engine');
var config = require('../lib/config');
var server = http.createServer(handler);
var logger = require('log4js').getLogger('morphkit::roots::http');

function transparent(req, res) {

}

function handler(req, res) {

    res.on("error", function (e) {
        LMAIN.error(e);
    });
    LMAIN.debug(isTracked(req.url) ? " ** " : "", req.url);
    // consooe.log(req);
    var u = url.parse(req.url);
    if (u.host == null) {
        req.url = "http://" + req.headers.host + req.url;
        u = url.parse(req.url);
    }
    var options, reqmaker;

    reqmaker = http;
    options = {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.path,
        method: req.method,
        headers: req.headers
    };

    var configComplete = function(state) {
        
    };

    var conf = config.getDefault();
    var events = engine.run({
        HTTP: 1,
        req: req,
        res: res,
        reqmaker: reqmaker,
        options: options,
        ended: false
    }, conf, configComplete);
}

function chain(env, ctx, next) {
    if (!ctx.HTTP) {
        return next(REJECT);
    }
    return next(NEXT);
}

//entry config
//search for via
//via(expand_to_config)

ROOT("http", chain);
ALIAS("http", "location");