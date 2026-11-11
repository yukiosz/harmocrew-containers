
FROM node:20-alpine AS build
WORKDIR /app


COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY public public
COPY src src

ENV REACT_APP_API_URL=/api
RUN npm run build


FROM nginx:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
