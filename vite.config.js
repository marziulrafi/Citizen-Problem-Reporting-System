import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendTarget = env.VITE_PROXY_TARGET || "http://127.0.0.1:5000";

  const proxyCommon = {
    target: backendTarget,
    changeOrigin: true,
    configure(proxy) {
      proxy.on("error", (err) => {
        console.error("[vite proxy → backend]", err.message);
      });
    },
  };

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        "/api": proxyCommon,
        "/uploads": proxyCommon,
      },
    },
  };
});
