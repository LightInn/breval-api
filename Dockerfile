# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
ARG NODE_VERSION=18.17

FROM node:${NODE_VERSION}-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev

COPY package.json pnpm-lock.yaml /temp/dev/
RUN cd /temp/dev && pnpm install --frozen-lockfile  --verbose

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json pnpm-lock.yaml /temp/prod/
RUN cd /temp/prod && pnpm install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease

COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ARG DB_CLIENT="sqlite"
ENV DB_CLIENT=${DB_CLIENT}

ENV NODE_ENV production

RUN pnpm run build

# copy production dependencies and source code into final image
FROM base AS release

ENV NODE_ENV production

COPY --chown=node:node --from=install /temp/prod/node_modules node_modules
COPY --chown=node:node --from=prerelease /usr/src/app/build build
COPY --chown=node:node --from=prerelease /usr/src/app/.strapi .strapi
COPY --chown=node:node --from=prerelease /usr/src/app/config config
COPY --chown=node:node --from=prerelease /usr/src/app/public public
COPY --chown=node:node --from=prerelease /usr/src/app/src src
COPY --chown=node:node --from=prerelease /usr/src/app/types types
COPY --chown=node:node --from=prerelease /usr/src/app/favicon.ico .
COPY --chown=node:node --from=prerelease /usr/src/app/package.json .

# run the app
RUN apt-get update && apt-get install -y curl --no-install-recommends && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /usr/src/app/database/migrations
RUN chown -R node:node /usr/src/app/database
USER node

EXPOSE 1337/tcp
ENTRYPOINT [ "pnpm", "run", "start" ]
