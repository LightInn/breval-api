module.exports = ({ env }) => {
  var ssl = env("S3_SSL", "false") === "true" ? "https://" : "http://";
  const s3url = new URL(ssl + env("S3_ENDPOINT"));
  return [
    "strapi::errors",
    {
      name: "strapi::security",
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            "connect-src": ["'self'", "https:"],
            "img-src": [
              "'self'",
              "data:",
              "blob:",
              env("S3_PUBLIC_ENDPOINT").replace(/^https?:\/\//, ""),
            ],
            "media-src": [
              "'self'",
              "data:",
              "blob:",
              env("S3_PUBLIC_ENDPOINT").replace(/^https?:\/\//, ""),
            ],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    "strapi::cors",
    "strapi::poweredBy",
    "strapi::logger",
    "strapi::query",
    "strapi::body",
    "strapi::session",
    "strapi::favicon",
    "strapi::public",
  ];
};

