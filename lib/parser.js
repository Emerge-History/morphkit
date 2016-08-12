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

function root(key, default_verb, default_action) {
    logger.trace('Root: ', key);
    if(arguments.length < 3) {
        default_verb = "";
        default_action = (env, ctx, next) => {
            return next();
        };
    }
    built[key] = () => {
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
    built[root][rolly][key] = () => {
        var args = Array.prototype.slice.call(arguments);
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
    logger.trace("Compiling Config-JS", jsString.trim().clip(30));
    atom_compiled_list = []; //reset
    eval(jsString);
}

/**
 * use('../x.config') -> eval
 */
function macro(key, expander) {
    logger.trace("Registering Macro:", key);
    built[key] = expander;
}

module.export = {
    root : root,
    verb : verb,
    macro: macro 
};

global.ROOT  = root;
global.VERB  = verb;
global.MACRO = macro;

