//---------//
// Imports //
//---------//

import pBuble from 'rollup-plugin-buble';


//------//
// Init //
//------//

const external = [
  'acorn', 'bluebird', 'chai', 'chalk', 'extensionless', 'fs'
  , 'lodash.camelcase', 'mustache', 'path', 'ramda', 'rollup'
];


//------//
// Main //
//------//

export default {
  entry: 'es6.js'
  , dest: 'es5.js'
  , external
  , format: 'cjs'
  , plugins: [
    pBuble()
  ]
};
