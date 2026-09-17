// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://shrutipandey15.github.io",
  base: "/blog",
  trailingSlash: "always",
  // The whole stylesheet is small; inlining it removes the last
  // render-blocking request.
  build: { format: "directory", inlineStylesheets: "always" },
  // Post bodies are parsed by src/lib/blocks.ts, not by remark, so the
  // prose reaches the page byte-for-byte as it was written.
  markdown: { smartypants: false },
});
