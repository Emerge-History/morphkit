http("responder")
    .url(/demoUrl/i)
    .noProxy()
    .setStatus(200)
    .content("helloworld")

http("responder")
    .rewrite("http://qq.com")


weiboId = "0000001"

http()
    .url(/api.weibo.cn\/2\/groups\/allgroups/i)
    .contenttype('json')
    .loadRequest()
    .loadContent()
    .modify((buffer) => {
        var gapi = JSON.parse(buffer.toString('utf8'));
        gapi.total_number++;
        var uid = gapi.groups[0].group[0].uid;
        gapi.groups[0].group.unshift({
            "gid": weiboId,
            "uid": uid,
            "title": "WISE-2016大会",
            "count": 3,
            "type": "9",
            "settings": {
                "remind": 1
            },
            "frequency": 1
        }
        );
        return JSON.stringify(gapi);
    })
    .log('json')

http()
    .url(/api.weibo.cn\/2\/groups\/timeline/i)
    .loadRequest()
    .noProxy(200, "done")
    .log('form')


// http()
//     .rewrite("http://baidu.com")

