//---------//
// Imports //
//---------//

import bPromise from 'bluebird';
import fs from 'fs';
import path from 'path';


//------//
// Init //
//------//

const bFs = bPromise.promisifyAll(fs)
  , rollupEntry = __dirname
  ;


//------//
// Main //
//------//

const duplicateNames = bPromise.props({
  code: bReadFile('duplicate-names/bundled-code.js')
  , warning: bReadFile('duplicate-names/warning-namespace-conflict.txt')
});

const happyPath = bPromise.props({
  code: bReadFile('happy-path/bundled-code.js')
});

const nestedDirs = bPromise.props({
  code: bReadFile('nested-dirs/bundled-code.js')
});

const hasIndex = bPromise.props({
  warning: bReadFile('has-index/warning-directory-ignored.txt')
  , error: bReadFile('has-index/error-cannot-resolve.txt')
});


//-------------//
// Helper Fxns //
//-------------//

function bReadFile(aPath) {
  return bFs.readFileAsync(path.join(rollupEntry, 'expected', aPath), 'utf8');
}


//---------//
// Exports //
//---------//

export default bPromise.props({
  duplicateNames, happyPath, hasIndex, nestedDirs
});
