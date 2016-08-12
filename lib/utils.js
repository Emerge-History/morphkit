String.prototype.clip = function(len, postfix) {
    postfix = postfix || "...";
    return this.length < len ? this.toString() : (this.substring(0, len) + postfix);
}