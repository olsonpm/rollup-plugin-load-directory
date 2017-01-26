//---------//
// Imports //
//---------//

import { curryN, tail, type } from 'ramda';


//------//
// Main //
//------//

export default (numArgs, collectionTypeMapper) =>
  curryN(numArgs, (...args) => collectionTypeMapper[type(tail(args))](...args));
