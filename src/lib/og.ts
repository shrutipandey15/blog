import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { EMO, coverBg, type Post } from "./posts";

// Read from the project root: this module is bundled before it runs, so a
// path relative to import.meta.url points at dist/ rather than at src/.
const font = (name: string) => readFileSync(join(process.cwd(), "src/assets/fonts", name));

const FONTS = [
  { name: "Fraunces", data: font("Fraunces-SemiBold.ttf"), weight: 600 as const, style: "normal" as const },
  { name: "Fraunces", data: font("Fraunces-Italic.ttf"), weight: 400 as const, style: "italic" as const },
  { name: "Courier Prime", data: font("CourierPrime-Regular.ttf"), weight: 400 as const, style: "normal" as const },
];

const CREAM = "#f3e7d3";
const CREAM2 = "#e3d2b8";

/** satori takes React elements; this builds them without needing JSX here. */
const el = (type: string, style: Record<string, any>, children: any = null) => ({
  type,
  props: { style: { display: "flex", ...style }, children },
});
const text = (content: string, style: Record<string, any>) => el("div", style, content);

function card(post: Post | null) {
  const isR = post?.cat === "Reviews";
  const bars = (post?.emo ?? []).filter((e) => EMO[e.feeling]);

  const headline = post
    ? isR
      ? post.book!
      : post.t
    : "aftertaste";
  const kicker = post ? (isR ? post.author! : `${post.form} · ${post.date.slice(0, 4)}`) : "opinions nobody asked for";
  const sub = post ? (isR ? post.t : post.ex) : "a book blog about what books do to you";

  return el(
    "div",
    {
      width: "1200px",
      height: "630px",
      background: post ? coverBg(post) : "#1b140f",
      padding: "44px",
      fontFamily: "Courier Prime",
    },
    [
      el(
        "div",
        {
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          border: `2px solid rgba(243,231,211,0.4)`,
          padding: "46px 56px",
        },
        [
          text("aftertaste", {
            fontFamily: "Fraunces",
            fontStyle: "italic",
            fontSize: "34px",
            color: CREAM,
          }),
          el("div", { flexDirection: "column" }, [
            text(headline, {
              fontFamily: "Fraunces",
              fontWeight: 600,
              fontSize: headline.length > 30 ? "62px" : "88px",
              lineHeight: 1.05,
              color: CREAM,
            }),
            text(kicker, {
              fontSize: "22px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: CREAM2,
              marginTop: "18px",
            }),
          ]),
          el("div", { flexDirection: "column" }, [
            text(sub, {
              fontFamily: "Fraunces",
              fontStyle: "italic",
              fontSize: "30px",
              lineHeight: 1.35,
              color: CREAM2,
              marginBottom: "22px",
            }),
            el(
              "div",
              { height: "12px", borderRadius: "999px", overflow: "hidden", gap: "3px" },
              bars.length
                ? bars.map((e) => el("div", { flexGrow: e.level, background: EMO[e.feeling] }))
                : [el("div", { flexGrow: 1, background: "#b8552e" })],
            ),
          ]),
        ],
      ),
    ],
  );
}

/** A 1200x630 PNG in the site's colours: the dominant feeling sets the ground. */
export async function ogImage(post: Post | null): Promise<Buffer> {
  const svg = await satori(card(post) as any, { width: 1200, height: 630, fonts: FONTS });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}
