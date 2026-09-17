#!/usr/bin/env node
/**
 * Cuts the self-hosted fonts down to what the built site actually renders.
 *
 * Two things make the difference: subsetting to the characters used, and
 * pinning each @font-face to its own weight, which drops the variable-font
 * machinery that Caveat and Fraunces otherwise carry. Untouched, the fonts
 * are the entire loading cost of the site.
 *
 * Runs after `astro build`, over dist/ only, so the whole files in
 * public/fonts/ still serve `astro dev`.
 *
 * Run:  node scripts/subset-fonts.mjs
 */
import { readFileSync, writeFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import subsetFont from "subset-font";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const FONT_DIR = join(DIST, "fonts");

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...htmlFiles(path));
    else if (name.endsWith(".html")) out.push(path);
  }
  return out;
}

const pages = htmlFiles(DIST);
if (!pages.length) throw new Error("No HTML in dist/. Run `astro build` first.");

/* Every character in the markup, not only the text nodes: the extra ASCII
   costs nothing and it cannot miss a glyph this way. */
const chars = new Set("  ");
for (const page of pages) for (const ch of readFileSync(page, "utf8")) chars.add(ch);
const text = [...chars].join("");

/* The stylesheet is inlined into every page, so read the rules from one and
   apply the result to all of them. */
const FACE = /@font-face\s*\{[^}]*\}/g;
const field = (rule, name) => (rule.match(new RegExp(`font-${name}:\\s*([^;}]+)`)) ?? [])[1]?.trim();

const jobs = new Map(); // original rule text -> replacement rule text
const built = new Map(); // "file@weight" -> subset filename
let before = 0;
let after = 0;

for (const rule of readFileSync(pages[0], "utf8").match(FACE) ?? []) {
  const src = rule.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
  if (!src?.includes("/fonts/")) continue;

  const file = src.split("/").pop();
  const weight = Number(field(rule, "weight")) || 400;
  const key = `${file}@${weight}`;

  if (!built.has(key)) {
    const original = readFileSync(join(FONT_DIR, file));
    // Static fonts have no wght axis to pin; harfbuzz throws rather than
    // shrugging, so fall back to subsetting alone.
    const subset = await subsetFont(original, text, { targetFormat: "woff2", variationAxes: { wght: weight } }).catch(
      () => subsetFont(original, text, { targetFormat: "woff2" }),
    );
    const hash = createHash("sha256").update(subset).digest("hex").slice(0, 8);
    const name = file.replace(/-[0-9a-f]{8}\.woff2$/, `-${weight}-${hash}.woff2`);

    writeFileSync(join(FONT_DIR, name), subset);
    built.set(key, name);
    before += original.length;
    after += subset.length;
  }

  jobs.set(rule, rule.replace(file, built.get(key)));
}

/* Drop the originals: every rule now points at a subset. */
const kept = new Set(built.values());
for (const file of readdirSync(FONT_DIR)) if (!kept.has(file)) rmSync(join(FONT_DIR, file));

for (const page of pages) {
  let html = readFileSync(page, "utf8");
  let touched = false;
  for (const [from, to] of jobs) {
    if (html.includes(from)) {
      html = html.split(from).join(to);
      touched = true;
    }
  }
  if (touched) writeFileSync(page, html);
}

const kb = (n) => Math.round(n / 1024) + "KB";
console.log(
  `subset ${built.size} font file(s) from ${jobs.size} rule(s): ${kb(before)} -> ${kb(after)}, ${chars.size} distinct characters`,
);
