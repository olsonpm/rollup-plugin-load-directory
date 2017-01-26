//---------//
// Imports //
//---------//

import typeCaller from './type-caller';


//------//
// Main //
//------//

export default typeCaller(2, getCollectionTypeToMutableMap());


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToMutableMap() {
  return {
    Object: (fn, obj) => {
      Object.keys(obj).forEach(key => {
        obj[key] = fn(obj[key], key, obj);
      });
      return obj;
    }
    , Array: (fn, arr) => {
      arr.forEach((el, idx) => {
        arr[idx] = fn(el, idx, arr);
      });
      return arr;
    }
  };
}
