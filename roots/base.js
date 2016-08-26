/**
 * META ROOT
 */

var config = require("../lib/config");


function _reload_env_vars() {
    return undefined;
}


function entry(env, ctx, next) {
    return next(REJECT); //everything should be done RIGHT at compile time :)
}

function folder() {
    if(!this[0]) return;
    var argv = this.length > 1 ? this : [this];
    for(var i = 0; i < argv.length; i++) {
        config.init(argv[i], true);
    }
}

//default plugins
require("../plugins/helperFuncs");
require("../plugins/flow");
require("../plugins/subconfig");
function plugin() {
    if(!this[0]) return;
    var argv = this.length > 1 ? this : [this];
    for(var i = 0; i < argv.length; i++) {
        require('../plugins/' + argv[i]);
    }
    return _reload_env_vars();
}


function root() {
    if(!this[0]) return;
    var argv = this.length > 1 ? this : [this];
    for(var i = 0; i < argv.length; i++) {
        require('../roots/' + argv[i]);
    }
    return _reload_env_vars();
}

ROOT("config", entry);
MACRO("folder", folder);
MACRO("plugin", plugin);
MACRO("root", root);

