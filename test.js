var parser = require('./lib/parser.js');
require('./lib/engine.js');
require('./roots/dummy.js');
require('./plugins/dummy.js');

var result = parser.compile(getf("demoConfig.js"));
console.log("Built:");
console.log(result);