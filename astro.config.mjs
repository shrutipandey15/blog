// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://shrutipandey15.github.io",
  base: "/blog",
  trailingSlash: "always",
  build: { format: "directory" },
  // Post bodies are parsed by src/lib/blocks.ts, not by remark, so the
  // prose reaches the page byte-for-byte as it was written.
  markdown: { smartypants: false },
});
