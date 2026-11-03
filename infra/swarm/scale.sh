#!/bin/sh
# Varia o numero de replicas de um servico da stack.
#   ./infra/swarm/scale.sh api 5
#   ./infra/swarm/scale.sh api 1
set -eu
export DOCKER_HOST="tcp://127.0.0.1:2375"

service="${1:?informe o servico (api ou web)}"
replicas="${2:?informe o numero de replicas}"

docker service scale "harmocrew_${service}=${replicas}"
docker service ps --filter desired-state=running "harmocrew_${service}"
