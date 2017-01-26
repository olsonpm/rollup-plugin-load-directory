//---------//
// Imports //
//---------//

import { curry } from 'ramda';


//------//
// Main //
//------//

export default curry(
  (fnArr, arg) => fnArr.reduce(
    (innerArg, fn) => fn(innerArg)
    , arg
  )
);
