http()
    .resheader({
        "content-length": 
        [false, num(lt(3000))]
    })
    .passon()

http()
    .strip()
    .url(/bing.com/)
    .sub("demo")

http()
    .url(/wechat/)
    .end()

http()
    .strip()
