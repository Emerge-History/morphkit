var log4js = require('log4js');
var logger = log4js.getLogger("morphkit::plugins::modify");

function modify(env, ctx, next) {
    //you must do loadContent before this
    if (!ctx.HTTP) return next();
    if (this.length < 1) return next();

    var str1, str2, fjob;
    if (this.length == 2) {
        //string replacement
        str1 = this[0];
        str2 = this[1];
    } else if (typeof this[0] == "function") {
        fjob = this[0]; 
    } else {
        return next();
    }

    if (!env._http_loadContent_guard_) {
        logger.error("Call loadContent() before modify()");
        return next();
    }
    ctx.events.on("upstream", (_, cb) => {
        if (!ctx.upstream.res_write_buffer) {
            return cb(); //nothing happened here
        }
        else {
            if (typeof ctx.upstream.res_write_buffer != "string") {
                ctx.upstream.res_write_buffer = 
                ctx.upstream.res_write_buffer.toString('utf8');
            }
            if(str1) {
                ctx.upstream.res_write_buffer =
                ctx.upstream.res_write_buffer.replace(str1, str2);
                logger.trace(str1, ">", str2);
            } else if (fjob) {
                ctx.upstream.res_write_buffer =
                fjob(ctx.upstream.res_write_buffer);
                logger.trace("f(content) done");
            }
        }
        return cb();
    });
    return next();
}

VERB('http', 'modify', modify);