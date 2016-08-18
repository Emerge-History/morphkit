var fs = require('fs');
var zlib = require('zlib');
var log4js = require('log4js');
var logger = log4js.getLogger("morphkit::plugins::http");
var jschardet = require("jschardet");
var charsetParser = require('charset-parser');
var iconv = require('iconv-lite');

iconv.extendNodeEncodings();

function _url_compare(arg, url) {
    if (!url) return false;
    if (arg instanceof RegExp) {
        if (arg.test(url)) {
            return true;
        } else {
            return false;
        }
    }
    if (typeof arg == "string") {
        if (ctx.req.url.indexOf(arg) >= 0) {
            return true;
        } else {
            return false;
        }
    }
    return false;
}

function url(env, ctx, next) {
    var arg = this[0];
    if (this.length > 0) {
        arg = [];
        for (var i = 0; i < this.length; i++) {
            arg.push(this[i]);
        }
    }
    if (!arg) {
        return next();
    }
    if (typeof arg == "string" || arg instanceof RegExp) {
        return _url_compare(arg, ctx.req.url) ? next() : next(REJECT);
    }
    if (Array.isArray(arg)) {
        for (var i = 0; i < arg.length; i++) {
            if (_url_compare(arg[i], ctx.req.url)) {
                return next();
            }
        }
        return next(REJECT);
    }
    return next(REJECT);
}

function _headerMatch(header, obj) {
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        var cur = obj[i];
        if (!Array.isArray(cur)) {
            cur = [cur];
        }
        var result = false;
        for (var j = 0; j < cur.length; j++) {
            var e = cur[j];
            if ((e == true && header[i])
                ||
                (e == false && !header[i])
                ||
                (typeof e == "string" && header[i] && header[i].indexOf(e) >= 0)
                ||
                (e instanceof RegExp && header[i] && e.test(header[i])
                ||
                (typeof e == "function" && header[i] && e(header[i])))
            ) {
                result = true;
                break;
            }
        }
        if (!result) return false;
    }
    return true;
}

function headerMatch_common(arg, headers) {
    if (!arg || arg.length == 0) return 1;
    if (arg.length == 1 && !Array.isArray(arg)) {
        arg = [arg];
    }
    for (var i = 0; i < arg.length; i++) {
        //or logic 
        if (_headerMatch(headers, arg[i])) return 1;
    }
    return 0;
}

function headerFilter(env, ctx, next) {
    //object
    /**
     * [ {
     *  header: /regex/
     *  header: [ or logic ]
     *  header: string_matcher
     *  header: boolean (has logic)
     * } or {
     *  ...
     * } ]
     */
    return next(headerMatch_common(this, ctx.req.headers) ?
        CONTINUE : REJECT);
}

function res_header(env, ctx, next) {
    if (!this[0] || this.length == 0) return next();
    ctx.events.first('upstream', (_, cb) => {
        //must be the first :)
        if (headerMatch_common(this, ctx.upstream.res)) {
            return cb();
        } else {
            return cb(new Error("Header check failed"));
        }
    });
    return next();
}

//inline generator
function header_match_generator(key, res) {
    return function () {
        var arg = this[0];
        if (!Array.isArray(arg)) {
            arg = [arg];
        }
        var generatedCode = "";

        for (var i = 0; i < arg.length; i++) {
            if (arg[i] == true) {
                generatedCode += "true";
            } else if (arg[i] == false) {
                generatedCode += "false";
            } else if (typeof arg[i] == "string") {
                generatedCode += "\"" + JSON.stringify(arg[i]) + "\"";
            } else if (arg[i] instanceof RegExp) {
                generatedCode += arg[i].toString();
            } else if (typeof arg[i] == "function") {
                generatedCode += arg[i].toString();
            } else if (arg[i] instanceof Object) {
                generatedCode += JSON.stringify(arg[i]);
            } else {
                continue;
            }
            if (i < arg.length - 1) {
                generatedCode += ",";
            }
        }

        generatedCode = "[ " + generatedCode + " ]";
        return `
            ${ res ? 'resheader' : 'header'}({
                "${key}" : ${ generatedCode }
            })
        `
    };
}

