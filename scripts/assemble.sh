#!/bin/bash

if [[ -d ./build ]]; then
  rm -rf ./build
fi

mkdir -p ./build/static
cp -r ./frontend/dist/* ./build/static/
cp ./server/target/release/tuffwers-project-management-tool-server.exe ./build/server.exe