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
    .bodyParser('form', (body, req) => {
        if (body.fid !== weiboId) {
            return false;
        }
        return true;
    })
    // .noProxy(200, "done")
    .noProxy()
    .setStatus(200)
    .content((env, ctx) => {
        return JSON.stringify({
            statuses:
            [{
                created_at: 'Tue Sep 06 18:31:42 +0800 2016',
                id: 4016777727445410,
                text: '欢迎莅临#WISE#大会',
                source: '<a href="sinaweibo://customweibosource" rel="nofollow">Edge Proxy</a>',
                appid: 1302240,
                user: {},
                reposts_count: 0,
                comments_count: 0,
                attitudes_count: 0,
                rid: '0_0_2_2606541022738144674',
                mblogid: 'E72sQveTg',
                mblogtypename: '好友圏',
                title: "Test",
            }],
            next_cursor: 4016772275273940,
            since_id: 4016777727445410,
            max_id: 4016772275273940,
            has_unread: 0,
        })
    })
    .log('form')


// http()
//     .rewrite("http://baidu.com")



var tq = {
    statuses:
    [{
        created_at: 'Tue Sep 06 18:31:42 +0800 2016',
        id: 4016777727445410,
        mid: '4016777727445410',
        idstr: '4016777727445410',
        text: '有没有权威月球账号测评师啊',
        textLength: 26,
        source_allowclick: 1,
        source_type: 2,
        source: '<a href="sinaweibo://customweibosource" rel="nofollow">日々楽々iPhone 6</a>',
        appid: 1302240,
        favorited: false,
        truncated: false,
        in_reply_to_status_id: '',
        in_reply_to_user_id: '',
        in_reply_to_screen_name: '',
        pic_ids: [Object],
        thumbnail_pic: 'http://ww4.sinaimg.cn/thumbnail/b1868024gw1f7k1nr9oaoj204w04wq2x.jpg',
        bmiddle_pic: 'http://ww4.sinaimg.cn/bmiddle/b1868024gw1f7k1nr9oaoj204w04wq2x.jpg',
        original_pic: 'http://ww4.sinaimg.cn/large/b1868024gw1f7k1nr9oaoj204w04wq2x.jpg',
        geo: null,
        user: [Object],
        annotations: [Object],
        reposts_count: 0,
        comments_count: 0,
        attitudes_count: 0,
        isLongText: false,
        mlevel: 0,
        visible: [Object],
        biz_feature: 4294967300,
        hasActionTypeCard: 0,
        darwin_tags: [],
        hot_weibo_tags: [],
        text_tag_tips: [],
        rid: '0_0_2_2606541022738144674',
        userType: 0,
        cardid: 'star_002',
        positive_recom_flag: 0,
        gif_ids: '',
        is_show_bulletin: 0,
        mblog_comments: [],
        pic_infos: [Object],
        mblogid: 'E72sQveTg',
        scheme: 'sinaweibo://detail/?mblogid=E72sQveTg',
        mblogtypename: '好友圏',
        attitudes_status: 0,
        title: [Object],
        pic_bg: 'http://img.t.sinajs.cn/t6/skin/public/feed_cover/star_002_y.png?version=2016070502',
        pic_bg_type: 1,
        recom_state: -1
    }],
    advertises: [],
    ad: [],
    hasvisible: false,
    previous_cursor: 0,
    next_cursor: 4016772275273940,
    total_number: 1997,
    interval: 0,
    uve_blank: -1,
    since_id: 4016777727445410,
    max_id: 4016772275273940,
    has_unread: 0,
    groupInfo:
    {
        name: 'Friends Circle',
        settings: { remind: 1 },
        list_id: '100091527941012',
        users: [[Object], [Object], [Object], [Object], [Object], [Object]],
        total_number: 274
    }
}