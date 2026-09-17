<div align="center">

# aftertaste

**opinions nobody asked for**

A book blog that scores what a book *did to you* instead of giving it stars.
Reviews, thoughts, poems and the odd short story, in English and Hindi.

[**Read it →**](https://shrutipandey15.github.io/blog/) &nbsp;·&nbsp; [About](https://shrutipandey15.github.io/blog/#/about) &nbsp;·&nbsp; [Bibliome](https://bibliome.app)

</div>

---

## Contents

- [Why](#why)
- [Features](#features)
- [How it's built](#how-its-built)
- [Running it locally](#running-it-locally)
- [Writing a post](#writing-a-post)
- [Content reference](#content-reference)
- [Customising](#customising)
- [URLs](#urls)
- [Deploying](#deploying)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contact](#contact)

## Why

Three stars can mean *bored* or *wrecked and annoyed about being wrecked*, and
those are not the same afternoon. So every review here is scored on which
feelings showed up and how loud they were, from 1 to 5. A book can be a five on
rage and still be the best thing that happened that month.

## Features

- **Feeling-based reviews.** Each review carries up to a few emotions with an
  intensity. The strongest one colours the book's cover; all of them make up the
  colour band under it.
- **Browse by feeling.** Tap any emotion to see every book that left it behind.
- **Notebook.** Thoughts, poems and stories, filterable by kind. Hindi verse is
  set in Noto Serif Devanagari.
- **Post pages** with reading time, an emotion meter, pull quotes, verse on
  paper slips, the one-line verdict, a question for the reader, tags, related
  posts and newer/older links.
- **Tags and search** across every post, including the full text.
- **Drafts** that stay in the file but never appear on the site.
- **Remembers your place.** Going back from a post returns you to where you were
  on the list.
- **Motion that stays quiet.** Fireflies, a falling leaf, a shimmering wordmark
  and gentle reveals. All of it switches off for anyone with *reduce motion*
  enabled.
- **Accessible by default.** Keyboard focus is visible, there's a skip link,
  every control is a real link or input, and colours meet contrast guidelines.
- **Fails loudly, not blank.** A typo in the content shows a message with the
  line number instead of an empty page.

## How it's built

One self-contained `index.html`. No framework, no build step, no dependencies,
no tracking.

| Piece | What it does |
| --- | --- |
| Content block | Plain JavaScript arrays (`POSTS`, `EMO`, `CURRENT`) at the top of the script |
| Router | Hash-based (`#/post/tfios`), so it works on GitHub Pages with no server config |
| Rendering | Small template functions; every piece of content is HTML-escaped |
| Styles | Inline CSS with custom properties for the palette |
| Fonts | Fraunces, Caveat, Courier Prime and Noto Serif Devanagari from Google Fonts |
| Security | A Content-Security-Policy meta tag that only allows the page itself and Google Fonts |

```
blog/
├── index.html   # the whole site: content, styles and logic
├── robots.txt
└── Readme.md
```

## Running it locally

Double-click `index.html`. That's it. Everything except the fonts works offline.

If you'd rather serve it (closer to how Pages behaves):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Writing a post

1. Open `index.html` (on github.com, click the pencil icon).
2. Find the block between these markers:
   ```
   ▼▼▼  EDIT EVERYTHING BETWEEN HERE AND "STOP EDITING"  ▼▼▼
   ▲▲▲  STOP EDITING. Design and logic below.  ▲▲▲
   ```
3. Copy an existing post in `POSTS`, paste it at the top of the list and rewrite
   it. Posts are sorted by `date`, so their order in the file doesn't matter.
4. Commit. The post is live in about a minute.

To hold a post back, add `draft: true,` to it.

## Content reference

### Review

```js
{
  id: "piranesi",
  cat: "Reviews",
  date: "2026-09-20",
  book: "Piranesi",
  author: "Susanna Clarke",
  t: "The headline.",
  ex: "One or two lines that make someone click.",
  tags: ["fantasy", "rereads"],
  emo: [["longing", 5], ["comfort", 3]],
  verdict: "The one thing the book left behind.",
  ask: "A question for the reader.",
  body: [
    ["p", "A paragraph."],
    ["q", "A line pulled out large."],
    ["v", "A verse,\nline by line."],
  ],
},
```

### Notebook piece

```js
{
  id: "marginalia",
  cat: "Notebook",
  form: "Poem",
  date: "2026-07-08",
  t: "Marginalia",
  ex: "A line for the card.",
  tags: ["grief", "original"],
  emo: [],
  ask: "Optional question for the reader.",
  body: [["v", "Someone underlined this before me\n…"]],
},
```

### Fields

| Field | Used in | Notes |
| --- | --- | --- |
| `id` | both | Unique. Becomes the link: `#/post/<id>`. Don't change it once published, or old links break. |
| `cat` | both | `"Reviews"` or `"Notebook"` |
| `form` | notebook | `"Thought"`, `"Poem"` or `"Story"` |
| `date` | both | `YYYY-MM-DD` |
| `book`, `author` | reviews | Shown on the cover |
| `t` | both | Headline |
| `ex` | both | Short excerpt for cards, search results and link previews |
| `tags` | both | Free-form; each gets its own page |
| `emo` | reviews | `[feeling, 1–5]` pairs. The first pair colours the cover. Use `[]` for notebook pieces. |
| `verdict` | reviews | Optional. Shown as "the aftertaste" |
| `ask` | both | Optional. Shown as "over to you" |
| `draft` | both | Optional. `true` hides the post |
| `body` | both | A list of blocks, below |

### Body blocks

| Type | Renders as |
| --- | --- |
| `["p", "…"]` | Paragraph |
| `["q", "…"]` | Large pull quote, tinted by the post's main feeling |
| `["v", "…"]` | Verse on a paper slip; `\n` starts a new line |
| `["vh", "…"]` | Hindi verse, set in Noto Serif Devanagari |

## Customising

**What you're reading.** Edit `CURRENT`. `pct` is how far in you are, `note` is
the feeling so far, and `cover` is the short title on the little cover. Set it to
`null` to hide the nightstand.

**Feelings.** `EMO` maps each feeling to a colour. Only feelings used in at least
one review appear as filters.

```js
const EMO = {
  ache: "#B65C3F",
  grief: "#6A7DA3",
  // …
};
```

**Palette.** The colours live in `:root` at the top of the `<style>` block
(`--card`, `--accent`, `--gold`, `--cream` and so on). Change them there and the
whole site follows.

## URLs

| Address | Page |
| --- | --- |
| `#/` | Home |
| `#/reviews` | All reviews |
| `#/reviews/feel/<feeling>` | Reviews that left a feeling behind |
| `#/notebook` | All notebook pieces |
| `#/notebook/<thought\|poem\|story>` | One kind |
| `#/post/<id>` | A single post |
| `#/tags`, `#/tag/<tag>` | Tags |
| `#/search/<words>` | Search |
| `#/about` | About |

Links from the previous version keep working: `#/log` goes home, `#/index` and
`#/archive/…` go to Reviews, and trailing `/page/<n>` is ignored.

## Deploying

The site is served by GitHub Pages from the root of the `master` branch
(**Settings → Pages**). Any commit to `index.html` goes live in about a minute.
There's nothing to build.

## Troubleshooting

**The page says "This page could not be built".** The message includes the
error and line number. It's almost always a missing comma, bracket or quote in
the post you last edited. Fix it, or revert that commit.

**A post isn't showing.** Check that it doesn't have `draft: true`, that `cat` is
spelled exactly `"Reviews"` or `"Notebook"`, and that its `id` is unique.

**Fonts look plain.** Google Fonts didn't load (offline, or blocked). The site
falls back to Georgia and Courier.

**Link previews show the site title instead of the post.** Known limitation:
WhatsApp and Instagram don't run JavaScript, so they only see the default tags.
Fixed by the static rebuild on the roadmap.

## Roadmap

- [ ] Move content into Markdown files and rebuild as a static site with Astro,
      with real URLs and per-post link previews
- [ ] Book covers fetched automatically from Open Library
- [ ] A phone-friendly writing desk, self-hosted, that commits new posts to this
      repo
- [ ] Email subscriptions from an RSS feed (currently a pre-filled email)

## Contact

No comment box, on purpose. If you want to argue about a book,
[email me](mailto:shrutipandey1505@gmail.com). I read all of them and answer
most.

— Shruti
