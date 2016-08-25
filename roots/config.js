/**
 * META ROOT
 */

var config = require("../lib/config");

function entry(env, ctx, next) {
    return next(REJECT); //everything should be done RIGHT at compile time :)
}

function folder() {
    if(!this[0]) return next();
    var argv = this.length > 1 ? this : [this];
    for(var i = 0; i < argv.length; i++) {
        config.init(argv[i], true);
    }
    return next(REJECT);
}

//default plugins
require("../plugins/helperFuncs");
require("../plugins/flow");
require("../plugins/subconfig");
function plugin() {
    if(!this[0]) return next();
    var argv = this.length > 1 ? this : [this];
    for(var i = 0; i < argv.length; i++) {
        require('../plugins/' + argv[i]);
    }
    return next(REJECT);
}


function root() {
    if(!this[0]) return next();
    var argv = this.length > 1 ? this : [this];
    for(var i = 0; i < argv.length; i++) {
        require('../roots/' + argv[i]);
    }
    return next(REJECT);
}

ROOT("config", entry);
ROOT("folder", folder);
ROOT("plugin", plugin);
ROOT("root", root);