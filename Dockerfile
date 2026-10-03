# syntax=docker/dockerfile:1

# --- Build: validate the catalog and generate the static site -----------------------
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG RELEASE_SHA=dev
ENV RELEASE_SHA=$RELEASE_SHA
RUN npm run build

# --- Runtime: unprivileged nginx serving dist/ on port 8080 -------------------------
FROM nginxinc/nginx-unprivileged:1.29-alpine
ARG RELEASE_SHA=dev
LABEL org.opencontainers.image.source="https://github.com/SamRepository/ufc-student-platform" \
      org.opencontainers.image.description="UFC Master 1 S1 student platform (static site)" \
      org.opencontainers.image.revision=$RELEASE_SHA
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/health/ready || exit 1
