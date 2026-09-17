/**
 * Post bodies are Markdown, but only four shapes of it. Parsing them here
 * instead of running remark keeps the text byte-for-byte as written and
 * keeps the word count identical to the old single-file site.
 *
 * This is the exact inverse of the writer in scripts/migrate.mjs.
 */
export type BlockType = "p" | "q" | "v" | "vh";
export type Block = [BlockType, string];

const unescapeLead = (s: string) => (s.startsWith("\\") ? s.slice(1) : s);

export function parseBlocks(md: string): Block[] {
  const lines = md.split("\n");
  const out: Block[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    const fence = line.match(/^```(verse-hi|verse)\s*$/);
    if (fence) {
      const type: BlockType = fence[1] === "verse-hi" ? "vh" : "v";
      const buf: string[] = [];
      for (i++; i < lines.length && lines[i] !== "```"; i++) buf.push(lines[i]);
      out.push([type, buf.join("\n")]);
      continue;
    }
    out.push(line.startsWith("> ") ? ["q", unescapeLead(line.slice(2))] : ["p", unescapeLead(line)]);
  }
  return out;
}

export const wordCount = (body: Block[]) =>
  body.reduce((n, b) => n + String(b[1]).split(/\s+/).length, 0);

/** 190 words a minute, at least one. */
export const readingTime = (body: Block[]) => Math.max(1, Math.round(wordCount(body) / 190));
