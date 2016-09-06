/**
 * should contain JSON-logic
 * 
 */

function json(env, ctx, next) {
    var argv = this[0];
    if (!argv) {
        return next();
    }
    ctx.events.on('upstream', (_, cb) => {
        if (argv instanceof require('stream').Stream) {
            ctx.upstream.res_write_stream = argv;
        } else {
            ctx.upstream.res_write_buffer = argv;
        }
        return cb();
    });
    return next();
}
