#!/usr/bin/env node
/**
 * Migrates the content block of the old single-file index.html into
 * Markdown files + JSON data. Re-runnable: it overwrites what it wrote.
 *
 * Run:  node scripts/migrate.mjs [--source legacy/index.html]
 *
 * After writing, it parses every generated file back into the original
 * [type, text] block form and diffs it against the source arrays. Any
 * difference is a hard failure.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const argSource = process.argv.indexOf("--source");
const SOURCE = argSource > -1 ? process.argv[argSource + 1] : firstExisting(["index.html", "legacy/index.html"]);

function firstExisting(paths) {
  const hit = paths.find((p) => existsSync(join(ROOT, p)));
  if (!hit) throw new Error(`No source found. Looked for: ${paths.join(", ")}`);
  return hit;
}

/* ---------- 1. pull the content block out of index.html ---------- */

function extract(html) {
  const down = html.indexOf("▼▼▼");
  const up = html.indexOf("▲▲▲");
  if (down < 0 || up < 0) throw new Error("Could not find the EDIT/STOP EDITING markers.");
  const start = html.indexOf("*/", down) + 2;          // past the end of the banner comment
  const end = html.lastIndexOf("/*", up);              // before the STOP EDITING comment
  return html.slice(start, end);
}

const src = extract(readFileSync(join(ROOT, SOURCE), "utf8"));
const { CURRENT, EMO, POSTS } = new Function(`${src}; return { CURRENT, EMO, POSTS };`)();

/* ---------- 2. body blocks -> Markdown ---------- */

const FENCE = { v: "verse", vh: "verse-hi" };

// A leading character that Markdown would read as structure rather than text.
const LEADING = /^(\s*)([>#|`~*+-]|\d+[.)])/;
const escapeLead = (s) => (LEADING.test(s) ? "\\" + s : s);
const unescapeLead = (s) => (s.startsWith("\\") ? s.slice(1) : s);

function blockToMd([type, text]) {
  if (type === "v" || type === "vh") {
    if (text.includes("```")) throw new Error(`Verse block contains a code fence: ${text.slice(0, 40)}`);
    return "```" + FENCE[type] + "\n" + text + "\n```";
  }
  if (text.includes("\n")) throw new Error(`Multi-line "${type}" block, which Markdown cannot round-trip as one paragraph: ${text.slice(0, 60)}`);
  return type === "q" ? "> " + escapeLead(text) : escapeLead(text);
}

const bodyToMd = (body) => body.map(blockToMd).join("\n\n");

/* ---------- 3. Markdown -> body blocks (the check reads this back) ---------- */

function mdToBlocks(md) {
  const lines = md.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    const fence = line.match(/^```(verse-hi|verse)\s*$/);
    if (fence) {
      const type = fence[1] === "verse-hi" ? "vh" : "v";
      const buf = [];
      for (i++; i < lines.length && lines[i] !== "```"; i++) buf.push(lines[i]);
      out.push([type, buf.join("\n")]);
      continue;
    }
    out.push(line.startsWith("> ") ? ["q", unescapeLead(line.slice(2))] : ["p", unescapeLead(line)]);
  }
  return out;
}

/* ---------- 4. frontmatter ---------- */

// JSON strings are valid YAML double-quoted scalars, so this quotes exactly.
const y = (v) => JSON.stringify(v);
const yList = (a) => (a.length ? "[" + a.map(y).join(", ") + "]" : "[]");

function frontmatter(p) {
  const isReview = p.cat === "Reviews";
  const rows = [
    ["id", y(p.id)],
    ["date", y(p.date)],
    ["title", y(p.t)],
    ["excerpt", y(p.ex ?? "")],
  ];
  if (isReview) {
    rows.push(["book", y(p.book)], ["author", y(p.author)]);
    if (p.isbn) rows.push(["isbn", y(p.isbn)]);
  } else {
    rows.push(["form", y(p.form)]);
  }
  rows.push(["tags", yList(p.tags ?? [])]);

  const emo = (p.emo ?? []).map(([feeling, level]) => `  - { feeling: ${y(feeling)}, level: ${level} }`);
  rows.push(["emo", emo.length ? "\n" + emo.join("\n") : "[]"]);

  if (isReview && p.verdict) rows.push(["verdict", y(p.verdict)]);
  if (p.ask) rows.push(["ask", y(p.ask)]);
  rows.push(["draft", p.draft === true ? "true" : "false"]);

  return "---\n" + rows.map(([k, v]) => `${k}:${v.startsWith("\n") ? v : " " + v}`).join("\n") + "\n---\n";
}

/* ---------- 5. write ---------- */

const DIRS = { Reviews: "src/content/reviews", Notebook: "src/content/notebook" };
for (const dir of Object.values(DIRS)) {
  rmSync(join(ROOT, dir), { recursive: true, force: true });
  mkdirSync(join(ROOT, dir), { recursive: true });
}
mkdirSync(join(ROOT, "src/data"), { recursive: true });

const written = [];
for (const p of POSTS) {
  const dir = DIRS[p.cat];
  if (!dir) throw new Error(`Post "${p.id}" has an unknown cat: ${JSON.stringify(p.cat)}`);
  const file = join(dir, `${p.id}.md`);
  writeFileSync(join(ROOT, file), frontmatter(p) + "\n" + bodyToMd(p.body) + "\n");
  written.push({ post: p, file });
}

writeFileSync(join(ROOT, "src/data/emotions.json"), JSON.stringify(EMO, null, 2) + "\n");
writeFileSync(join(ROOT, "src/data/current.json"), JSON.stringify(CURRENT, null, 2) + "\n");

/* ---------- 6. check ---------- */

const problems = [];
const note = (id, msg) => problems.push(`${id}: ${msg}`);

for (const { post, file } of written) {
  const raw = readFileSync(join(ROOT, file), "utf8");
  const body = raw.slice(raw.indexOf("\n---\n") + 5);
  const back = mdToBlocks(body);

  if (back.length !== post.body.length) {
    note(post.id, `block count ${back.length} != ${post.body.length}`);
    continue;
  }
  post.body.forEach(([type, text], i) => {
    if (back[i][0] !== type) note(post.id, `block ${i}: type ${back[i][0]} != ${type}`);
    if (back[i][1] !== text) note(post.id, `block ${i}: text differs\n    was: ${JSON.stringify(text.slice(0, 70))}\n    now: ${JSON.stringify(back[i][1].slice(0, 70))}`);
  });

  // Frontmatter fields that carry prose must survive verbatim too.
  const fm = raw.slice(4, raw.indexOf("\n---\n"));
  for (const [key, value] of [["title", post.t], ["excerpt", post.ex ?? ""], ["verdict", post.verdict], ["ask", post.ask], ["book", post.book], ["author", post.author]]) {
    if (!value) continue; // "" means absent, exactly as the old renderer treated it
    if (!fm.includes(`${key}: ${JSON.stringify(value)}`)) note(post.id, `frontmatter "${key}" not written verbatim`);
  }
}

const counts = { Reviews: 0, Notebook: 0 };
POSTS.forEach((p) => counts[p.cat]++);
if (counts.Reviews !== 7) note("TOTAL", `expected 7 reviews, found ${counts.Reviews}`);
if (counts.Notebook !== 11) note("TOTAL", `expected 11 notebook pieces, found ${counts.Notebook}`);

const ids = POSTS.map((p) => p.id);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length) note("TOTAL", `duplicate ids: ${dupes.join(", ")}`);

