import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { BACKENDS } from "./src/config/backends";

function buildProxyConfig(host: string) {
  return Object.fromEntries(
    BACKENDS.map((backend) => [
      `/backends/${backend.id}`,
      {
        target: `http://${host}:${backend.port}`,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(new RegExp(`^/backends/${backend.id}`), ""),
      },
    ]),
  );
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyHost = env.VITE_PROXY_TARGET_HOST || "localhost";

  return {
    plugins: [react()],
    server: {
      proxy: buildProxyConfig(proxyHost),
    },
    preview: {
      proxy: buildProxyConfig(proxyHost),
    },
  };
});
