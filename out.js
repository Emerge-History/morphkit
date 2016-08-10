[
    {
        plugin: "weibo",
        filter: [],
        options: {
            enabled: 1
        }
    },

    {
        plugin: "location",
        filter: [
            regexMatcher.bind(null, /test/g),
        ],
        options: {
            strip: true,
            inject: ["http://"],
            log: true
        }
    },

    {
        plugin: "location",
        filter: [
            regexMatcher.bind(null, /./g),
            UAmatcher.bind(null, mobile)
        ],
        options: {
        }
    }
]