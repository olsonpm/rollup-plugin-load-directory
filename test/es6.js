//---------//
// Imports //
//---------//

import bExpected from './expected/index';
import bPromise from 'bluebird';
import camelcase from 'lodash.camelcase';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import lowercase from 'lodash.lowercase';
import path from 'path';
import pipe from '../lib/pipe';
import pLoadDirectory from '../es6';
import reduceFresh from '../lib/reduce-fresh';

import { rollup } from 'rollup';
import { get, invokeWith, mutableAssoc, mutableMergeRight, then } from '../lib/utils';


//------//
// Init //
//------//

const rollupEntry = __dirname
  // , cases = [
  //   'duplicate-names', 'happy-path', 'has-index', 'has-non-js-files', 'is-empty'
  //   , 'nested-dirs'
  // ]
  , cases = [
    'duplicate-names', 'happy-path', 'has-index', 'nested-dirs'
  ]
  ;

let b  // short for 'bundles'.  holds case -> rollup bundle result
  , e  // e = resolved bExpected
  ;

bPromise.props = bPromise.props.bind(bPromise);

chai.use(chaiAsPromised);
chai.should();


//------//
// Main //
//------//

before(() => {
  return bPromise.all([
    bExpected.then(_e => { e = _e; })
    , setCaseBundles()
  ]);
});

suite('code bundles', () => {
  testBundledCode(['happy-path', 'nested-dirs', 'duplicate-names']);
});

suite('bundle warnings', () => {
  testBundleWarnings(['duplicate-names', 'has-index']);
});

suite('misc', () => {
  test('imported directory with an index.js file should cause an error without any commonjs plugins', () => {
    let didError = false;
    return rollup({
        entry: path.join(rollupEntry, 'data/depend-on-has-index.js')
        , plugins: [ pLoadDirectory() ]
      })
      .then(invokeWith(
        'generate'
        , [{
          format: 'es'
          , sourceMap: true
        }]
      ))
      .catch(err => {
        didError = true;
        err.message.should.equal(e.hasIndex.error);
      })
      .then(() => {
        didError.should.be.true;
      })
      ;
  });
});

//-------------//
// Helper Fxns //
//-------------//

function testBundledCode(bundledCodeCases) {
  bundledCodeCases.forEach(
    aCase => {
      const lower = lowercase(aCase)
        , camel = camelcase(aCase);

      test(lower, () => {
        if (!get([camel, 'code'], b)) {
          throw new Error("code cases set up incorrectly");
        }
        b[camel].code.should.equal(e[camel].code);
      });
    }
  );
}

function testBundleWarnings(warningCases) {
  warningCases.forEach(
    aCase => {
      const lower = lowercase(aCase)
        , camel = camelcase(aCase);

      test(lower, () => {
        if (!get([camel, 'warning'], b)) {
          throw new Error("warning cases set up incorrectly");
        }
        b[camel].warning.should.equal(e[camel].warning);
      });
    }
  );
}

function rollupAndBundle(aCase) {
  let warning;
  return rollup({
      entry: path.join(rollupEntry, `data/depend-on-${aCase}.js`)
      , plugins: [ pLoadDirectory() ]
      , onwarn: ({ message }) => { warning = message; }
    })
    .then(invokeWith(
      'generate'
      , [{
        format: 'es'
        , sourceMap: true
      }]
    ))
    .then(mutableMergeRight({ warning }))
    ;
}

function setCaseBundles() {
  return pipe(
    [
      reduceFresh(
        (res, aCase) => mutableAssoc(
          camelcase(aCase)
          , rollupAndBundle(aCase)
          , res
        )
        , () => ({})
      )
      , bPromise.props
      , then(_bundles => { b = _bundles; })
    ]
    , cases
  );
}
