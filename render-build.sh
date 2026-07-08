#!/usr/bin/env bash
set -e

echo "==> Building webapp..."
cd apps/webapp
npm install --include=dev
npm run build

echo "==> Copying webapp build into apps/api/public-app..."
cd ../api
mkdir -p public-app
cp -r ../webapp/dist/. public-app/

echo "==> Installing & building api..."
npm install --include=dev
npx prisma generate
npm run build

echo "==> Build complete."
