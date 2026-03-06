docker run -d \
  --name front-end \
  --label project=meuml \
  --workdir /var/app \
  --publish 3000:3000 \
  --volume ./:/var/app \
  node:16.20.2 \
  yarn start