//http server root
var http = require('http');
var url = require("url");
var async = require('async');
var engine = require('../lib/engine');
var config = require('../lib/config');
var logger = require('log4js').getLogger('morphkit::roots::http');

function writeHeader(res, headers) {
    Object.keys(headers).forEach(function (key) {
        var header = headers[key];
        if (header != undefined) {
            try {
                res.setHeader(String(key).trim(), header); //something might fail here
            } catch (e) {
                //TODO: add log
                error_handler(e);
            }
        }
    });
}

function writeStatusCode(res, code) {
    // console.log("Writing", code);
    res.writeHeader(code);
}

function error_handler(e) {
    logger.error(e);
}

function loopDetection(req, res) {
    //target -> src are the same
    if (req.headers["loopdetection"]) {
        logger.fatal("Loop Detected @", req.url);
        return true;
    }
    req.headers["loopdetection"] = 1;
}

var liveConnections = {};

function handler(req, res) {
    var contrack = Date.now();
    function proxy_error(e) {
        if (req.socket.destroyed
            &&
            e.code === 'ECONNRESET'
            &&
            ctx.upstream.req) {
            ctx.upstream.req.abort();
        }
        try {
            delete liveConnections[contrack];
            res.end();
        } catch (e) {
        }
        error_handler(e);
    }

    req.on("error", proxy_error);
    res.on("error", proxy_error);
    req.on('aborted', function () {
        if (!ctx.ended && ctx.upstream.req) {
            ctx.upstream.req.abort();
            delete liveConnections[contrack];
            logger.fatal("ABORT", req.url);
        }
    });


    res.on('finish', function () {
        delete liveConnections[contrack];
    });

    res.on('close', function () {
        delete liveConnections[contrack];
    });

    //fixing DNAT / Redsocks
    var u = url.parse(req.url);
    if (u.host == null) {
        req.url = "http://" + req.headers.host + req.url;
        u = url.parse(req.url);
        req.url_parsed = u;
    }


    if (loopDetection(req, res)) {
        res.writeHeader(200);
        res.end("!Possible proxy-loop detected, please contact server admin!"); //sorry :(
        delete liveConnections[contrack];
        return;
    }

    liveConnections[contrack] = req.url.toString(); //isolates var

    var options, ctx;

    options = {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.path,
        method: req.method,
        headers: req.headers
    };

    // logger.trace(otions);

    ctx = {
        HTTP: 1,
        req: req, //-> client req
        res: res, //<- cilent res
        upstream: {
            proto: http,
            options: options,
            req: undefined, //-> upstream req
            res: undefined, //<- upstream res
            res_write_stream: undefined, //<- provided by plugin
            res_write_buffer: undefined, //<- provided by plugin
            res_header: undefined,
            res_status: undefined
        },
        ended: false
    };

    function _write_downstream() {
        events.emit("upstream", {}, (err) => {
            //emit as we might want middlewares to operate upstream.res
            ctx.upstream.res_header = ctx.upstream.res_header || ctx.upstream.res.headers;
            ctx.upstream.res_status = ctx.upstream.res_status || ctx.upstream.res.statusCode;
            logger[(
                ctx.upstream.res_status <= 300 ?
                    'info' : (
                        ctx.upstream.res_status <= 400 ?
                            'warn' : 'error'
                    )
            )](ctx.req.method, ctx.upstream.res_status, ctx.req.url);

            if (ctx.upstream.res_status >= 400) {
                logger.error(options);
            }
            events.emit(err ? "downstream_fallback" : "downstream", {}, () => {
                writeHeader(ctx.res, ctx.upstream.res_header);
                writeStatusCode(ctx.res, ctx.upstream.res_status);

                // logger.info("Head", ctx.upstream.res_header);
                if (ctx.upstream.res_write_buffer) {
                    logger.warn("Buffer-Resp", ctx.req.url);
                    ctx.res.end(ctx.upstream.res_write_buffer);
                } else {
                    //flow through as-is
                    logger.info("Stream-Resp", ctx.req.url);
                    (ctx.upstream.res_write_stream || ctx.upstream.res).pipe(ctx.res);

                }
                ctx.ended = true; //EOF
                events.removeAllListeners(); //cleanup
            });
        });
    }

    //processor adapts to different phases of upstream req <-> res process
    //and finishes them
    function processor() {
        //phase 0
        if (ctx.ended) {
            return;
        }
        if (!ctx.upstream.req) {
            //generate req as we got nothing
            ctx.upstream.req = ctx.upstream.proto.request(options);
            ctx.upstream.req.on('error', proxy_error);
        }

        //phase 1
        if (!ctx.upstream.res) {
            //need to do req for res :)
            //do traffic hook
            ctx.upstream.req.on('response', function (proxyRes) {
                ctx.upstream.res = proxyRes; // got upstream server res
                ctx.upstream.res.on('error', proxy_error);
                return _write_downstream();
            });
            //server res is not populated,
            //means we need to do actual request
            // logger.trace("REQUEST", options)
            ctx.req.pipe(ctx.upstream.req);
            //and we're done here, as everything's done by us
            return;
        }
        //res is present, means someone else already sent the request,
        //but do we need to write-down to the client? we don't know
        if (!ctx.ended) {
            //work's done by us
            return _write_downstream();
        }
    }

    var conf = config.getDefault();
    if (!conf) {
        logger.error("Default Config Missing - Engine failure");
    }
    var events = engine.run(ctx, conf, processor);
}

//called by flow engine
function entry(env, ctx, next) {
    if (!ctx.HTTP) {
        return next(REJECT);
    }
    if (this[0] && (!ctx.req.ruleSet || ctx.req.ruleSet != this[0])) {
        return next(REJECT);
    }
    //does prefix stuff
    return next(NEXT);
}

//entry config
//search for via
//via(expand_to_config)


ROOT("http", entry);
ALIAS("http", "location");

setInterval(function () {
    if (Object.keys(liveConnections).length) {
        logger.warn("Long-Running Connections:");
        logger.warn(liveConnections);
    }
}, 5000);


//defacto load scheme
var servers = [];
var def = {
    port: 8899,
    enabled: true,
    name: undefined
};

function _close_server(server, cb) {
    logger.warn("Server Closing!");
    server.once("close", cb);
    server.close();
}

function reload() {
    var config = this.length > 1 ? this : this[0];

    var tbc = [];
    while (servers.length) {
        tbc.push(_close_server.bind(null, servers.pop()));
    }

    var done = function () {
        if (!config || (Array.isArray(config) && config.length == 0)) {
            return;
        }
        if (!Array.isArray(config)) {
            config = [config];
        }
        for (var i = 0; i < config.length; i++) {
            ((i) => {
                var conf = config[i];
                if (!conf || (conf.enabled == false || conf.enabled <= 0)) return;
                var name = conf.name || def.name;
                var server = http.createServer((req, res) => {
                    try {
                        if (name) {
                            req["ruleSet"] = name;
                        }
                        handler(req, res);
                    } catch (e) {
                        //fatal, error
                        try { req.end(); } catch (e) { }
                        try { res.end(); } catch (e) { }
                        error_handler(e);
                    }
                });
                server.on('error', function(e) {
                    logger.error("Srv-Error");
                    logger.error(e);
                });
                server.listen(conf.port || def.port);
                logger.info("HTTP-Proxy Started at", conf.port || def.port);
                servers.push(server);
            })(i);
        }
    }

    if (tbc.length > 0) {
        async.parallel(tbc, done);
    } else {
        done();
    }


    return "";
}

//compile time inline
INLINE("config", "http", reload);