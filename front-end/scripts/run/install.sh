docker build -t yarn-install-image -f ./scripts/run/dockerfile.install ./scripts/run/

docker run --rm -v $(pwd):/usr/src/app yarn-install-image
