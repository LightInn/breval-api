module.exports = ({ env }) => ({
  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET"),
    },
  },

  // ...

  upload: {
    config: {
      provider: "strapi-provider-cloudflare-r2",
      providerOptions: {
        endpoint: env("S3_ENDPOINT"), //s3.example.com
        port: 443, // parseInt(env("S3_PORT"), 9000), //9000
        useSSL: env("S3_SSL", false) === "true", //true or false
        accessKeyId: env("S3_ACCESS_KEY_ID"),
        secretAccessKey: env("S3_ACCESS_SECRET"),
        params: {
          Bucket: env("S3_BUCKET"),
        },
        cloudflarePublicAccessUrl: env("S3_PUBLIC_ENDPOINT"),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },

  // ...
});
