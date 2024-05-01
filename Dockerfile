FROM node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

COPY ./package.json ./

RUN pnpm install --production
RUN pnpm add pg

COPY . .

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

EXPOSE 1337

CMD ["pnpm", "start"]