/* Characters that a Markdown renderer treats as formatting mid-line. Not a
   failure — a list of places to eyeball once pages render. */
const inline = [];
for (const p of POSTS) {
  const hits = p.body.flatMap(([t, x]) => (t === "v" || t === "vh" ? [] : (x.match(/[*_`~[\]<>]/g) ?? [])));
  if (hits.length) inline.push(`${p.id}: ${hits.length} (${[...new Set(hits)].join(" ")})`);
}

/* ---------- 7. report ---------- */

const words = (p) => p.body.reduce((n, b) => n + String(b[1]).split(/\s+/).length, 0);
const blockTypes = {};
POSTS.forEach((p) => p.body.forEach(([t]) => (blockTypes[t] = (blockTypes[t] || 0) + 1)));

console.log(`source            ${SOURCE}`);
console.log(`reviews           ${counts.Reviews}  ->  src/content/reviews/`);
console.log(`notebook          ${counts.Notebook}  ->  src/content/notebook/`);
console.log(`drafts            ${POSTS.filter((p) => p.draft).length}`);
console.log(`feelings          ${Object.keys(EMO).length}  ->  src/data/emotions.json`);
console.log(`nightstand        ${CURRENT ? CURRENT.book : "(none)"}  ->  src/data/current.json`);
console.log(`blocks            ${Object.entries(blockTypes).map(([t, n]) => `${t}:${n}`).join("  ")}`);
console.log(`words             ${POSTS.reduce((n, p) => n + words(p), 0)}`);
console.log("");
console.log("text check        every block and every prose field re-parsed from the .md and compared to the source");
if (problems.length) {
  console.log(`FAILED            ${problems.length} difference(s):`);
  problems.forEach((p) => console.log("  - " + p));
} else {
  console.log(`PASSED            ${written.reduce((n, w) => n + w.post.body.length, 0)} blocks identical, 0 differences`);
}
if (inline.length) {
  console.log("");
  console.log("to eyeball once pages render — prose containing Markdown-active characters:");
  inline.forEach((l) => console.log("  - " + l));
}

process.exit(problems.length ? 1 : 0);
