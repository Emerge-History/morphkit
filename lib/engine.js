/** given route[][]
 *  does match / action logic (pile of)
 */

require("./utils.js");

var log4js = require('log4js'); 
var logger = log4js.getLogger("morphkit::engine");

const QUIT = 1;
const NEXT = 2;
const COMPLETE = 0;
const ERROR = -1;

function _should_pass_on(env) {
    return !!env.PassOn;
}

function run(context, cb) {

}

function _step(maincb, arr, index, env, encapped_obj, result) {
    if (result == COMPLETE) {
        //END HERE
        return maincb(COMPLETE); //eol (force)
    }
    if (arr.length <= index) {
        return maincb(COMPLETE); //eol
    }
    if (result == ERROR) {
        return maincb(ERROR);
    }
    if (result == QUIT) {
        return maincb();
    }
    if (!Array.isArray(arr[index + 1])) {
        process.nextTick(() => {
            try {
                arr[index + 1](
                    env, encapped_obj, _step.bind(null, maincb, arr, index + 1, env, encapped_obj)
                )
            } catch (e) {
                return maincb(ERROR);
            }
        });
    } else {
        process.nextTick(() => {
            try {
                _step((r) => {
                    _step(maincb, arr, index, env, encapped_obj, r)
                }, arr[index + 1], -1, {}, encapped_obj)
            } catch (e) {
                return maincb(ERROR);
            }
        });
    }
}