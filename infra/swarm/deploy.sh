#!/bin/sh
# Constroi as imagens dentro do manager, envia ao registry local e implanta a
# stack. Execute a partir da raiz do projeto: ./infra/swarm/deploy.sh
set -eu

# Os comandos abaixo falam com o Docker do MANAGER (DinD), nao com o host.
export DOCKER_HOST="tcp://127.0.0.1:2375"

docker build -t registry:5000/harmocrew-api:latest ./api
docker push registry:5000/harmocrew-api:latest

docker build -t registry:5000/harmocrew-web:latest ./web
docker push registry:5000/harmocrew-web:latest

docker stack deploy --with-registry-auth -c infra/swarm/stack.yml harmocrew
docker stack services harmocrew
