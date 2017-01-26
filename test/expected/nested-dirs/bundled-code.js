let defaultDep$2 = 'this is default dep2';
let namedDep2 = 'this is named dep2';

let defaultDep$4 = 'this is default dep3';
let namedDep3 = 'this is named dep3';

let defaultDep = 'this is default dep1';



var deps = Object.freeze({
	dep1: defaultDep,
	dep2: defaultDep$2,
	dep3: defaultDep$4,
	namedDep2: namedDep2,
	namedDep3: namedDep3
});

global.keepDepsAlive = deps;
