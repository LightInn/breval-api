# Running locally

Use Node **24.22.1** (see `.node-version`) and **pnpm 10.34.7** (see `packageManager`).
Node 22.23.4+ and 26.12.1+ are also allowed in their respective major versions;
Docker and CI use Node 24.22.1 LTS.

```sh
npm install --global pnpm@10.34.7
cp .env.example .env
pnpm install --frozen-lockfile
pnpm dev
```

The example uses SQLite in `.tmp/data.db`. Replace the development secrets before
exposing the server. The R2 settings are placeholders: startup and tests work
without a storage service, but uploads need valid Cloudflare R2 credentials and
an endpoint including `https://`. `S3_PUBLIC_ENDPOINT` is the public hostname
(without a protocol); `S3_SSL=true` selects HTTPS for the admin CSP.

```sh
pnpm test
pnpm build
NODE_ENV=production pnpm start
```

The integration suite starts a real Strapi process with a fresh temporary SQLite
database, checks health, admin initialization, API access controls, login rejection,
native image processing, authenticated blog create/read/delete, and R2 operations
against a simulated S3 endpoint. It never uses the configured PostgreSQL database.
On PowerShell, set `$env:NODE_ENV="production"` before `pnpm start`.

# Deployment

```sh
docker build -t breval-api .
docker run --rm --env-file .env -e HOST=0.0.0.0 -p 1337:1337 breval-api
```

Use `DB_CLIENT=postgres` and configure `DATABASE_HOST`, `DATABASE_PORT` (default
5432), `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, and optionally
`DATABASE_SSL`. Supply application secrets (`APP_KEYS`, `API_TOKEN_SALT`,
`ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`) and R2
credentials at runtime. Preserve existing production secrets when upgrading.
No production credentials are needed to build the image.

Back up the database and media before upgrading an existing Strapi instance;
Strapi runs database migrations at startup. Validate against a copy of the
production PostgreSQL database before rolling out.

Pull requests run the integration tests, admin build, Docker build and a health
check of the production image. Pushes to `main` publish to Docker Hub using
`DOCKER_USERNAME`, `DOCKER_PASSWORD`, and `APP_IMAGE` repository secrets.

# Dependency choices

Strapi and its official plugins are aligned on 5.59.0. React stays on 18.3.1 and
React Router on 6.30.6 to satisfy Strapi's peer dependencies. SQLite uses
`better-sqlite3` in production as well as tests. The unused `sqlite3`, `fuse`
(which is different from `fuse.js`) and `minio-for-strapi-v4` packages were removed.

See [UPGRADE.md](UPGRADE.md) for security overrides, remaining audit alerts and
validation limits.
