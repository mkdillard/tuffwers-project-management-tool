#!/bin/bash

echo "Preparing build..."
if [[ -d ./frontend/dist ]]; then
  rm -rf ./frontend/dist
fi

if [[ -d ./build ]]; then
  rm -rf ./build
fi

mkdir -p ./build/static

echo "Building frontend..."
cd ./frontend
if [[ ! -d node_modules ]]; then  
  yarn install
fi
yarn build
cd ../
echo "Frontend build finished."

cp -r ./frontend/dist/* ./build/static/

echo "Building server..."
cd ./server
cargo build --release
cd ../
echo "Backend build finished."
pwd
cp ./server/target/release/tuffwers-project-management-tool-server.exe ./build/server.exe