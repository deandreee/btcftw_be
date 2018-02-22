#!/bin/bash

cd ../crp-ui
rm -rf build
npm run build
cd ../crp
rm -rf ui
mkdir -p ui
cp -a ../crp-ui/build/* ui
cd ../crp

exit 0
