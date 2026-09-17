/** Every route the site publishes, derived the same way the pages are. */
import { readdirSync, readFileSync } from "node:fs";

const ids = (dir: string) =>
  readdirSync(`src/content/${dir}`)
    .filter((f) => f.endsWith(".md"))
    .filter((f) => !/^draft:\s*true/m.test(readFileSync(`src/content/${dir}/${f}`, "utf8")))
    .map((f) => f.replace(/\.md$/, ""));

const frontmatterList = (dir: string, key: string) => {
  const found = new Set<string>();
  for (const f of readdirSync(`src/content/${dir}`).filter((f) => f.endsWith(".md"))) {
    const src = readFileSync(`src/content/${dir}/${f}`, "utf8");
    if (key === "feeling") [...src.matchAll(/feeling:\s*"([^"]+)"/g)].forEach((m) => found.add(m[1]));
    if (key === "form") [...src.matchAll(/^form:\s*"([^"]+)"/gm)].forEach((m) => found.add(m[1].toLowerCase()));
    if (key === "tags") {
      const line = src.match(/^tags:\s*\[(.*)\]/m);
      if (line) [...line[1].matchAll(/"([^"]+)"/g)].forEach((m) => found.add(m[1]));
    }
  }
  return [...found];
};

// Relative, so every route resolves against the /blog/ baseURL.
const ALL = [
  "",
  "reviews/",
  "notebook/",
  "tags/",
  "about/",
  "search/",
  "404.html",
  ...frontmatterList("reviews", "feeling").map((f) => `reviews/feel/${encodeURIComponent(f)}/`),
  ...frontmatterList("notebook", "form").map((f) => `notebook/${f}/`),
  ...[...frontmatterList("reviews", "tags"), ...frontmatterList("notebook", "tags")].map(
    (t) => `tags/${encodeURIComponent(t)}/`,
  ),
  ...ids("reviews").map((id) => `reviews/${id}/`),
  ...ids("notebook").map((id) => `notebook/${id}/`),
];

/** Tags appear in both collections, so the same page can be listed twice. */
export const ROUTES = [...new Set(ALL)];
