import { dep1, namedDep1, namedDep2 } from './happy-path/';

global.keepDepsAlive = [dep1, namedDep1, namedDep2];
