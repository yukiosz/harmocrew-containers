import axios from "axios";

/*
 * Cliente da API Spring Boot.
 *
 * O endereco padrao e relativo ("/api"): no container, o NGINX que serve o
 * frontend encaminha /api para o servico "api" (Compose ou Swarm). Assim o
 * navegador conversa com uma unica origem e nao ha bloqueio de CORS.
 * Em desenvolvimento (npm start), o "proxy" do package.json faz o mesmo papel.
 */
const client = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
});

export function setAuthToken(token) {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }
  delete client.defaults.headers.common.Authorization;
}

export function errorMessage(error, fallback) {
  const data = error?.response?.data;
  if (data?.fieldErrors) {
    return Object.entries(data.fieldErrors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(" · ");
  }
  return data?.message || fallback;
}

const data = (promise) => promise.then((response) => response.data);

const api = {
  auth: {
    login: (email, password) => data(client.post("/auth/login", { email, password })),
    register: (payload) => data(client.post("/auth/register", payload)),
    logout: () => client.post("/auth/logout"),
  },
  artists: {
    list: () => data(client.get("/artists")),
    get: (id) => data(client.get(`/artists/${id}`)),
    update: (id, payload) => data(client.put(`/artists/${id}`, payload)),
  },
  projects: {
    list: () => data(client.get("/projects")),
    get: (id) => data(client.get(`/projects/${id}`)),
    create: (payload) => data(client.post("/projects", payload)),
    addArtist: (projectId, artistId) =>
      data(client.post(`/projects/${projectId}/artists/${artistId}`)),
  },
  applications: {
    byArtist: (artistId) => data(client.get("/applications", { params: { artistId } })),
    byProject: (projectId) => data(client.get(`/projects/${projectId}/applications`)),
    create: (projectId, payload) =>
      data(client.post(`/projects/${projectId}/applications`, payload)),
    updateStatus: (id, status) =>
      data(client.patch(`/applications/${id}/status`, { status })),
  },
  messages: {
    byProject: (projectId) => data(client.get(`/projects/${projectId}/messages`)),
    send: (projectId, senderArtistId, content) =>
      data(
        client.post(`/projects/${projectId}/messages`, {
          senderArtistId,
          content,
          type: "MESSAGE",
        })
      ),
  },
};

export default api;
