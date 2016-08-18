require("./utils.js");

var log4js = require('log4js');
var logger = log4js.getLogger("morphkit::parser");

/* meta-tasty :p  WTF? */

var rolly = Object.create({}); // <-- key of the rolly obj (belongs to each root)
var built = {
    default: {}
};
built.default[rolly] = {};

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
    if (arguments.length < 2) {
        default_verb = "";
        default_action = (env, ctx, next) => {
            return next();
        };
    } else {
        default_action = default_verb;
        default_verb = key + "_entry";
    }
    built[key] = function () {
        logger.debug('+' + key);
        //you might be calling x(/url/) as a shorthand :)
        var args = Array.prototype.slice.call(arguments);
        var act = default_action.bind(args);
        act.root = key;
        act.verb = default_verb;
        act.args = args;
        atom_compiled_list.push([
            act
        ]);
        atom_compiled_list.runtime_root = key;
        return built[key][rolly];
    };
    built[key][rolly] = {};
    built[key][rolly].__proto__ = built.default[rolly]; //built[key][rolly];
    built[key].__proto__ = built.default[rolly]; //built[key][rolly];
}

//location .. etc
function verb(root, key, action) {
    //if u were plugin
    //u got ur default param & response to match
    //register_verb('location', )
    logger.trace('Registering Verb: ', root, '>', key);
    built[root][rolly][key] = function () {
        var root_under_context = root;
        var args = Array.prototype.slice.call(arguments);
        var act = action.bind(args);
        if (root == "default" && atom_compiled_list.runtime_root) {
            root_under_context = atom_compiled_list.runtime_root;
        }
        logger.debug('  -> ' + key, args, "/", root_under_context);
        act.root = root_under_context;
        act.verb = key;
        act.args = args;
        atom_compiled_list[atom_compiled_list.length - 1].push(act);
        return built[root_under_context][rolly];
    };
    built[root][rolly][key].__proto__ = built[root][rolly]; //chains :p
}

/**
 * does the actual in-time 'compilation'
 */
function compile(jsString, local_compile, extra_comp) {
    logger.trace(extra_comp ? " <inline>" : "<config>")
    logger.trace("\n" + jsString.trim()/*.clip(30)*/);
    atom_compiled_list = local_compile ? local_compile : []; //reset
    eval(`function _job_() {
        //let's split [this]
        for(var i in this) {
            if(i == "default") continue;
            eval("var " + i + " = this['" + i + "']");
        }
        ${jsString}
    }`);
    var e = built;
    if (extra_comp) {
        e = {};
        for (var i in built) { e[i] = built[i]; }
        for (var i in extra_comp) { e[i] = extra_comp[i]; }
    }
    _job_.apply(e);
    logger.trace(extra_comp ? " </inline>" : "</config>");
    return atom_compiled_list;
}

/**
 * use('../x.config') -> eval - expanding command sets
 * happens at compile time, not runtime
 */
function macro(key, expander) {
    logger.trace("Registering Macro:", key);
    built[key] = function () {
        var args = Array.prototype.slice.call(arguments);
        logger.debug('*M* > ' + key, args);
        var _copy_of_current_list = atom_compiled_list;
        atom_compiled_list = [];
        var res = expander.apply(args);
        atom_compiled_list = _copy_of_current_list;
        //res should be a set of string or Array
        if (Array.isArray(res)) {
            for (var i = 0; i < res.length; i++) {
                atom_compiled_list.push(res[i]);
            }
        } else if (typeof res == "string") { //code pieces
            _copy_of_current_list = atom_compiled_list;
            compile(res, _copy_of_current_list); //continues
        }
    };
}

/**
 * simple stuff, returns string (as inline) and expands
 */
function inline(root, key, expander) {
    logger.trace("Registering Inline:", root, '>', key);

    built[root][rolly][key] = function () {
        var root_under_context = root;
        if (root == "default" && atom_compiled_list.runtime_root) {
            root_under_context = atom_compiled_list.runtime_root;
        }
        var args = Array.prototype.slice.call(arguments);
        logger.debug('*I* -> ' + key, args, "/", root_under_context);
        var res = expander.apply(args); //piece of string
        var _copy_of_current_list = atom_compiled_list;
        compile(res, _copy_of_current_list, built[root_under_context][rolly]); //continues
        return built[root_under_context][rolly];
    };
    built[root][rolly][key].__proto__ = built[root][rolly]; //chains :p

}

function createenv(arr) {
    if (!arr) return;
    if (!Array.isArray(arr)) {
        arr = [arr];
    }
    for(var i = 0; i < arr.length; i++) {
        if(typeof arr[i] != "function") continue;
        built[arr[i].name] = arr[i];
    }
}


module.exports = {
    root: root,
    verb: verb,
    alias: alias,
    macro: macro,
    inline: inline,
    compile: compile,
    env: createenv
};

global.ROOT = root;
global.ALIAS = alias;
global.VERB = verb;
global.MACRO = macro;
global.INLINE = inline;
global.ENV = createenv;

