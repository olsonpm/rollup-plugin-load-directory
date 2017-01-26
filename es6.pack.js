import fs from 'fs';
import path from 'path';
import camelcase from 'lodash.camelcase';
import extensionless from 'extensionless';
import mustache from 'mustache';
import { parse } from 'acorn';
import { yellow } from 'chalk';
import { promisifyAll } from 'bluebird';
import { all, always, both, curry, curryN, is, pick, tail, type } from 'ramda';

//---------//
// Imports //
//---------//

//------//
// Main //
//------//

var typeCaller = function (numArgs, collectionTypeMapper) { return curryN(numArgs, function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return collectionTypeMapper[type(tail(args))].apply(collectionTypeMapper, args);
    }); };

//---------//
// Imports //
//---------//

//------//
// Main //
//------//

var any = typeCaller(2, getCollectionTypeToAny());


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToAny() {
  return {
    Object: function (predicate, obj) {
      var keys = Object.keys(obj);

      var found = false
        , i = 0;

      while (!found && i < keys.length) {
        var aKey = keys[i];

        found = predicate(obj[aKey], aKey, obj);

        i += 1;
      }

      return found;
    }
    , Array: function (predicate, arr) {
      var found = false
        , i = 0;

      while (!found && i < arr.length) {
        found = predicate(arr[i], i, arr);
        i += 1;
      }

      return found;
    }
  };
}

//---------//
// Imports //
//---------//

//------//
// Main //
//------//

var pipe = curry(
  function (fnArr, arg) { return fnArr.reduce(
    function (innerArg, fn) { return fn(innerArg); }
    , arg
  ); }
);

//
// README
// - Reducer functions should mutate for sake of speed, but this causes issues
//   when used with currying.  The 'fresh' variant of reduce still allows us to
//   mutate the result object while still currying because we give it a fresh
//   initial result at the beginning of every call (as opposed to referencing
//   the previous call's result object)
//

//---------//
// Imports //
//---------//

//------//
// Main //
//------//

var reduceFresh = typeCaller(3, getCollectionTypeToReducer());


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToReducer() {
  return {
    Object: function (fn, getRes, obj) {
      var res = getRes();
      Object.keys(obj).forEach(function (key) {
        res = fn(res, obj[key], key, obj);
      });
      return res;
    }
    , Array: function (fn, getRes, arr) { return arr.reduce(fn, getRes()); }
  };
}

//---------//
// Imports //
//---------//

//------//
// Main //
//------//

var startsWithString = curry(
  function (start, str) {
    if (start.length > str.length) { return false; }

    var i = 0
      , isSame = true;

    while (i < start.length && isSame) {
      isSame = start[i] === str[i];
      i += 1;
    }

    return isSame;
  }
);

var endsWithString = curry(
  function (end, str) {
    if (end.length > str.length) { return false; }

    var i = 0
      , isSame = true;

    while (i < end.length && isSame) {
      isSame = end[end.length - i] === str[str.length - i];
      i += 1;
    }

    return isSame;
  }
);

//---------//
// Imports //
//---------//

//------//
// Main //
//------//

var reduce = typeCaller(3, getCollectionTypeToReducer$1());


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToReducer$1() {
  return {
    Object: function (fn, res, obj) {
      Object.keys(obj).forEach(function (key) {
        res = fn(res, obj[key], key, obj);
      });
      return res;
    }
    , Array: function (fn, res, arr) { return arr.reduce(fn, res); }
  };
}

//---------//
// Imports //
//---------//

//------//
// Main //
//------//


var bindEach = createBindEach();
var bindStrict = createBindStrict();
var get = createGet();
var getEq = createGetEq();
var ifThen = createIfThen();
var hasKey = createHasKey();
var invoke = curry(
    function (key, obj) { return is(Function, get(key, obj))
      ? obj[key]()
      : undefined; }
  );
var invokeWithOr = curry(
    function (fallback, key, args, obj) { return is(Function, get(key, obj))
      ? obj[key].apply(obj, args)
      : fallback; }
  );
var invokeWith = invokeWithOr(void 0);
var isDefined = function (val) { return typeof val !== 'undefined'; };
var keys = typeCaller(1, getCollectionTypeToKeys());
var mutableAssoc = curry(
    function (key, val, obj) { obj[key] = val; return obj; }
  );
