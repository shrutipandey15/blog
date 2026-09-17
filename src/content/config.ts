import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/** A feeling and how loud it was. The first entry is the dominant one: it
 *  colours the cover, the pull quotes and the OG image. */
const emo = z.array(
  z.object({
    feeling: z.string(),
    level: z.number().int().min(1).max(5),
  }),
);

const shared = {
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  title: z.string(),
  excerpt: z.string(),
  tags: z.array(z.string()).default([]),
  emo: emo.default([]),
  ask: z.string().optional(),
  draft: z.boolean().default(false),
};

const reviews = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/reviews" }),
  schema: z.object({
    ...shared,
    book: z.string(),
    author: z.string(),
    verdict: z.string().optional(),
  }),
});

const notebook = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/notebook" }),
  schema: z.object({
    ...shared,
    form: z.enum(["Thought", "Poem", "Story"]),
  }),
});

export const collections = { reviews, notebook };
