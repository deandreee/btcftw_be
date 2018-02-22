#!/bin/bash

if [[ $NODE_ENV == "production" ]]; then
  node ./src/server
else
  cd src && nodemon server.js
fi

exit 0
