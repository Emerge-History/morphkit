function promissive() {
    var args = Array.prototype.slice.call(arguments);
    var func = args.shift();
    return new Promise(function (res, rej) {
        var cb = function () {
            var cb_args = Array.prototype.slice.call(arguments);
            var err = cb_args.shift();
            if (err) {
                return rej(err);
            } else {
                if (cb_args.length == 1) {
                    return res(cb_args[0]);
                } else {
                    return res(cb_args);
                }
            }
        };
        args.push(cb);
        func.apply(null, args);
    });
}

function expand(func) {
    return function (res) {
        res = Array.isArray(res) ? res : [res];
        return func.apply(null, res);
    };
}

Function.prototype.promise = function () {
    var _this = this;
    var args = Array.prototype.slice.call(arguments);
    args.unshift(_this);
    return promissive.apply(null, args);
}

module.exports = promissive;
module.exports.expand = expand;