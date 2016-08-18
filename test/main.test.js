var parser = require('../lib/parser.js');
var config = require('../lib/config.js');
var engine = require('../lib/engine.js');

var httpRoot = require('../roots/http.js');


require('./root.test.js');
require('../plugins/helperFuncs.js');
require('../plugins/subconfig.js');
require('../plugins/http.js');
require('../plugins/modify.js');
require('../plugins/flow.js');
require('../plugins/via.js');
require('../plugins/sslstrip.js');
// require('./plugin.test.js');

config.init("../configs", true);

// var result = parser.compile(getf("config2.demo.js"));
// console.log("Built:");
// console.log(result);
