//---------//
// Imports //
//---------//

import path from 'path';
import pBuble from 'rollup-plugin-buble';


//------//
// Init //
//------//

const external = [
  'acorn', 'bluebird', 'chai', 'chai-as-promised', 'chalk', 'extensionless'
  , 'fs', 'lodash.camelcase', 'lodash.lowercase', 'mustache', 'path', 'ramda'
  , 'rollup'
];


//------//
// Main //
//------//

export default {
  entry: path.join(__dirname, 'es6.js')
  , dest: path.join(__dirname, 'es5.js')
  , external
  , format: 'cjs'
  , plugins: [
    pBuble()
  ]
};
