//http server root
var http = require('http');
var url = require("url");
var async = require('async');
var engine = require('../lib/engine');
var config = require('../lib/config');
var server = http.createServer(handler);
var logger = require('log4js').getLogger('morphkit::roots::http');

function transparent(req, res) {

}

function error_handler(e) {
    logger.error(e);
}

function handler(req, res) {

    req.on("error", error_handler);
    res.on("error", error_handler);
    // LMAIN.debug(isTracked(req.url) ? " ** " : "", req.url);
    // consooe.log(req);
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

    //fluid generator adapts to different phases of upstream req <-> res process
    function fluidGenerator() {
        //phase 0
        if (!ctx.upstream.req) {
            //generate req as we got nothing
            ctx.upstream.req = ctx.proto.request(options);
        }

        //phase 1
        if (!ctx.upstream.res) {
            //need to do req for res :)
            //do traffic hook
            ctx.upstream.req.on('response', function (proxyRes) {
                ctx.upstream.res = proxyRes; // got upstream server res
                events.emit("upstream", {}, () => {
                    //emit as we might want middlewares to operate upstream.res
                    ctx.upstream.res_header = ctx.upstream.res_header || ctx.upstream.res.headers;
                    ctx.upstream.res_status = ctx.upstream.res_status || ctx.upstream.res.statusCode;
                    writeHeader(ctx, ctx.upstream.res_header);
                    writeStatusCode(ctx, ctx.upstream.res_status);
                    if (ctx.upstream.res_write_buffer) {
                        res.end(ctx.upstream.res_write_buffer);
                    } else {
                        //flow through as-is
                        (ctx.upstream.res_write_stream || ctx.upstream.res).pipe(res); 
                    }
                });
            });
            //does the request
            ctx.req.pipe(ctx.upstream.req);
        }
    }

    var conf = config.getDefault();
    var events = engine.run(ctx, conf, configPhaseCompelte);

    function configPhaseCompelte() {
        //before hand complete (all passes)
    }
}

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