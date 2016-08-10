location
    .url(/./)
    .contenttype(/html|json/)
    .passthrough()

location (/test/g)
    .ua(mobile)
    .weibo ({
        enabled: 1,
        source: "1.json"
    })

location
    .url(/test/g)
    .strip(true)
    .inject("http://1.js")
    .log(1)

secure
    .url(/baidu/)
    .pem('1.key', '2.crt')
    .redirect(302, "http://m.baidu.com")

secure
    .pem('my.key', 'my.crt')
    .passthrough()





















location [/./, UA(mobile)] ({
    
})

location ({

})

secure [/www.baidu.com/] ({
    redirect: [302, 'm.baidu.com']
})

global ({
    
})







verb [ matchers ] ( {
    options_for_verb
} ) 