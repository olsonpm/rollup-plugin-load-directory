//---------//
// Imports //
//---------//

import pipe from './pipe';
import reduce from './reduce';
import typeCaller from './type-caller';

import { curry, flip, is } from 'ramda';


//------//
// Main //
//------//


const bindEach = createBindEach()
  , bindStrict = createBindStrict()
  , get = createGet()
  , getEq = createGetEq()
  , ifThen = createIfThen()
  , hasKey = createHasKey()
  , invoke = curry(
    (key, obj) => is(Function, get(key, obj))
      ? obj[key]()
      : undefined
  )
  , invokeWithOr = curry(
    (fallback, key, args, obj) => is(Function, get(key, obj))
      ? obj[key].apply(obj, args)
      : fallback
  )
  , invokeWith = invokeWithOr(void 0)
  , isDefined = val => typeof val !== 'undefined'
  , keys = typeCaller(1, getCollectionTypeToKeys())
  , mutableAssoc = curry(
    (key, val, obj) => { obj[key] = val; return obj; }
  )
  , mutableMerge = curry((target, src) => {
    for (let key in src) {
      target[key] = src[key];
    }
    return target;
  })
  , mutableMergeRight = flip(mutableMerge)
  , noop = () => {}
  , size = typeCaller(1, getCollectionTypeToSize())
  , then = curry((fn, aPromise) => aPromise.then.call(aPromise, fn))
  , toBoolean = val => !!val
  , isLaden = pipe([size, toBoolean])
  ;


//-------------//
// Helper Fxns //
//-------------//

function createBindEach() {
  return curry(
    (propArr, thisObj) => reduce(
      (res, aProp) => bindStrict(res[aProp], res) && res
      , thisObj
      , propArr
    )
  );
}

function createBindStrict() {
  return curry(
    (fn, thisObj) => {
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
    (key, obj) => hasKey(key, obj)
      ? obj[key]
      : undefined
  );
}

function createGetEq() {
  return curry(
    (key, eqTo, obj) => hasKey(key, obj)
      ? obj[key] === eqTo
      : undefined
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
    (key, obj) => {
      if (obj === undefined || obj === null) return false;

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
    (cond, fn, arg) => cond(arg)
      ? fn(arg)
      : undefined
  );
}

function getCollectionTypeToKeys() {
  return {
    Object: obj => Object.keys(obj)
    , Map: aMap => [...aMap.keys()]
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
// Exports //
//---------//

export {
  bindEach, get, getEq, ifThen, invoke, invokeWith, invokeWithOr, isLaden
  , mutableAssoc, mutableMerge, mutableMergeRight, noop, then
};
