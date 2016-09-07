http("responder")
    .url(/demoUrl/i)
    .noProxy()
    .setStatus(200)
    .content("helloworld")

http("responder")
    .rewrite("http://qq.com")

http()
    .url(/bing/i)
    .contenttype(/html/ig)
    .loadContent()
    .modify(/哈/ig, "test")
    
use("weibo-custom-timeline")

