http()
    .sub("roubeihome")
    .end()

http()
    .url(/wechat/)
    .end()

http()
    .strip()
    .modify(/呵呵/g, "lol")

