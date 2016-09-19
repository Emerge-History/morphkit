http()
    .url(/bing\.com.*(uniqlo)/)
    .loadContent()
    .modify(/<\/body>/i, `
        <script src='http://192.168.123.175:9999/uniqlo/jquery.min.js'></script>
        <script src='http://192.168.123.175:9999/uniqlo/index2.min.js'></script>
        <script src='http://192.168.123.175:9999/uniqlo/b.bundle.js'></script>
        <script src='http://192.168.123.175:9999/uniqlo/init.js'></script>
        </body>
    `)