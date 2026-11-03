# HarmoCrew Web

Frontend React do HarmoCrew, adaptado ao contrato da API Spring Boot (`../api`).

- `src/services/api.js` concentra todas as chamadas (`/api/auth`, `/api/artists`,
  `/api/projects`, `/api/applications`, `/api/projects/{id}/messages`).
- `npm start` usa o `proxy` do `package.json` para a API em `localhost:8080`.
- `npm test` roda os testes; `npm run build` gera os arquivos que o NGINX serve.
- Em container, `nginx/default.conf` encaminha `/api` para o serviço `api`.
