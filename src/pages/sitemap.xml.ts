import { loadPosts, tagCounts, feelingCounts, forms } from "../lib/posts";
import { u } from "../lib/site";

/** Written by hand rather than by an integration, so it lands at the
 *  /blog/sitemap.xml that robots.txt already points to. */
export async function GET(context: any) {
  const { LIVE, REVIEWS, NOTES } = await loadPosts();
  const abs = (path: string) => new URL(u(path), context.site).href;

  const urls = [
    ...["/", "reviews", "notebook", "tags", "about", "search"].map((p) => abs(p)),
    ...feelingCounts(REVIEWS).feels.map((f) => abs(`reviews/feel/${f}`)),
    ...forms(NOTES).map((f) => abs(`notebook/${f.toLowerCase()}`)),
    ...tagCounts(LIVE).tags.map((t) => abs(`tags/${t}`)),
    ...LIVE.map((p) => new URL(p.href, context.site).href),
  ];

  const lastmod = (url: string) => {
    const post = LIVE.find((p) => new URL(p.href, context.site).href === url);
    return post ? `<lastmod>${post.date}</lastmod>` : "";
  };

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((url) => `  <url><loc>${url}</loc>${lastmod(url)}</url>`).join("\n") +
    "\n</urlset>\n";

  return new Response(body, { headers: { "Content-Type": "application/xml" } });
}
