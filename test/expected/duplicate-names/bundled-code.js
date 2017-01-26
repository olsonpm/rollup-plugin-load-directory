let aDuplicate = 'a duplicate from dep1';



var deps = Object.freeze({
	aDuplicate: aDuplicate
});

global.keepDepsAlive = deps;
