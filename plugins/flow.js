//flow control & generics

//set var to env
function set(env, ctx, next) {
    if (this[0]) {
        for (var i in this[0]) {
            if (this[0].hasOwnProperty(i)) {
                if(typeof this[0][i] == "function") {
                    env[i] = eval("(" + this[0][i].toString() + ")(env, ctx)"); //env / ctx made available
                } else {
                    env[i] = this[0][i];
                }
            }
        }
    }
    next();
}

function genericFunction(env, ctx, next) {
    //boss
    var func = this[0] || function () { }
    return next(
        eval("(" + this[0].toString() + ")(env, ctx)") //env / ctx made available
    );
}

function genericEvent(env, ctx, next) {
    //boss++
    var func = (this[1] || function(env, ctx, cb) {
        cb();
    });
    var name = this[0] || "_dummy_";
    ctx.events.on(name, (_, cb) => {
        func(env, ctx, cb); //YES
    });
    return next(CONTINUE);
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
VERB("default", "terminate", end);
VERB("default", "error", error);
VERB("default", "event", event);
VERB("default", "passOn", passOn);
VERB("default", "set", set);
VERB("default", "func", genericFunction);