var noop = function () {};
var size = typeCaller(1, getCollectionTypeToSize());
var then = curry(function (fn, aPromise) { return aPromise.then.call(aPromise, fn); });
var toBoolean = function (val) { return !!val; };
var isLaden = pipe([size, toBoolean]);


//-------------//
// Helper Fxns //
//-------------//

function createBindEach() {
  return curry(
    function (propArr, thisObj) { return reduce(
      function (res, aProp) { return bindStrict(res[aProp], res) && res; }
      , thisObj
      , propArr
    ); }
  );
}

function createBindStrict() {
  return curry(
    function (fn, thisObj) {
      if (!is(Function, fn)) {
        throw new Error("bindStrict must be passed a function as its first argument."
          + "\n  fn: " + JSON.stringify(fn, null, 2)
          + "\n  thisObj: " + JSON.stringify(thisObj, null, 2)
        );
      }
      return fn.bind(thisObj);
    }
  );
}

function createGet() {
  return curry(
    function (key, obj) { return hasKey(key, obj)
      ? obj[key]
      : undefined; }
  );
}

function createGetEq() {
  return curry(
    function (key, eqTo, obj) { return hasKey(key, obj)
      ? obj[key] === eqTo
      : undefined; }
  );
}

//
// The implementation of this method is kind of weird due to there being no
//   uniform way to determine whether a key 'exists' on a variable.  The below
//   implementation consciously lacks checks for properties on non-object types
//   which are explicitly (and confusingly) set to undefined.  This use-case
//   should either be narrow enough not to never worry about, or non-existent.
//
function createHasKey() {
  return curry(
    function (key, obj) {
      if (obj === undefined || obj === null) { return false; }

      return isDefined(obj[key])
        || (
          typeof obj === 'object'
          && key in obj
        );
    }
  );
}

function createIfThen() {
  return curry(
    function (cond, fn, arg) { return cond(arg)
      ? fn(arg)
      : undefined; }
  );
}

function getCollectionTypeToKeys() {
  return {
    Object: function (obj) { return Object.keys(obj); }
    , Map: function (aMap) { return [].concat( aMap.keys() ); }
  };
}

function getCollectionTypeToSize() {
  return {
    Object: pipe([keys, get('length')])
    , Map: get('size')
    , Array: get('length')
    , Set: get('size')
  };
}

//---------//
// Imports //
//---------//

// node
// external
// internal
//------//
// Init //
//------//

var bFs = bindEach(['statAsync'], promisifyAll(fs));
var virtualModulePrefix = '\0__directory-loader:';
var isMyVirtualModule = startsWithString(virtualModulePrefix);
var joinPath = curry(function (first, second) { return path.join(first, second); });
var warnAbout = createWarnAbout();
var codeTemplate = getCodeTemplate();
var namedTypes = new Set(['ExportAllDeclaration', 'ExportNamedDeclaration']);
var renderTemplate = getRenderTemplate();

namedTypes.has = namedTypes.has.bind(namedTypes);


//------//
// Main //
//------//

var thePlugin = function () {
	return {
		name: 'directory-loader'
    , load: load
    , resolveId: resolveId
	};
};


//-------------//
// Helper Fxns //
//-------------//

function load(someId) {
  if (!isMyVirtualModule(someId)) { return; }

  var dirToLoad = someId.slice(virtualModulePrefix.length);
  return bFs.readdirAsync(dirToLoad)
    .filter(both(endsWithString('.js'), isFile(dirToLoad)))
    .map(toFileNameAstPair(dirToLoad))
    .then(ifThen(isLaden, getFilenamesToImportCode()))
    .then(function (theCode) { return console.log('theCode: ' + JSON.stringify(theCode, null, 2)) || theCode; })
    ;
}

