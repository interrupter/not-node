#!/bin/bash
echo 'building for' $ENV 'environment'
rm -rf ./app/front/build/${TARGET_ROLE}.min.js
rm -rf ./app/front/build/${TARGET_ROLE}.js
rm -rf ./app/front/build/${TARGET_ROLE}.css
NODE_ENV=$ENV ./node_modules/.bin/eslint ./src/controllers
NODE_ENV=$ENV ./node_modules/.bin/rollup -c ./rollup/${TARGET_ROLE}.js --environment ENV:$ENV
NODE_ENV=$ENV ./node_modules/.bin/terser --compress --mangle -- build/${TARGET_ROLE}.js > ./build/${TARGET_ROLE}.min.js