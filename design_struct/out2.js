
plugin:

match, work

header -> 


url.match(cur.req, /test/g)
//strip.match(cur.req)
inject.match(cur.req)
log.match(cur.req)

url.work(cur, /test/g, context);

function work () {
    return;
}

context.res = myres;

inject = () => {
    context.res.content = ... 
}