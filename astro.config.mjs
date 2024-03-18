import { defineConfig } from "astro/config";
import autoImport from "./plugins/auto-import";
import path from "path";

const isProduction = import.meta.env.VITE_MODE == "production";

export default defineConfig({
  srcDir: "./",
  publicDir: "./.public",
  integrations: [
    autoImport({
      dts: "auto-imports.d.ts",
    }),
  ],
  output: "static",
  compressHTML: !isProduction,
  build: {
    format: isProduction ? "file" : "directory",
    assets: "assets",
  },
  vite: {
    build: {
      cssCodeSplit: false,
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          entryFileNames: "assets/script/app.[hash].js",
          assetFileNames: ({ name }) => {
            const { ext, dir, base } = path.parse(name);
            if (ext == ".css") {
              return path.join(dir, "assets/css", "app.[hash].css");
            } else if (
              ext == ".ttf" ||
              ext == ".otf" ||
              ext == ".woff" ||
              ext == ".woff2"
            ) {
              return "assets/fonts/[name].[ext]";
            } else if (ext == ".mp4" || ext == ".ogv" || ext == ".webm") {
              return "assets/videos/[name].[ext]";
            } else {
              return "assets/img/[name].[ext]";
            }
          },
        },
      },
    },
  },
});