function resolveId(importee, importer) {
  // if importer starts with '\0__directory-loader:', then we are importing the
  //   directory's files
  var importerIsMyVirtualModule = ifThen(isLaden, isMyVirtualModule, importer);
  if (importerIsMyVirtualModule) {
    return path.join(importer.slice(virtualModulePrefix.length), importee);
  }

  if (
    /\0/.test(importee) // ignore IDs with null character, these belong to other plugins
    || !importer // disregard entry module
    || ! /\/$/.test(importee) // doesn't have trailing forward slash
    || ! /^(?:\.|\/)/.test(importee) // doesn't begin with a period or forward slash
  ) { return; }

  // seems like we have an explicit directory to resolve, let's verify
  var fullPathToImportee = path.resolve(path.dirname(importer), importee);
  return bFs.statAsync(fullPathToImportee)
    .then(function (importeeStats) {
      if (!importeeStats.isDirectory()) {
        warnAbout.notADirectory(importee);
        return;
      }

      // check to see if index.js might cause confusion
      return bFs.statAsync(path.join(fullPathToImportee, 'index.js'))
        .then(function () {
          warnAbout.indexInDirectory(importee);
          return true;
        })
        .catch({code: 'ENOENT'}, always(false))
        .then(function (indexExists) {
          if (!indexExists) // success!
            { return virtualModulePrefix + fullPathToImportee; }
        })
        ;
    })
    // if fullPathToImportee doesn't exist, then we need to ignore it
    .catch({code: 'ENOENT'}, noop)
    ;
}

function createWarnAbout() {
  return {
    indexInDirectory: function (importee) { return console.warn(yellow('Warning: ')
      + "rollup-plugin-directory-loader found an 'index.js' file "
      + "residing in the following imported directory:\n" + importee
      + "\n\nThis plugin will ignore the directory assuming the index.js "
      + "file was intended.  To remove this warning, please remove the"
      + " trailing '/' in your import statement or remove the index.js"
      + " file (depending on your needs).  This plugin only resolves"
      + "  imports with the trailing '/' e.g."
      + "\nimport something from './path/to/something/'; // plugin resolves this"
      + "\nimport something from './path/to/something';  // ignores this\n\n"
    ); }
    , notADirectory: function (importee) { return console.warn(yellow('Warning: ')
      + "rollup-plugin-directory-loader came across an import for '" + importee
      + "' which didn't pass stats.isDirectory().  This plugin will thus ignore"
      + " the import.  This plugin attmpts to resolve all relative and absolute"
      + " imports with a trailing '/'.  Please raise an issue in the github repo"
      + " if you come across this use-case so I can implement an ignore feature."
      + "  Currently I'm assuming this just shouldn't happen.\n\n"
    ); }
  };
}

function getCodeTemplate() {
  return "{{# defaults }}"
    + "\nexport { default as {{ camelCased }} } from './{{ original }}';"
    + "\n{{/ defaults }}"
    + "\n{{# named }}"
    + "\nexport * from './{{ . }}';"
    + "\n{{/ named }}"
    ;
}

function getFilenamesToImportCode() {
  return pipe([
    reduceFresh(
      function (res, ref) {
        var filename = ref[0];
        var ast = ref[1];

        if (astHasDefaults(ast)) {
          res.defaults.push({
            camelCased: camelcase(extensionless(filename))
            , original: filename
          });
        }
        if (astHasNamed(ast)) {
          res.named.push(filename);
        }
        return res;
      }
      , function () { return ({ defaults: [], named: [] }); }
    )
    , ifThen(hasDefaultsOrNamed, renderTemplate(codeTemplate))
  ]);
}

function hasDefaultsOrNamed(tplData) {
  return all(isLaden, pick(['defaults', 'named'], tplData));
}

function getRenderTemplate() {
  return curry(
    function (str, view) { return mustache.render(str, view); }
  );
}

function isFile(dirToLoad) {
  return pipe(
    [joinPath(dirToLoad), bFs.statAsync, then(invoke('isFile'))]
  );
}

function toFileNameAstPair(dirToLoad) {
  return function (aJavascriptFileName) {
    return bFs.readFileAsync(path.join(dirToLoad, aJavascriptFileName), 'utf8')
      .then(function (contents) { return [
        path.basename(aJavascriptFileName)
        , toAst(contents)
      ]; });
  };
}

function toAst(str) {
  return parse(str, {
    ecmaVersion: 8
    , sourceType: 'module'
  });
}

function astHasDefaults(ast) {
  return any(getEq('type', 'ExportDefaultDeclaration'), ast.body);
}

function astHasNamed(ast) {

  return any(
    pipe([
      get('type')
      , namedTypes.has
    ])
    , ast.body
  );
}

export default thePlugin;
