//---------//
// Imports //
//---------//

import typeCaller from './type-caller';


//------//
// Main //
//------//

export default typeCaller(2, getCollectionTypeToAny());


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToAny() {
  return {
    Object: (predicate, obj) => {
      const keys = Object.keys(obj);

      let found = false
        , i = 0;

      while (!found && i < keys.length) {
        let aKey = keys[i];

        found = predicate(obj[aKey], aKey, obj);

        i += 1;
      }

      return found;
    }
    , Array: (predicate, arr) => {
      let found = false
        , i = 0;

      while (!found && i < arr.length) {
        found = predicate(arr[i], i, arr);
        i += 1;
      }

      return found;
    }
  };
}
