//this should bootstrap everything
//at least for now


var config = require("./lib/config");
var engine = require("./lib/engine");
var parser = require("./lib/parser");
var base_root = require("./roots/base.js");

var folder = "./configs";

config.init(folder, true);