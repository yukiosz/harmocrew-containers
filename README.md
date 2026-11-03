# HarmoCrew em containers

Trabalho de containerização: o HarmoCrew (plataforma de colaboração musical)
roda com **um container para o frontend web** e **um container para a API**,
além do PostgreSQL. O mesmo projeto é executado com Docker Compose e em um
cluster Docker Swarm com Docker Visualizer.

```
harmocrew-containers/
├── api/                  API REST Spring Boot (Java 21) + Dockerfile
├── web/                  Frontend React + Dockerfile + nginx/default.conf
├── docker-compose.yml    Ambiente local (web, api, db)
└── infra/swarm/
    ├── docker-compose.cluster.yml   Laboratório: 1 manager + 2 workers (DinD) + registry
    ├── stack.yml                    Aplicação distribuída (web, api, db, visualizer)
    ├── init-cluster.sh              Cria o cluster
    ├── deploy.sh                    Constrói imagens, envia ao registry e implanta
    ├── scale.sh                     Varia réplicas (ex.: api 5)
    └── remove-cluster.sh            Desmonta tudo
```

## Arquitetura

```
navegador ──:8000──▶ web (NGINX + React)
                       │  /api, /swagger-ui, /health
                       ▼
                     api (Spring Boot, N réplicas) ──▶ db (PostgreSQL + volume)
```

O NGINX do container `web` entrega os arquivos do React e encaminha `/api`
para o serviço `api`. Para o navegador tudo vem da mesma origem, então não é
preciso configurar CORS na API. No Swarm, o nome `api` resolve para o IP
virtual do serviço, que distribui as requisições entre as réplicas.

## Imagens e sistema base

| Imagem | Uso | Base |
| --- | --- | --- |
| `eclipse-temurin:21-jdk-alpine` | build da API (Maven Wrapper) | Alpine |
| `eclipse-temurin:21-jre-alpine` | execução da API | Alpine |
| `node:20-alpine` | build do React | Alpine |
| `nginx:1.27-alpine` | execução do frontend | Alpine |
| `postgres:16-alpine` | banco de dados | Alpine |
| `docker:29-dind` | nós do cluster | Alpine |

Os dois Dockerfiles são **multi-stage**: a primeira etapa compila (JDK/Maven,
Node/npm) e a segunda leva só o resultado (JAR, arquivos estáticos). A imagem
final não tem compilador, dependências de build nem código-fonte.

## 1. Docker Compose (local)

```bash
docker compose up -d --build
docker compose ps
docker stats                         # consumo x limites de CPU/memória
```

- Aplicação: <http://localhost:8000>
- Swagger: <http://localhost:8000/swagger-ui.html>
- Health: <http://localhost:8000/health>

A API sobe com 2 réplicas (`deploy.replicas`). Para variar:

```bash
docker compose up -d --scale api=4
docker compose ps api
```

Teste do volume: `docker compose down` (sem `-v`) e `docker compose up -d`;
os usuários e projetos continuam lá.

## 2. Docker Swarm + Visualizer

Execute a partir da raiz deste projeto, em Linux, WSL ou Git Bash, com o
Docker em execução.

```bash
chmod +x infra/swarm/*.sh
./infra/swarm/init-cluster.sh       # 3 nós: manager + 2 workers
./infra/swarm/deploy.sh             # build, push no registry e stack deploy
```

- Aplicação: <http://localhost:8000>
- API (routing mesh): <http://localhost:8080/health>
- Docker Visualizer: <http://localhost:8081>

Comandos para mostrar o cluster (`DOCKER_HOST` aponta para o manager):

```bash
export DOCKER_HOST=tcp://127.0.0.1:2375
docker node ls
docker stack services harmocrew
```

Variação de réplicas, acompanhando no Visualizer:

```bash
./infra/swarm/scale.sh api 5
./infra/swarm/scale.sh api 1
```

Também é possível mudar `replicas` no `stack.yml` e rodar `deploy.sh` de novo.

## 3. Limpeza

```bash
./infra/swarm/remove-cluster.sh
docker compose -f infra/swarm/docker-compose.cluster.yml down -v
docker compose down -v
docker image prune -a
```

## Desenvolvimento sem Docker

```bash
cd api && ./mvnw spring-boot:run        # precisa de PostgreSQL em localhost:5432
cd web && npm install && npm start      # o "proxy" do package.json aponta para :8080
```

## Limites conhecidos

- O PostgreSQL fica preso ao manager porque o volume é local ao nó.
- O logout usa uma blacklist de tokens em memória: com várias réplicas da
  API, um token invalidado em uma réplica ainda é aceito pelas outras.
- Senhas e segredo JWT estão em texto no `stack.yml`; o próximo passo seria
  `docker secret`.
- Docker-in-Docker com `privileged` é adequado para laboratório; em produção
  cada nó seria uma VM ou máquina.
