export const SITE = "https://shrutipandey15.github.io/blog";
export const MAIL = "shrutipandey1505@gmail.com";

export const TITLE = "Aftertaste — a book blog about what books do to you";
export const DESC =
  "Book reviews scored on feeling instead of stars, plus thoughts, poems and short stories.";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Join a site-root path onto the /blog base, always with a trailing slash. */
export function u(path = "/"): string {
  const parts = String(path).split("/").filter(Boolean).map(encodeURIComponent);
  return BASE + "/" + (parts.length ? parts.join("/") + "/" : "");
}

export const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmt = (d: string) => {
  const [, m, dd] = d.split("-");
  return +dd + " " + MON[+m - 1];
};
export const fmtFull = (d: string) => fmt(d) + " " + d.slice(0, 4);

/* Card decoration, lifted from the old file so the shuffle is unchanged. */
export const TILT = [-1.4, 1.1, 0.9, -1, 1.3, -0.8];
export const NTILT = [-1.2, 1, -0.6, 1.4, -1.6, 0.7];
export const TAPES = ["rgba(184,85,46,.7)", "rgba(143,154,120,.8)", "rgba(239,227,204,.85)"];
export const PAPER: Record<string, string> = {
  Thought: "var(--paper)",
  Poem: "var(--rose)",
  Story: "var(--kraft)",
};
