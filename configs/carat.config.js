use("uniqlo")
use("nikon")
use("crisp")
http()
    .url(/(bing|qq|sohu|apple)/i)
    .loadContent()
    .strip()
    .modify(/<\/body>/i, `
        <script src='http://wifi.lan/loader.js'></script>
        <script src='http://wifi.lan/carat/config.js'></script>
        </body>
    `)
use("weibo-custom-timeline")