function loadContent(env, ctx, next) {
    if (env._http_loadContent_guard_ || !ctx.HTTP || ctx.ended) {
        return next();
    }
    env._http_loadContent_guard_ = 1;
    var headers, buffer, charset;
    ctx.events.on('upstream', (_, cb) => {
        headers = ctx.upstream.res.headers;

        if (!(/(html|json|javascript)/.test(headers["content-type"]))) {
            return cb();
        }
        if (headers["content-disposition"] == "attachment") {
            return cb();
        }

        if (ctx.ended || ctx.upstream.res_write_buffer) return cb();
        //get stuff :p
        buffer = new Buffer(0);
        var stream = ctx.upstream.res;
        if (headers['content-encoding'] == 'gzip') {
            stream = zlib.createGunzip();
        } else if (headers['content-encoding' == 'deflate']) {
            stream = zlib.createDeflate();
        }
        stream.on("data", function (e) {
            buffer = Buffer.concat([buffer, e]);
        });
        stream.on("end", function () {
            //detect charset
            charset = headers['content-type'] ? charsetParser(headers['content-type'], '', 'NOTFOUND') : 'NOTFOUND';
            if (charset == 'NOTFOUND') {
                var det = jschardet.detect(buffer);
                if (det.confidence > 0.9) {
                    charset = det.encoding.toLowerCase();
                } else {
                    charset = 'utf-8';
                }
            }
            charset = charset.toLowerCase();
            if (charset !== "utf-8") {
                buffer = iconv.decode(buffer, charset);
            } else {
                buffer = buffer.toString('utf8');
            }
            ctx.upstream.res_write_buffer = buffer;
            return cb();
        });
        if (stream != ctx.upstream.res) {
            stream.on('error', function (e) {
                logger.error(e);
                ctx.res.end();
                cb();
            });
            ctx.upstream.res.pipe(stream);
        }
    });
    ctx.events.on('downstream', (_, cb) => {
        //pack up
        buffer = ctx.upstream.res_write_buffer;
        // logger.warn("Preloaded - ", ctx.req.url);
        if (!buffer) return cb();
        if (ctx.ended) return cb();
        if (charset && charset !== "utf-8") {
            buffer = iconv.encode(buffer, charset);
        } else {
            buffer = new Buffer(buffer);
        }
        function send(err, data) {
            if (err) {
                logger.error(err);
                return cb();
            }
            // logger.trace("Setting Content-Length", data.length);
            if (headers["content-length"]) {
                headers["content-length"] = data.length;
            }
            ctx.upstream.res_write_buffer = data;
            return cb();
        }

        if (headers['content-encoding'] == 'gzip') {
            zlib.gzip(buffer, send);
        } else if (headers['content-encoding'] == 'deflate') {
            zlib.inflate(buffer, send);
        } else {
            process.nextTick(function () {
                send(null, buffer);
            });
        }
    });
    return next();
}

function rewrite(env, ctx, next) {
    if (this.length == 0) {
        return next();
    }
    var status = 302;
    var target;
    if (this.length == 1) {
        //must be string
        target = this[0];
    } else {
        target = this[1];
        status = this[0];
    }
    ctx.res.setHeader("location", target);
    ctx.res.writeHeader(status);
    ctx.res.end();
    ctx.ended = true;
    return next();
}

VERB("http", "url", url);
VERB("http", "rewrite", rewrite);
VERB("http", "loadContent", loadContent);
VERB("http", "header", headerFilter);
VERB("http", "resheader", res_header);
INLINE("http", "contenttype", header_match_generator("content-type", true));
INLINE("http", "contentlength", header_match_generator("content-type", true));