/** given route[][]
 *  does match / action logic (pile of)
 */

const NEXT =  1;
const END =  0;
const ERROR = -1;

function _should_pass_on(env) {
    return !!env.PassOn;
}

function run(arr, encapped_obj, cb) {
}

function _next(maincb, arr, index, env, encapped_obj, result) {
    if(result == END) {
        //END HERE
        return maincb(END); //eol (force)
    }
    if(arr.length <= index) {
        return maincb(END); //eol
    }
    process.nextTick(arr[index + 1](
        env, encapped_obj, next.bind(null, maincb, arr, index + 1, env, encapped_obj)
    ));
}