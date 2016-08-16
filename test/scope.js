
var b = ()=> {
    console.log(ctx);
}

function a(ctx, r) {
    eval("(" + b.toString() + ")()");
}

a(1,2);