import adapter from "@sveltejs/adapter-node";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    alias: {
      "@db/cliente": "./src/generated/prisma/client",
    },
    csrf: { trustedOrigins: ['*'] }
  },
};

export default config;
