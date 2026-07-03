import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

const packageJson = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8"),
) as { version: string };

// https://vite.dev/config/
export default defineConfig({
  plugins: [solid()],
  // GitHub Pages 프로젝트 사이트: https://<user>.github.io/shotKey/
  base: "/shotKey/",
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_BUILD_DATE__: JSON.stringify(
      new Date().toISOString().slice(0, 10),
    ),
  },
});
