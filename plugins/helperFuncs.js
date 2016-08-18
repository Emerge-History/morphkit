

function num(func) {
    return (e) => {
        return func(parseFloat(e));
    }
}

function gt(num) {
    return (e) => {
        return e > num;
    }
}

function lt(num) {
    return (e) => {
        return e < num;
    }
}

function gte(num) {
    return (e) => {
        return e >= num;
    }
}

function lte(num) {
    return (e) => {
        return e <= num;
    }
}

ENV([num, gt, lt, gte, lte])