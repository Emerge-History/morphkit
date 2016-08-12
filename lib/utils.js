String.prototype.clip = function (len, postfix) {
    postfix = postfix || "...";
    return this.length < len ? this.toString() : (this.substring(0, len) + postfix);
}


Function.prototype.once = function (err_when_dup) {
    var _this = this;
    if (_this._called == undefined) {
        _this._called = false;
        _this._meta = function () {
            if (_this.called) {
                if (err_when_dup) {
                    throw new Exception("Function tagged with [Once] called multiple times");
                }
                else {
                    return;
                }
            }
            _this.called = true;
            _this.apply(this, arguments);
        };
    }
    return _this._meta;
}