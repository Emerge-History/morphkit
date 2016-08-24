/**
 * META ROOT
 */

var config = require("../lib/config");

function entry(env, ctx, next) {
    return next(NEXT);
}

function configFolder(env, ctx, next) {
    if(!this[0]) return next();
    var argv = this.length > 1 ? this : [this];
    for(var i = 0; i < argv.length; i++) {
        config.init(argv[i], true);
    }
    return next(NEXT);
}

ROOT("config", entry);
VERB("config", "folder", configFolder);