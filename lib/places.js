var fs = require('fs');
var log4js = require('log4js');
var path = require('path');
var parser = require('./parser.js');
var logger = log4js.getLogger("morphkit::places");
var _folder = path.join(__dirname, "../configs");

var placesCache = {};

function _loadFile(root, file) {
    if (!file.toLowerCase().endsWith(".js")) {
        return;
    }
    var id = file.chopExt().toLowerCase();
    logger.trace(placesCache[id] ? "Reloading" : "Loading", root, id);
    fs.readFile(path.join(root, file), (err, res) => {
        if (err) {
            logger.error("Error loading", root, id);
            logger.error(err);
        } else {
            try {
                placesCache[id] = parser.compile(res.toString('utf8'));
                logger.trace("Successfully Compiled: ", root, id);
            } catch (e) {
                logger.error("Error compiling", root, id);
                logger.error(e);
            }
        }
    });
}

function _removeFile(root, file) {
    if (!file.toLowerCase().endsWith(".js")) {
        return;
    }
    var id = id.chopExt().toLowerCase();
    if (placesCache[id]) {
        logger.trace("Removing", root, id);
        delete placesCache[id];
    }
}

function _watch(folder) {
    logger.trace("Setting up watcher at: ", _folder);
    fs.watch(folder, (event, filename) => {
        //ignore if its folder
        var fullpath = path.join(_folder, filename);
        if (!fullpath.toLowerCase().endsWith(".js")) {
            return;
        }
        logger.trace("IO Event ", fullpath);
        fs.stat(fullpath, (err, stat) => {
            if (err) {
                //possibly removed
                logger.trace("Entry removed / Lost", fullpath);
            } else if (stat.isFile()) {
                //changed
                _loadFile(folder, filename);
            }
        });
    });
}

function loadFolder(folder) {
    try {
        var _files = fs.readdirSync(folder);
        var files = [];
        for(var i = 0; i < _files.length; i++) {
            if(fs.statSync(path.join(folder, _files[i])).isFile()) {
                files.push(_files[i]);
            }
        }
        logger.trace("Loading folder contents:", folder, "[" + files.length + "]");
        for (var i = 0; i < files.length; i++) {
            logger.trace(" + ", files[i], (i + 1) + "/" + files.length);
            _loadFile(folder, files[i]);
        }
        logger.trace("Folder loaded", folder);
    } catch (e) {
        logger.error("Error loading folder", folder);
        logger.error(e);
    }
}

function init(folder, do_watch) {
    _folder = folder;
    if (do_watch) {
        _watch(folder);
    }
    loadFolder(folder);
}


module.exports = {
    init: init,
    loadFolder: loadFolder
};