#/usr/bin/bash

export REACT_APP_DOMAIN_NAME=ictrl.ca
cd ./client
npm i --force
npm run build
cd ..


# build websockify
cd application/websockify-other/c
make
cd ../../..
