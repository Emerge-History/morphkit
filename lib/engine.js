/** given route[][]
 *  does match / action logic (pile of)
 */

require("./utils.js");

var log4js = require('log4js');
var logger = log4js.getLogger("morphkit::engine");

const QUIT = -1;
const COMPLETE = 1;
const ERROR = -2;

//reserved
function _should_pass_on(env) {
    return !!env.PassOn;
}


function _step(maincb, arr, index, env, encapped_obj, result, err) {
    maincb = maincb.once();
    if (result == ERROR) {
        if (!err.shown) {
            err.shown = true;
            logger.error("Hit Error @ Step: ", index);
            try {
                logger.error("--> Tracing Back");
                logger.error("\t" + arr[index].root + "->" + arr[index].verb);
                logger.error("\t" + arr[index].args);
            } catch (e) {

            }
            logger.error(err);
        }
        return maincb(ERROR, err);
    }
    if (result == COMPLETE) {
        //END HERE
        return maincb(COMPLETE); //eol (force)
    }
    if (arr.length <= index) {
        return maincb(COMPLETE); //eol
    }
    if (result == QUIT) {
        return maincb();
    }
    if (!Array.isArray(arr[index + 1])) {
        process.nextTick(() => {
            try {
                arr[index + 1](
                    env,
                    encapped_obj,
                    _step.bind(null, maincb, arr, index + 1, env, encapped_obj)
                        .once()
                )
            } catch (e) {
                return maincb(ERROR, e);
            }
        });
    } else {
        process.nextTick(() => {
            try {
                _step((r, e) => {
                    _step(maincb, arr, index, env, encapped_obj, r, e)
                }, arr[index + 1], -1, {}, encapped_obj)
            } catch (e) {
                return maincb(ERROR, e);
            }
        });
    }
}


function run(context, arr, cb) {
    _step(cb, arr, -1, {}, context);
}