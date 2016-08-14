var parser = require('../lib/parser.js');
var engine = require('../lib/engine.js');
var places = require('../lib/places.js');

require('./root.test.js');
require('./plugin.test.js');

var result = parser.compile(getf("config.demo.js"));
// console.log("Built:");
// console.log(result);

console.log("Trying to run");
engine.run({}, result, function(result, e) {
    console.log("Process Ended", result, e);
});

places.init("../configs", true);