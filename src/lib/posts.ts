import { getCollection } from "astro:content";
import EMO_JSON from "../data/emotions.json";
import { parseBlocks, readingTime, type Block } from "./blocks";
import { u } from "./site";

export const EMO: Record<string, string> = EMO_JSON;

export type Feeling = { feeling: string; level: number };

export type Post = {
  id: string;
  cat: "Reviews" | "Notebook";
  date: string;
  t: string;
  ex: string;
  tags: string[];
  emo: Feeling[];
  ask?: string;
  verdict?: string;
  book?: string;
  author?: string;
  form?: string;
  body: Block[];
  href: string;
  /** What this post is called in a link: the book for a review, the headline otherwise. */
  label: string;
  minutes: number;
};

function toPost(entry: any, cat: Post["cat"]): Post {
  const d = entry.data;
  const body = parseBlocks(entry.body ?? "");
  return {
    ...d,
    cat,
    body,
    href: u(`${cat === "Reviews" ? "reviews" : "notebook"}/${d.id}`),
    label: cat === "Reviews" ? d.book : d.title,
    t: d.title,
    ex: d.excerpt,
    minutes: readingTime(body),
  };
}

const byDateDesc = (a: Post, b: Post) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

/** Every published post, newest first. Drafts never leave this function. */
export async function loadPosts() {
  const reviews = (await getCollection("reviews")).map((e) => toPost(e, "Reviews"));
  const notebook = (await getCollection("notebook")).map((e) => toPost(e, "Notebook"));
  const live = [...reviews, ...notebook].filter((p) => !p.draft).sort(byDateDesc);
  return {
    LIVE: live,
    REVIEWS: live.filter((p) => p.cat === "Reviews"),
    NOTES: live.filter((p) => p.cat === "Notebook"),
  };
}

/** How many reviews left each feeling behind, loudest-used first. */
export function feelingCounts(reviews: Post[]) {
  const counts: Record<string, number> = {};
  reviews.forEach((p) => p.emo.forEach(({ feeling }) => (counts[feeling] = (counts[feeling] || 0) + 1)));
  const feels = Object.keys(counts)
    .filter((e) => EMO[e])
    .sort((a, b) => counts[b] - counts[a]);
  return { counts, feels };
}

export const forms = (notes: Post[]) => [...new Set(notes.map((p) => p.form as string))];

export function tagCounts(live: Post[]) {
  const m: Record<string, number> = {};
  live.forEach((p) => p.tags.forEach((t) => (m[t] = (m[t] || 0) + 1)));
  const tags = Object.keys(m).sort((a, b) => m[b] - m[a] || a.localeCompare(b));
  return { counts: m, tags };
}

/* ---------- colour ---------- */

/** Mix a feeling's colour towards the page background. */
export function darken(hex: string, t: number) {
  const n = parseInt(hex.slice(1), 16);
  const base = [27, 20, 15];
  return (
    "rgb(" +
    [(n >> 16) & 255, (n >> 8) & 255, n & 255]
      .map((v, i) => Math.round(v * (1 - t) + base[i] * t))
      .join(",") +
    ")"
  );
}

export const dom = (p: Post) => (p.emo.length && EMO[p.emo[0].feeling] ? p.emo[0].feeling : null);
export const coverBg = (p: Post) => {
  const d = dom(p);
  return d ? darken(EMO[d], 0.45) : "#2d3438";
};
export const tint = (p: Post) => {
  const d = dom(p);
  return d ? EMO[d] : "var(--accent)";
};

/* ---------- neighbours ---------- */

/** Two posts that share the most with this one: feelings for reviews, tags
 *  for the notebook. Ties break towards the newer post. */
export function related(p: Post, pool: Post[]) {
  const isR = p.cat === "Reviews";
  const mine = isR ? p.emo.map((e) => e.feeling) : p.tags;
  return pool
    .filter((x) => x.id !== p.id)
    .map((x, i) => ({
      x,
      i,
      shared: (isR ? x.emo.map((e) => e.feeling) : x.tags).filter((v) => mine.includes(v)),
    }))
    .sort((a, b) => b.shared.length - a.shared.length || a.i - b.i)
    .slice(0, 2)
    .map(({ x, shared }) => ({
      post: x,
      why: shared.length
        ? (isR ? "also left behind: " : "also about: ") + shared.slice(0, 2).join(", ")
        : "from the same notebook",
    }));
}

/** Newer and older within the same section. */
export function neighbours(p: Post, list: Post[]) {
  const i = list.findIndex((x) => x.id === p.id);
  return { newer: list[i - 1], older: list[i + 1] };
}

/** The squiggle under a heading, drawn to a given width. */
export function squigglePath(w: number) {
  let d = "M3 7 Q 13 1 23 7";
  for (let x = 43; x <= w - 3; x += 20) d += " T " + x + " 7";
  return d;
}
