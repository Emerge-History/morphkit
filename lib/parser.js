require("./utils.js");

var log4js = require('log4js'); 
var logger = log4js.getLogger("morphkit::parser");

/* meta-tasty :p  WTF? */

var rolly = Object.create({}); // <-- key of the rolly obj (belongs to each root)
var built = {};

/**
 * so in each plugin
 * your match & action method receive user-config-params by using this[0], this[1].. so on
 * as [this] <- will be their args
 * 
 * e.g:
 * 
 * location.url(/test.com/ig)
 *           ^
 *           .---->  return 
 *                      { 
 *                          match :
 *                              (context) => {
 *                                                
 *                              }
 *                      }
 */

var atom_compiled_list = [];

function alias(root, newName) {
    logger.trace("Root-Alias", root, newName);
    built[newName] = built[root];
}

function root(key, default_verb, default_action) {
    logger.trace('Root: ', key);
    if(arguments.length < 3) {
        default_verb = "";
        default_action = (env, ctx, next) => {
            return next();
        };
    }
    built[key] = function() {
        logger.trace('+' + key);
        //you might be calling x(/url/) as a shorthand :)
        var args = Array.prototype.slice.call(arguments);
        var act = default_action.bind(args);
        act.root = key;
        act.verb = default_verb;
        act.args = args;
        atom_compiled_list.push([
            act
        ]);
        return built[key][rolly];
    };
    built[key][rolly] = {};
    built[key].__proto__ = built[key][rolly];
}

//location .. etc
function verb(root, key, action) {
    //if u were plugin
    //u got ur default param & response to match
    //register_verb('location', )
    logger.trace('Registering Verb: ', root, '>', key);
    built[root][rolly][key] = function() {
        var args = Array.prototype.slice.call(arguments);
        logger.trace('  -> ' + key, args);
        var act = action.bind(args);
        act.root = root;
        act.verb = key;
        act.args = args;
        atom_compiled_list[atom_compiled_list.length - 1].push(act);
        return built[root][rolly];
    };
    built[root][rolly][key].__proto__ = built[root][rolly]; //chains :p
}

/**
 * does the actual in-time 'compilation'
 */
function compile(jsString) {
    logger.trace("Compiling Config-JS")
    logger.trace("\n" + jsString.trim().clip(30));
    atom_compiled_list = []; //reset
    eval(`function _job_() {
        //let's split [this]
        for(var i in this) {
            eval("var " + i + " = this['" + i + "']");
        }
        ${jsString}
    }`);
    _job_.apply(built);
    return atom_compiled_list;
}

/**
 * use('../x.config') -> eval
 */
function macro(key, expander) {
    logger.trace("Registering Macro:", key);
    built[key] = expander;
}

module.exports = {
    root : root,
    verb : verb,
    alias: alias,
    macro: macro,
    compile: compile
};

global.ROOT  = root;
global.ALIAS = alias;
global.VERB  = verb;
global.MACRO = macro;

