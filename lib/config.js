var fs = require('fs');
var log4js = require('log4js');
var path = require('path');
var parser = require('./parser.js');
var logger = log4js.getLogger("morphkit::config");
var default_folder = path.join(__dirname, "../configs");

var configCache = {};
var folders = [];
var references = {};

function _loadFile(root, file) {
    if (!file.toLowerCase().endsWith(".config.js")) {
        return;
    }
    var id = file.chopExt().toLowerCase();
    //we need to by sync at this time :(
    try {
        var stat = fs.statSync(path.join(root, file));
        if (!configCache[id] || configCache[id].stamp != stat.mtime) {
            logger.trace(configCache[id] ? "Reloading" : "Loading", root, id);
            var buf = fs.readFileSync(path.join(root, file)).toString('utf8');
            configCache[id] = parser.compile(buf.toString('utf8'));
            configCache[id].stamp = stat.mtime;
            logger.trace("Successfully Compiled: ", root, id);
        }
        return configCache[id];
    } catch (e) {
        logger.error("Error loading", root, id);
        logger.error(e);
    }
}

function _removeFile(root, file) {
    if (!file.toLowerCase().endsWith(".config.js")) {
        return;
    }
    var id = id.chopExt().toLowerCase();
    if (configCache[id]) {
        logger.trace("Removing", root, id);
        delete configCache[id];
    }
}

function _watch(folder) {
    logger.trace("Setting up watcher at: ", folder);
    if (folders.indexOf(folder) >= 0) {
        if (folders[folders.indexOf(folder)].watched) {
            return;
        }
        folders[folders.indexOf(folder)].watched = true;
    }
    fs.watch(folder, (event, filename) => {
        //ignore if its folder
        var fullpath = path.join(folder, filename);
        if (!fullpath.toLowerCase().endsWith(".config.js")) {
            return;
        }
        logger.trace("IO Event ", fullpath);
        fs.stat(fullpath, (err, stat) => {
            if (err) {
                //possibly removed
                logger.trace("Entry removed / Lost", fullpath);
            } else if (stat.isFile()) {
                //changed
                // _loadFile(folder, filename);
                _fullReload();
            }
        });
    });
}

function _fullReload() {
    logger.info("Performing full reload");
    for (var i = 0; i < folders.length; i++) {
        loadFolder(folders[i]);
    }
}

function loadFolder(folder) {
    try {
        console.log(folder);
        if (folders.indexOf(folder) < 0) {
            folders.push(folder);
        }
        var _files = fs.readdirSync(folder);
        var files = [];
        for (var i = 0; i < _files.length; i++) {
            if (fs.statSync(path.join(folder, _files[i])).isFile()) {
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
    // _folder = folder;
    logger.trace("Config Folder = [", folder, "]");
    if (arguments.length == 0) {
        folder = default_folder;
    }
    if (do_watch) {
        _watch(folder);
    }
    loadFolder(folder);
}

function get(config) {
    return configCache[config];
}

function tryGet(config) {
    logger.trace("Trying to Load", config);
    if (get(config)) {
        return get(config);
    }
    for (var i = 0; i < folders.length; i++) {
        logger.trace("  > Searching ", folders[i]);
        try {
            var loaded = _loadFile(folders[i], config + ".config.js");
            if (loaded) {
                return loaded;
            }
        } catch (e) {
            //sorry :(
        }
    }
    logger.trace("File not found / failed to load", config);
    return;
}

function getDefault() {
    return configCache['default'];
}

module.exports = {
    init: init,
    tryGet: tryGet,
    load: init,
    loadFolder: loadFolder,
    get: get,
    getDefault: getDefault
};

