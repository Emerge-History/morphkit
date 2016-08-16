var fs = require('fs');
var log4js = require('log4js');
var logger = log4js.getLogger("morphkit::plugins::http");

function url(env, context, next) {
    var arg = this[0];
    if(!arg) {
        return next();
    }
}

VERB("http", "url", url);