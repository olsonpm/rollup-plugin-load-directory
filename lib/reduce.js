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
    Object: (fn, res, obj) => {
      Object.keys(obj).forEach(key => {
        res = fn(res, obj[key], key, obj);
      });
      return res;
    }
    , Array: (fn, res, arr) => arr.reduce(fn, res)
  };
}
