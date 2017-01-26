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

import typeCaller from './type-caller';


//------//
// Main //
//------//

export default typeCaller(3, getCollectionTypeToReducer());


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToReducer() {
  return {
    Object: (fn, getRes, obj) => {
      let res = getRes();
      Object.keys(obj).forEach(key => {
        res = fn(res, obj[key], key, obj);
      });
      return res;
    }
    , Array: (fn, getRes, arr) => arr.reduce(fn, getRes())
  };
}
