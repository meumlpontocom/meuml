docker build -t yarn-build-image -f ./scripts/run/dockerfile.build ./scripts/run/
docker run --rm -v $(pwd):/usr/src/app yarn-build-image
sudo chown -R $(whoami) build && chmod -R 777 build