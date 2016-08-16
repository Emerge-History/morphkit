http()
    .contenttype("...")
    .end()



http()
    .func((ctx, env) => 
        ctx.req.headers["demo"] ? CONTINUE : REJECT
    )

test()
    .dummyA(13)
    .set({
        test: 1,
        q: () => {
            console.log("inside set method");
            return 15;
        }
    })
    .func((ctx, env) => {
        return CONTINUE;
    })
    .dummyB(15)

http()
    .via("Hello")