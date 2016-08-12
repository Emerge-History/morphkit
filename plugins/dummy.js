const log4js = require('log4js');
var logger = log4js.getLogger("morphkit::dummyAction");

function dummyAction(env, context, next) {
    logger.debug("calling dummy step");
    next();
}

VERB("test", "dummy", dummyAction);