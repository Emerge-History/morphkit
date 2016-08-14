//flow control series

function genericFunction(env, ctx, next) {
    //boss
    var func = this[0] || function() {}
    return next(
        func(ctx, env)
    );
}

function passOn(env, ctx, next) {
    //note: this is a very special verb
    //it overrides default logic of the engine
    //it passes on-to next block
    //where new stuff happen
    env._PASSON_ = (this[0] == undefined) ? true : this[0];
    next();
}

function end(env, ctx, next) {
    //ENDS current flow, which means
    //JUMPS out of all scope, gives control to root(), default behaviour
    next(COMPLETE);
}

function error(env, ctx, next) {
    //ENDS current flow, yielding an error
    var err = new Error(this[0] || "Error statement in current flow")
    next(ERROR, err);
}

function log(env, ctx, next) {
    //logs
    //TODO: add logging support
    next();
}

VERB("default", "end", end);
VERB("default", "error", error);
VERB("default", "passOn", passOn);
VERB("default", "func", genericFunction);