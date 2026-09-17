import rss from "@astrojs/rss";
import { loadPosts } from "../lib/posts";
import { DESC, SITE } from "../lib/site";

export async function GET() {
  const { LIVE } = await loadPosts();
  return rss({
    title: "Aftertaste",
    description: DESC,
    site: SITE + "/",
    trailingSlash: true,
    items: LIVE.map((p) => ({
      title: p.cat === "Reviews" ? `${p.book} by ${p.author} — ${p.t}` : p.t,
      description: p.ex,
      pubDate: new Date(p.date + "T09:00:00Z"),
      link: p.href,
      categories: p.tags,
    })),
    customData: "<language>en</language>",
  });
}
