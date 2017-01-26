#! /usr/bin/env sh

./node_modules/rollup/bin/rollup -c ./test/rollup.config.js
./node_modules/mocha/bin/mocha -u tdd ./test/es5.js
