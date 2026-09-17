import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: process.env.CI ? "list" : "line",
  use: { baseURL: "http://localhost:4321/blog/" },
  projects: [
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
  ],
  webServer: {
    command: "npm run build && npx astro preview --port 4321",
    url: "http://localhost:4321/blog/",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
