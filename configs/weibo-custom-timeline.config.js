
http()
    .url(/api.weibo.cn\/2\/statuses\/unread_friends_timeline/i)
    .loadContent()
    .log('json')

weiboId = "0000001"
_36kr = {
    "id": 0,
    "screen_name": "36氪 <WISE 2016>",
    "profile_image_url": "http://tva3.sinaimg.cn/crop.133.113.754.754.180/684ff39bgw1f6wlmiignrj20rt0rtta8.jpg",
    "gender": "m",
    "followers_count": 999999,
    "friends_count": 999999,
    "pagefriends_count": 1,
    "following": false,
    "allow_all_act_msg": false,
    "verified": true,
    "verified_type": 1,
    "remark": "",
    "avatar_large": "http://tva3.sinaimg.cn/crop.133.113.754.754.180/684ff39bgw1f6wlmiignrj20rt0rtta8.jpg",
    "avatar_hd": "http://tva3.sinaimg.cn/crop.133.113.754.754.180/684ff39bgw1f6wlmiignrj20rt0rtta8.jpg",
    "verified_reason": "",
    "verified_trade": "",
    "verified_reason_url": "",
    "verified_source": "",
    "verified_source_url": "",
    "follow_me": false,
    "icons": [
        {
            "url": "http://192.168.40.58:9888/logokr.png"
        }
    ]
};

http()
    .url(/api.weibo.cn\/2\/groups\/allgroups/i)
    .contenttype('json')
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
    .bodyParser('form', (body, req, env) => {
        if (body.fid !== weiboId) {
            return false;
        }
        env.maxid = body.max_id;
        env.sinceid = body.since_id;
        return true;
    })
    .noProxy()
    .content((env, ctx) => {
        console.log(env);
        if ((env.maxid && env.maxid.toString() == '4016772275273910') ||
            (env.sinceid && env.sinceid.toString() == '4016777727445401')) {
            ctx.upstream.res_status = 400;
            return '';
        }
        ctx.upstream.res_status = 200;
        return JSON.stringify({
            statuses:
            [{
                created_at: 'Tue Sep 06 18:31:42 +0800 2016',
                id: 4016777727445410,
                text: '欢迎莅临#WISE#大会\n',
                source: '<a href="sinaweibo://customweibosource" rel="nofollow">Edge Proxy</a>',
                reposts_count: 0,
                comments_count: 0,
                attitudes_count: 9999,
                rid: '0_0_2_2606541022738144674',
                user: _36kr
            },
                {
                    created_at: 'Tue Sep 06 18:31:42 +0800 2016',
                    id: 4016777727445401,
                    text: '【主会场 | 互联网金融】今日，在“WISE×科技金融”大会上，36氪创始人兼联席CEO刘成城说：互联网金融虽有动荡，但正迎来转折性机会。 http://t.cn/RtwyPlp',
                    source: '<a href="sinaweibo://customweibosource" rel="nofollow">Edge Proxy</a>',
                    reposts_count: 0,
                    comments_count: 0,
                    attitudes_count: 0,
                    rid: '0_0_2_2606541022738144674',
                    user: _36kr
                }],
            next_cursor: 4016772275273910,
            since_id: 4016777727445401,
            max_id: 4016772275273910,
            has_unread: 0,
        })
    })
    .log('form')