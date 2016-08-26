http("responder")
    .url(/demoUrl/i)
    .noProxy()    
    .setStatus(200)
    .content("helloworld")

http("responder")
    .rewrite("http://qq.com")


http()
    .rewrite("http://baidu.com")