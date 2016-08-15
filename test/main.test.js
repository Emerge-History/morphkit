var parser = require('../lib/parser.js');
var config = require('../lib/config.js');
var engine = require('../lib/engine.js');


var httpRoot = require('../roots/http.js');

require('./root.test.js');
require('./plugin.test.js');
require('../plugins/subconfig.js');
require('../plugins/flow.js');
require('../plugins/via.js');

config.init("../configs", true);



var result = parser.compile(getf("config2.demo.js"));
// console.log("Built:");
// console.log(result);

console.log("Trying to run");
setTimeout(function () {
    engine.run({
        req: {
            headers: {
                via: 'test'
            }
        }
    }, result, function (result, e) {
        console.log("Process Ended", result, e);
    });
}, 1000);