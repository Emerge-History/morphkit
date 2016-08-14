const log4js = require('log4js');
var logger = log4js.getLogger("morphkit::dummyAction");

function dummyA(env, context, next) {
    logger.trace("calling Dummy A");
    next(this[0] > 0 ? undefined : REJECT); //reject
}

function dummyB(env, context, next) {
    logger.trace("calling Dummy B");
    next();

}


VERB("test", "dummyA", dummyA);
VERB("test", "dummyB", dummyB);