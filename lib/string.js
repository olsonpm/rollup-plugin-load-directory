//---------//
// Imports //
//---------//

import { curry } from 'ramda';


//------//
// Main //
//------//

const startsWithString = curry(
  (start, str) => {
    if (start.length > str.length) return false;

    let i = 0
      , isSame = true;

    while (i < start.length && isSame) {
      isSame = start[i] === str[i];
      i += 1;
    }

    return isSame;
  }
);

const endsWithString = curry(
  (end, str) => {
    if (end.length > str.length) return false;

    let i = 0
      , isSame = true;

    while (i < end.length && isSame) {
      isSame = end[end.length - i] === str[str.length - i];
      i += 1;
    }

    return isSame;
  }
);


//---------//
// Exports //
//---------//

export { endsWithString, startsWithString };
