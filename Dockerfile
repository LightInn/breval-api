ARG NODE_VERSION=24.22.1
FROM node:${NODE_VERSION}-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install --global pnpm@10.34.7
WORKDIR /usr/src/app

FROM base AS install
# Native modules can fall back to compilation when no prebuilt binary is available.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM install AS prerelease
COPY . .
ENV NODE_ENV=production
ENV STRAPI_TELEMETRY_DISABLED=true
RUN pnpm run build
RUN pnpm prune --prod

FROM base AS release
ENV NODE_ENV=production
ENV HOST=0.0.0.0
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --chown=node:node --from=prerelease /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=prerelease /usr/src/app/build ./build
COPY --chown=node:node --from=prerelease /usr/src/app/.strapi ./.strapi
COPY --chown=node:node --from=prerelease /usr/src/app/config ./config
COPY --chown=node:node --from=prerelease /usr/src/app/public ./public
COPY --chown=node:node --from=prerelease /usr/src/app/src ./src
COPY --chown=node:node --from=prerelease /usr/src/app/types ./types
COPY --chown=node:node --from=prerelease /usr/src/app/favicon.ico ./
COPY --chown=node:node --from=prerelease /usr/src/app/package.json ./
RUN mkdir -p database/migrations .tmp && chown -R node:node database .tmp
USER node
EXPOSE 1337/tcp
CMD ["pnpm", "run", "start"]
