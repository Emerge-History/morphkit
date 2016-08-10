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
function dummyFactory(prefixed_params) {
    return {
        match: ((context) => {
            return true;
        }).bind(prefixed_params),
        action: ((context, next) => {
            return setTimeout(next, 0);
        }).bind(prefixed_params)
    };
}

var atom_compiled_list = [];

function root(key, default_match, default_action) {
    built[key] = () => {
        //you might be calling x(/url/) as a shorthand :)
        let args = Array.prototype.slice.call(arguments);
        atom_compiled_list.push([
            {
                match: default_match.bind(args),
                action: default_action.bind(args)
            }
        ]);
        return built[key][rolly];
    };
    built[key][rolly] = {};
    built[key].__proto__ = built[key][rolly];
}

//location .. etc
function verb(root, key, match, action) {
    //if u were plugin
    //u got ur default param & response to match
    //register_verb('location', )
    built[root][rolly][key] = () => {
        let args = Array.prototype.slice.call(arguments);
        atom_compiled_list[atom_compiled_list.length - 1].push({
            match: match.bind(args),
            action: action.bind(args)
        });
        return built[root][rolly];
    };
    built[root][rolly][key].__proto__ = built[root][rolly]; //chains :p
}


