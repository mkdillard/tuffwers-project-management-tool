#!/bin/bash

echo "Preparing build..."
if [[ -d ./frontend/static ]]; then
  rm -rf ./frontend/static
fi

if [[ -d ./server/static ]]; then
  rm -rf ./server/static
fi

mkdir ./frontend/static
mkdir ./server/static

echo "Building frontend..."
cd frontend
wasm-pack build --target web --out-name index --out-dir ./static
cd ../
echo "Frontend build finished."

cp frontend/static/* server/static/

echo "Building server..."
cd server
cargo build --release
cd ../
echo "Backend build finished."