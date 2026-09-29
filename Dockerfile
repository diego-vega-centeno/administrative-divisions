# Dev stage: target for development mode
FROM dhi.io/node:24-alpine3.23-dev AS dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Build react application
FROM dhi.io/node:24-alpine3.22-dev AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .

# Mounts the secret file temporarily during build only
RUN --mount=type=secret,id=env_prod,target=/app/.env.production \
    --mount=type=secret,id=env_local,target=/app/.env.production.local,required=false \
    npm run build

# Prepare Nginx to Serve Static Files
FROM dhi.io/nginx:1.28.0-alpine3.21-dev AS runner
COPY nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html

USER nginx

EXPOSE 8080

ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]