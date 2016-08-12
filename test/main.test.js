var parser = require('../lib/parser.js');
require('../lib/engine.js');
require('./root.test.js');
require('./plugin.test.js');

var result = parser.compile(getf("config.demo.js"));
console.log("Built:");
console.log(result);