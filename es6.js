//---------//
// Imports //
//---------//

// node
import fs from 'fs';
import path from 'path';

// external
import camelcase from 'lodash.camelcase';
import extensionless from 'extensionless';
import mustache from 'mustache';

import { parse } from 'acorn';
import { yellow } from 'chalk';
import { promisifyAll } from 'bluebird';
import { all, always, both, curry, pick } from 'ramda';

// internal
import any from './lib/any';
import mutableMap from './lib/mutable-map';
import pipe from './lib/pipe';
import reduceFresh from './lib/reduce-fresh';

import { endsWithString, startsWithString } from './lib/string';
import { bindEach, get, getEq, ifThen, invoke, isLaden, noop, then } from './lib/utils';


//------//
// Init //
//------//

const bFs = bindEach(['statAsync'], promisifyAll(fs))
  , virtualModulePrefix = '\0__directory-loader:'
  , isMyVirtualModule = startsWithString(virtualModulePrefix)
  , joinPath = curry((first, second) => path.join(first, second))
  , codeTemplate = getCodeTemplate()
  , namedTypes = new Set(['ExportAllDeclaration', 'ExportNamedDeclaration'])
  , renderTemplate = getRenderTemplate()
  ;

namedTypes.has = namedTypes.has.bind(namedTypes);


//------//
// Main //
//------//

const thePlugin = ({ onwarn = defaultOnWarn }) => {
  if (typeof onwarn !== 'function') {
    throw new Error("onwarn must be typeof 'function'"
      + "\n  typeof onwarn: " + typeof onwarn
    );
  }

  const warnAbout = createWarnAbout(onwarn);

	return {
    load
		, name: 'directory-loader'
    , resolveId: createResolveId({ warnAbout })
	};
};


//-------------//
// Helper Fxns //
//-------------//

function load(someId) {
  if (!isMyVirtualModule(someId)) return;

  const dirToLoad = someId.slice(virtualModulePrefix.length);
  return bFs.readdirAsync(dirToLoad)
    .filter(both(endsWithString('.js'), isFile(dirToLoad)))
    .map(toFileNameAstPair(dirToLoad))
    .then(ifThen(isLaden, getFilenamesToImportCode()))
    ;
}

function createResolveId({ warnAbout }) {
  return (importee, importer) => {
    // if importer starts with '\0__directory-loader:', then we are importing the
    //   directory's files
    const importerIsMyVirtualModule = ifThen(isLaden, isMyVirtualModule, importer);
    if (importerIsMyVirtualModule) {
      return path.join(importer.slice(virtualModulePrefix.length), importee);
    }

    if (
      /\0/.test(importee) // ignore IDs with null character, these belong to other plugins
      || !importer // disregard entry module
      || ! /\/$/.test(importee) // doesn't have trailing forward slash
      || ! /^(?:\.|\/)/.test(importee) // doesn't begin with a period or forward slash
    ) return;

    // seems like we have an explicit directory to resolve, let's verify
    const fullPathToImportee = path.resolve(path.dirname(importer), importee);
    return bFs.statAsync(fullPathToImportee)
      .then(importeeStats => {
        if (!importeeStats.isDirectory()) {
          warnAbout.notADirectory(importee);
          return;
        }

        // check to see if index.js might cause confusion
        return bFs.statAsync(path.join(fullPathToImportee, 'index.js'))
          .then(() => {
            warnAbout.indexInDirectory(importee);
            return true;
          })
          .catch({code: 'ENOENT'}, always(false))
          .then(indexExists => {
            if (!indexExists) // success!
              return virtualModulePrefix + fullPathToImportee;
          })
          ;
      })
      // if fullPathToImportee doesn't exist, then we need to ignore it
      .catch({code: 'ENOENT'}, noop)
      ;
  };
}

function createWarnAbout(onwarn) {
  return mutableMap(
    fn => pipe([fn, onwarn])
    , {
      indexInDirectory: importee => ({
        message: "rollup-plugin-directory-loader found an 'index.js' file "
          + "residing in the following imported directory:\n" + importee
          + "\n\nThis plugin will ignore the directory assuming the index.js "
          + "file was intended.  To remove this warning, please remove the"
          + " trailing '/' in your import statement or remove the index.js"
          + " file (depending on your needs).  This plugin only resolves"
          + "  imports with the trailing '/' e.g."
          + "\nimport something from './path/to/something/'; // plugin resolves this"
          + "\nimport something from './path/to/something';  // ignores this\n\n"

        , code: 'INDEX_IN_DIRECTORY'
      })
      , notADirectory: importee => ({
        message: "rollup-plugin-directory-loader came across an import for '" + importee
          + "' which didn't pass stats.isDirectory().  This plugin will thus ignore"
          + " the import.  This plugin attmpts to resolve all relative and absolute"
          + " imports with a trailing '/'.  Please raise an issue in the github repo"
          + " if you come across this use-case so I can implement an ignore feature."
          + "  Currently I'm assuming this just shouldn't happen.\n\n"

        , code: 'NOT_A_DIRECTORY'
      })
    }
  );
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
      (res, [filename, ast]) => {
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
      , () => ({ defaults: [], named: [] })
    )
    , ifThen(hasDefaultsOrNamed, renderTemplate(codeTemplate))
  ]);
}

function hasDefaultsOrNamed(tplData) {
  return all(isLaden, pick(['defaults', 'named'], tplData));
}

function getRenderTemplate() {
  return curry(
    (str, view) => mustache.render(str, view)
  );
}

function isFile(dirToLoad) {
  return pipe(
    [joinPath(dirToLoad), bFs.statAsync, then(invoke('isFile'))]
  );
}

function toFileNameAstPair(dirToLoad) {
  return aJavascriptFileName => {
    return bFs.readFileAsync(path.join(dirToLoad, aJavascriptFileName), 'utf8')
      .then(contents => [
        path.basename(aJavascriptFileName)
        , toAst(contents)
      ]);
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

function defaultOnWarn({ message }) {
  console.warn(yellow('Warning: ')  + message);
}


//---------//
// Exports //
//---------//

export default thePlugin;
