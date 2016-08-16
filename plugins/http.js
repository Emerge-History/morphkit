var fs = require('fs');
var log4js = require('log4js');
var logger = log4js.getLogger("morphkit::plugins::http");

function url(env, ctx, next) {
    var arg = this[0];
    if(!arg) {
        return next();
    }

    if(arg instanceof RegExp) {
        if(arg.test(ctx.req.url)) {
            return next(CONTINUE);
        } else {
            return next(REJECT);
        }
    }

    if(typeof arg == "string") {
        if(ctx.req.url.indexOf(arg) >= 0) {
            return next(CONTINUE);
        } else {
            return next(REJECT);
        }
    }

    if(typeof arg == "object") {
        
    }
    
}

VERB("http", "url", url);