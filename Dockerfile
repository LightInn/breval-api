# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
ARG NODE_VERSION=18.17

FROM node:${NODE_VERSION}-slim as base

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

# [optional] tests & build
ARG DATABASE_HOST
ARG DATABASE_PORT
ARG DATABASE_NAME
ARG DATABASE_USERNAME
ARG DATABASE_PASSWORD
ARG S3_BUCKET
ARG S3_ACCESS_KEY_ID
ARG S3_ACCESS_SECRET
ARG S3_ENDPOINT
ARG S3_SSL
ARG S3_PORT

ENV DATABASE_HOST $DATABASE_HOST
ENV DATABASE_PORT $DATABASE_PORT
ENV DATABASE_NAME $DATABASE_NAME
ENV DATABASE_USERNAME $DATABASE_USERNAME
ENV DATABASE_PASSWORD $DATABASE_PASSWORD
ENV S3_BUCKET $S3_BUCKET
ENV S3_ACCESS_KEY_ID $S3_ACCESS_KEY_ID
ENV S3_ACCESS_SECRET $S3_ACCESS_SECRET
ENV S3_ENDPOINT $S3_ENDPOINT
ENV S3_SSL $S3_SSL
ENV S3_PORT $S3_PORT

ENV NODE_ENV production
ENV DB_CLIENT='postgres'

RUN pnpm run build

# copy production dependencies and source code into final image
FROM base AS release

ARG DATABASE_HOST
ARG DATABASE_PORT
ARG DATABASE_NAME
ARG DATABASE_USERNAME
ARG DATABASE_PASSWORD
ARG S3_BUCKET
ARG S3_ACCESS_KEY_ID
ARG S3_ACCESS_SECRET
ARG S3_ENDPOINT
ARG S3_SSL
ARG S3_PORT

ENV DATABASE_HOST $DATABASE_HOST
ENV DATABASE_PORT $DATABASE_PORT
ENV DATABASE_NAME $DATABASE_NAME
ENV DATABASE_USERNAME $DATABASE_USERNAME
ENV DATABASE_PASSWORD $DATABASE_PASSWORD
ENV S3_BUCKET $S3_BUCKET
ENV S3_ACCESS_KEY_ID $S3_ACCESS_KEY_ID
ENV S3_ACCESS_SECRET $S3_ACCESS_SECRET
ENV S3_ENDPOINT $S3_ENDPOINT
ENV S3_SSL $S3_SSL
ENV S3_PORT $S3_PORT

ENV NODE_ENV production

COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/build build
COPY --from=prerelease /usr/src/app/.strapi .strapi
COPY --from=prerelease /usr/src/app/config config
COPY --from=prerelease /usr/src/app/database database
COPY --from=prerelease /usr/src/app/public public
COPY --from=prerelease /usr/src/app/src src
COPY --from=prerelease /usr/src/app/types types
COPY --from=prerelease /usr/src/app/favicon.ico .
COPY --from=prerelease /usr/src/app/package.json .

# run the app
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 1337/tcp
ENTRYPOINT [ "pnpm", "run", "start" ]
