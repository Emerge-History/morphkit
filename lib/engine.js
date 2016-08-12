/** given route[][]
 *  does match / action logic (pile of)
 */


function run(logicArray, encapped_obj, cb) {
    let context = { context: encapped_obj };

}

function _chunk(inner_arr, encapped_obj, cb) {
    let context = { context: encapped_obj };
}

function step(arr, index, context, cb) {
    if(arr.length <= index) {
        return cb();
    }
}