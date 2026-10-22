const { spawn } = require("node:child_process");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const net = require("node:net");
const http = require("node:http");
const request = require("supertest");

jest.setTimeout(120000);

let server;
let api;
let directory;
let output = "";

async function freePort() {
  const socket = net.createServer();
  await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
  const { port } = socket.address();
  await new Promise((resolve) => socket.close(resolve));
  return port;
}

beforeAll(async () => {
  directory = mkdtempSync(path.join(tmpdir(), "breval-api-test-"));
  const port = await freePort();
  api = request(`http://127.0.0.1:${port}`);
  server = spawn(
    process.execPath,
    [
      path.join(
        path.dirname(require.resolve("@strapi/strapi/package.json")),
        "bin/strapi.js",
      ),
      "start",
    ],
    {
      cwd: path.resolve(__dirname, ".."),
      env: {
        ...process.env,
        NODE_ENV: "test",
        HOST: "127.0.0.1",
        PORT: String(port),
        DATABASE_FILENAME: path.join(directory, "test.db"),
        APP_KEYS: "test-app-key-1,test-app-key-2",
        API_TOKEN_SALT: "test-api-token-salt",
        ADMIN_JWT_SECRET: "test-admin-jwt-secret",
        JWT_SECRET: "test-jwt-secret",
        TRANSFER_TOKEN_SALT: "test-transfer-token-salt",
        ENCRYPTION_KEY: "test-encryption-key",
        S3_ENDPOINT: "http://127.0.0.1:9000",
        S3_PUBLIC_ENDPOINT: "127.0.0.1:9000",
        S3_BUCKET: "test",
        S3_ACCESS_KEY_ID: "test",
        S3_ACCESS_SECRET: "test-secret",
        S3_SSL: "false",
        STRAPI_TELEMETRY_DISABLED: "true",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout.on("data", (data) => {
    output += data;
  });
  server.stderr.on("data", (data) => {
    output += data;
  });
  let spawnError;
  server.on("error", (error) => {
    spawnError = error;
  });
  const deadline = Date.now() + 100000;
  while (Date.now() < deadline) {
    if (spawnError) throw spawnError;
    if (server.exitCode !== null) throw new Error(`Strapi exited: ${output}`);
    try {
      const response = await api.get("/_health").timeout(2000);
      if (response.status === 204) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Strapi startup timed out: ${output}`);
});

afterAll(async () => {
  if (server && server.exitCode === null) {
    const stopped = new Promise((resolve) => server.once("exit", resolve));
    server.kill();
    await stopped;
  }
  if (directory) rmSync(directory, { recursive: true, force: true });
});

test("Strapi starts with an isolated SQLite database", async () => {
  await api.get("/_health").expect(204);
});

test("admin initializes on a fresh database", async () => {
  const response = await api.get("/admin/init").expect(200);
  expect(response.body.data.hasAdmin).toBe(false);
});

test.each(["blogs", "projets"])(
  "%s remains protected without authentication",
  async (collection) => {
    const response = await api.get(`/api/${collection}`).expect(403);
    expect(response.body.error.name).toBe("ForbiddenError");
  },
);

test("invalid user credentials are rejected", async () => {
  await api
    .post("/api/auth/local")
    .send({
      identifier: "missing@example.invalid",
      password: "invalid-password",
    })
    .expect(400);
});

test("admin can create, read and delete a blog document", async () => {
  const registration = await api
    .post("/admin/register-admin")
    .send({
      firstname: "Local",
      lastname: "Test",
      email: "admin@example.invalid",
      password: "Local-Test-Password-123!",
    })
    .expect(200);
  const token = registration.body.data.token;
  expect(token).toEqual(expect.any(String));
  const collection = "/content-manager/collection-types/api::blog.blog";
  const created = await api
    .post(collection)
    .auth(token, { type: "bearer" })
    .send({
      title: "Node 24 upgrade test",
      content: "Integration test document",
    })
    .expect(201);
  const documentId = created.body.data.documentId;
  expect(documentId).toEqual(expect.any(String));
  const read = await api
    .get(`${collection}/${documentId}`)
    .auth(token, { type: "bearer" })
    .expect(200);
  expect(read.body.data.title).toBe("Node 24 upgrade test");
  await api
    .delete(`${collection}/${documentId}`)
    .auth(token, { type: "bearer" })
    .expect(200);
  await api
    .get(`${collection}/${documentId}`)
    .auth(token, { type: "bearer" })
    .expect(404);
});

test("sharp can encode an image with its native binary", async () => {
  const sharp = require("sharp");
  const image = await sharp({
    create: { width: 2, height: 2, channels: 3, background: "#ffffff" },
  })
    .png()
    .toBuffer();
  expect((await sharp(image).metadata()).format).toBe("png");
});

test("R2 provider preserves folder keys and public URLs on upload and delete", async () => {
  const operations = [];
  const storage = http.createServer((req, res) => {
    operations.push({ method: req.method, url: req.url });
    req.resume();
    req.on("end", () => {
      res.setHeader("ETag", '"local-test"');
      res.end();
    });
  });
  await new Promise((resolve) => storage.listen(0, "127.0.0.1", resolve));
  try {
    const provider = require("strapi-provider-cloudflare-r2").init({
      endpoint: `http://127.0.0.1:${storage.address().port}`,
      accessKeyId: "test-key",
      secretAccessKey: "test-secret",
      region: "auto",
      s3ForcePathStyle: true,
      params: { Bucket: "test-bucket" },
      cloudflarePublicAccessUrl: "https://media.example.invalid",
    });
    const file = {
      hash: "smoke",
      ext: ".txt",
      mime: "text/plain",
      folderPath: "/1",
      buffer: Buffer.from("test"),
    };
    await provider.upload(file);
    expect(file.url).toBe("https://media.example.invalid/1/smoke.txt");
    await provider.delete(file);
    expect(operations).toEqual([
      { method: "PUT", url: "/test-bucket/1/smoke.txt" },
      { method: "DELETE", url: "/test-bucket/1/smoke.txt" },
    ]);
  } finally {
    await new Promise((resolve) => storage.close(resolve));
  }
});
