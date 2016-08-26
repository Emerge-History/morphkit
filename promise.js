var request = require('request');

Function.prototype.promise = function () {
    //shift one out
    var args = Array.prototype.slice.call(arguments);
    var func = this;
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

function req(url) {
    return request.promise({
        url: url,
        method: "GET"
    }).then(expand((res, body) => {
        return body;
    }))
}

req("http://www.bing.com").then(console.log);