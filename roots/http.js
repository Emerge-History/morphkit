//http server root
var http = require('http');
var url = require("url");
var async = require('async');
var engine = require('../lib/engine');
var config = require('../lib/config');
var server = http.createServer(handler);
var logger = require('log4js').getLogger('morphkit::roots::http');

function writeHeaders(res, headers) {
    Object.keys(headers).forEach(function (key) {
        var header = proxyRes.headers[key];
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
    res.writeHeader(code);
}

function error_handler(e) {
    logger.error(e);
}

function handler(req, res) {

    function proxy_error(e) {
        if (req.socket.destroyed
            && 
            err.code === 'ECONNRESET'
            && 
            ctx.upstream.req) {
            ctx.upstream.req.abort();
        }
        error_handler(e);
    }

    req.on("error", proxy_error);
    res.on("error", proxy_error);
    req.on('aborted', function () {
        if(!ctx.ended && ctx.upstream.req) {
            ctx.upstream.req.abort();
        }
    });
    
    //fixing DNAT / Redsocks
    var u = url.parse(req.url);
    if (u.host == null) {
        req.url = "http://" + req.headers.host + req.url;
        u = url.parse(req.url);
    }

    var options, ctx;

    options = {
        hostname: u.hostname,
        port: u.port || 80,
        path: u.path,
        method: req.method,
        headers: req.headers
    };

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
            res_status: undefined,
            run: fluidGenerator,
        },
        ended: false
    };

    function _write_downstream() {
        events.emit("upstream", {}, () => {
            //emit as we might want middlewares to operate upstream.res
            ctx.upstream.res_header = ctx.upstream.res_header || ctx.upstream.res.headers;
            ctx.upstream.res_status = ctx.upstream.res_status || ctx.upstream.res.statusCode;
            writeHeader(ctx.res, ctx.upstream.res_header);
            writeStatusCode(ctx.res, ctx.upstream.res_status);
            if (ctx.upstream.res_write_buffer) {
                res.end(ctx.upstream.res_write_buffer);
            } else {
                //flow through as-is
                (ctx.upstream.res_write_stream || ctx.upstream.res).pipe(res);
            }
            ctx.ended = true; //EOF
        });
    }

    //processor adapts to different phases of upstream req <-> res process
    //and finishes them
    function processor() {
        //phase 0
        if (!ctx.upstream.req) {
            //generate req as we got nothing
            ctx.upstream.req = ctx.proto.request(options);
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
    var events = engine.run(ctx, conf, processor);
}

//called by flow engine
function entry(env, ctx, next) {
    if (!ctx.HTTP) {
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