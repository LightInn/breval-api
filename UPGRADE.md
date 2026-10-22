# Node / Strapi security upgrade — 2026-10-22

## Versions

- Runtime: Node 24.22.1 LTS in `.node-version`, Docker and CI.
- Package manager: pnpm 10.34.7, pinned in `packageManager` and Docker.
- Strapi and official plugins: 5.59.0.
- React 18.3.1 and React Router 6.30.6 satisfy Strapi's published peers;
  React 19 and Router 7 are deliberately deferred.
- Other direct dependencies and the compatible transitive dependency tree were
  refreshed. SQLite uses better-sqlite3 13.0.3 in production and tests.

Node security release: https://nodejs.org/en/blog/vulnerability/october-2026-security-releases

## Targeted overrides

Strapi and the R2 provider pin some dependencies below available security fixes.
`pnpm.overrides` applies these corrections without changing their major versions:

| Dependency  | Selected version | Reason                                                                 |
| ----------- | ---------------- | ---------------------------------------------------------------------- |
| DOMPurify   | 3.4.17           | Fixes the critical and other sanitizer advisories                      |
| Vite        | 6.4.4            | Fixes the reported development-server advisories                       |
| markdown-it | 14.3.3           | Fixes the reported parser denial-of-service advisories                 |
| Lodash      | 4.18.1           | Removes the R2 provider's vulnerable pinned Lodash copy                |
| AWS SDK v2  | 2.1693.0         | Last v2 release; replaces the old SDK and vulnerable xml2js dependency |
| Nodemailer  | 9.1.1            | Available same-major security fixes; see remaining alerts below        |
| Webpack     | 5.112.0          | Satisfies schema-utils' peer constraint                                |

Remove overrides when upstream dependencies include suitable versions.
better-sqlite3 13 ships precompiled Node-API binaries, including Windows x64 and
Linux x64/ARM64. Its implicit node-gyp rebuild is disabled in pnpm so installation
does not unnecessarily require Visual Studio. The other approved native build
scripts remain enabled. Docker also includes compilation tools in its build stage.

## Remaining audit alerts

`pnpm audit --prod --json`, run after this upgrade, reports **0 critical,
4 high, 10 moderate and 1 low** alerts. These counts are advisories, not distinct
packages. This upgrade is **not a claim that all dependency vulnerabilities have
been eliminated**.

| Dependency in the production dependency graph | Severity        | Required follow-up                                                                                                            |
| --------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| webpack-dev-middleware 6.1.3                  | High            | Strapi pins v6; advisory requires >=7.4.6. Upgrade the development middleware integration upstream.                           |
| nodemailer 9.1.1                              | High / moderate | Strapi's default sendmail provider uses v9; remaining fixes require >=10.0.10. Validate a provider upgrade and mail delivery. |
| braces 3.0.3                                  | High            | No patched release is reported. Comes through Strapi's package-manager detection utilities.                                   |
| react-router 6.30.6                           | Moderate        | Fixes require >=7.18.0, incompatible with Strapi's declared v6 peers.                                                         |
| stream-json 1.9.1                             | Moderate        | Strapi data transfer uses v1; fixes require >=3.6.0 and an integration migration.                                             |
| uuid 8.0.0                                    | Moderate        | AWS SDK v2 uses v8; fix requires >=11.1.1. Migrate the R2 provider to AWS SDK v3.                                             |
| aws-sdk 2.1693.0                              | Low             | SDK v2 is unsupported and has no patched release for the reported region-validation issue. Migrate the R2 provider to SDK v3. |

The development middleware and package-manager tools are included because Strapi
ships its CLI in the production package. Audit membership alone does not establish
runtime exploitability. Do not expose the development server in production.

Advisories for the high findings:

- https://github.com/advisories/GHSA-g84c-rxfj-3j2c (webpack-dev-middleware)
- https://github.com/advisories/GHSA-v53p-9fqp-m79j (Nodemailer)
- https://github.com/advisories/GHSA-prgh-xp8r-p3m5 (Nodemailer)
- https://github.com/advisories/GHSA-vfj7-8cjw-p6xm (braces)

The existing R2 provider is preserved to retain storage keys (including numeric
folder paths), public URLs and compatibility with existing media records. Its
upload/delete behavior is tested against a local simulated S3 endpoint. Replacing
it needs validation against existing uploaded media, not only a successful build.

## Local validation

All checks used an isolated local Node 24.22.1 installation; the system-wide Node
installation was not changed.

- `pnpm test`: 8 passing tests. Real Strapi startup, SQLite migrations, admin
  initialization, API access controls, login rejection, authenticated blog
  create/read/delete, native Sharp encoding, R2 upload/delete against simulated S3.
- `NODE_ENV=production pnpm build`: passes with `ENV_PATH` pointing to a missing
  file, verifying the image build does not require a populated `.env`.
- Production startup with a separate SQLite database: health 204, admin HTML 200,
  admin JavaScript bundle 200, unauthenticated blog API 403.
- Docker cannot be executed locally because Docker is not installed. The PR
  workflow builds the image and checks its health endpoint after startup.
- Real PostgreSQL migrations, real R2 requests and outbound email are not tested
  here because their services/credentials are not available.

A local `.env` was generated with random secrets and SQLite configuration; it is
ignored by Git. Keep the existing production secrets when deploying this update.
Before deployment, validate migrations against a backup of the production
PostgreSQL database and verify existing media access.
