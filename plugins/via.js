var fs = require('fs');
var log4js = require('log4js');
var config = require("../lib/config");
var engine = require("../lib/engine");
var logger = log4js.getLogger("morphkit::plugins::via");

//calls up sub config sections

function expandVia(env, context, next) {
    /**
     * 
     *  http.via({
     *      key: "via",
     *      default: "your_config"
     *  })
     * 
     *  http.via()
     * 
     *  http.via({})
     * 
     */
    var _defaultConfig = (this[0] && this[0].default) ? this[0].default.toLowerCase() : undefined;
    var _headerkey = (this[0] && this[0].key) ? this[0].key.toLowerCase() : "via";
    var via = context.req.headers[_headerkey];
    if(!via) {
        return next(REJECT); //failed
    }
    else {
        via = via.toLowerCase();
        var conf = config.get(via) || config.get(_defaultConfig);
        console.log(conf);
        if(conf) {
            engine.run(context, conf, next);
        } else {
            //not found
            return next(REJECT);
        }
    }
}

VERB("http", "expandVia", expandVia);