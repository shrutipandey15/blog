import { test, expect } from "@playwright/test";
import { ROUTES } from "./routes";

for (const route of ROUTES) {
  test(`${route} renders without console errors`, async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
    page.on("pageerror", (e) => problems.push(e.message));

    const response = await page.goto(route);
    // 404.html is served as a file here; every other route must be a 200.
    if (!route.endsWith("404.html")) expect(response?.status(), `status for ${route}`).toBe(200);

    await expect(page.locator("h1, h2.hand").first()).toBeVisible();
    await expect(page.locator("a.skip")).toHaveAttribute("href", "#app");
    expect(problems, `console errors on ${route}`).toEqual([]);
  });
}

test("an old hash link lands on the real post URL", async ({ page }) => {
  await page.goto("#/post/tfios");
  await page.waitForURL("**/blog/reviews/tfios/");
  await expect(page.locator("h1")).toContainText("I hate this book");
});

test("the footer search form reaches the search page without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("reviews/");
  await page.fill("#q", "grief");
  await page.press("#q", "Enter");
  await page.waitForURL("**/blog/search/?q=grief");
  await context.close();
});
