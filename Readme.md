<div align="center">

# aftertaste

**opinions nobody asked for**

A book blog that scores what a book *did to you* instead of giving it stars.
Reviews, thoughts, poems and the odd short story, in English and Hindi.

[**Read it →**](https://shrutipandey15.github.io/blog/) &nbsp;·&nbsp; [About](https://shrutipandey15.github.io/blog/about/) &nbsp;·&nbsp; [Bibliome](https://bibliome.app)

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
- **Real link previews.** Every page carries its own title, description and
  OpenGraph tags in the HTML, plus a generated share image in the book's
  colours. WhatsApp and Instagram show the post, not the site name.
- **Tags and search** across every post, including the full text.
- **An RSS feed** at [`/blog/rss.xml`](https://shrutipandey15.github.io/blog/rss.xml).
- **Drafts** that stay in the repo but never reach the site.
- **Motion that stays quiet.** Fireflies, a falling leaf, a shimmering wordmark
  and gentle reveals. All of it switches off for anyone with *reduce motion*
  enabled.
- **Accessible by default.** Keyboard focus is visible, there's a skip link,
  every control is a real link, button or form, and colours meet contrast
  guidelines.
- **Almost no JavaScript.** Three exceptions: the redirect that keeps old
  `#/…` links working, the search page, and nothing else.

## How it's built

[Astro](https://astro.build), building to static HTML. Posts are Markdown files,
one per post. No tracking, no analytics, no third-party requests at all — even
the fonts are served from this repo.

| Piece | What it does |
| --- | --- |
| `src/content/` | One Markdown file per post, in `reviews/` or `notebook/` |
| `src/content/config.ts` | The schema. A post that doesn't match it fails the build |
| `src/data/` | The feeling palette and what's on the nightstand |
| `src/lib/` | Reading time, related posts, cover colours, the OG image |
| `src/components/` | The markup, one piece of the design each |
| `src/styles/global.css` | The design, lifted from the old single-file version |
| `scripts/` | Migration from the old file, and the font pipeline |
| `legacy/index.html` | The old site. Not served. See `legacy/README.md` |

```
blog/
├── src/
│   ├── content/reviews/*.md      # the reviews
│   ├── content/notebook/*.md      # thoughts, poems, stories
│   ├── data/emotions.json         # feelings and their colours
│   ├── data/current.json          # what you're reading now
│   ├── components/  layouts/  pages/  lib/  styles/
├── public/fonts/                  # self-hosted, so the site has no third parties
├── scripts/
├── legacy/index.html
└── Readme.md
```

## Running it locally

```bash
npm install
npm run dev          # http://localhost:4321/blog/
```

Node 20 or newer (there's an `.nvmrc`; `nvm use` picks it up).

| Command | What it does |
| --- | --- |
| `npm run dev` | Live preview while you write |
| `npm run build` | Builds to `dist/`, subsets the fonts, indexes search |
| `npm run preview` | Serves the built site, exactly as Pages will |
| `npm test` | Visits every page at phone and laptop width |
| `npm run fonts` | Re-downloads the fonts. Only needed if you change one |

Search only works after a build, because it indexes the built pages. Use
`npm run build && npm run preview` to try it.

## Writing a post

Make a new Markdown file. A review goes in `src/content/reviews/`, anything
else in `src/content/notebook/`. **The filename is the URL**, so
`src/content/reviews/piranesi.md` becomes `/blog/reviews/piranesi/`.

Copy an existing post, rewrite it, commit. It's live in about two minutes.
Posts are sorted by `date`, so it doesn't matter where the file sits.

To hold a post back, set `draft: true`. It stays in the repo and never reaches
the site.

Don't change a post's `id` or its filename once it's published, or old links
break.

## Content reference

### A review

````markdown
---
id: "piranesi"
date: "2026-09-20"
title: "The headline."
excerpt: "One or two lines that make someone click."
book: "Piranesi"
author: "Susanna Clarke"
tags: ["fantasy", "rereads"]
emo:
  - { feeling: "longing", level: 5 }
  - { feeling: "comfort", level: 3 }
verdict: "The one thing the book left behind."
ask: "A question for the reader."
draft: false
---

A paragraph. Write as many as you like, one blank line between them.

> A line pulled out large, tinted by the post's main feeling.

```verse
A verse,
line by line.
```
````

### A notebook piece

````markdown
---
id: "marginalia"
date: "2026-07-08"
title: "Marginalia"
excerpt: "A line for the card."
form: "Poem"
tags: ["grief", "original"]
emo: []
draft: false
---

```verse
Someone underlined this before me
…
```
````

### Fields

| Field | Used in | Notes |
| --- | --- | --- |
| `id` | both | Match it to the filename. It's the URL. Don't change it once published |
| `date` | both | `YYYY-MM-DD` |
| `title` | both | The headline |
| `excerpt` | both | Short line for cards, search results and link previews |
| `book`, `author` | reviews | Shown on the cover |
| `form` | notebook | `Thought`, `Poem` or `Story` |
| `tags` | both | Free-form; each gets its own page |
| `emo` | reviews | `feeling` and a `level` from 1 to 5. The first one colours the cover. `[]` for notebook pieces |
| `verdict` | reviews | Optional. Shown as "the aftertaste" |
| `ask` | both | Optional. Shown as "over to you". Leave it out rather than empty |
| `draft` | both | `true` hides the post |

The build checks all of this. A missing field or a level of 6 stops the build
and names the file, rather than publishing something broken.

### Body blocks

| You write | It renders as |
| --- | --- |
| A plain line | Paragraph |
| `> A line` | Large pull quote, tinted by the post's main feeling |
| `` ```verse `` … `` ``` `` | Verse on a paper slip; every line break is kept |
| `` ```verse-hi `` … `` ``` `` | Hindi verse, set in Noto Serif Devanagari |

That's the whole syntax. Everything else — `**bold**`, links, headings — is
left alone and printed as you typed it, because the prose is taken literally.

## Customising

**What you're reading.** Edit `src/data/current.json`. `pct` is how far in you
are, `note` is the feeling so far, and `cover` is the short title on the little
cover. Set the file's contents to `null` to hide the nightstand.

**Feelings.** `src/data/emotions.json` maps each feeling to a colour. Only
feelings used in at least one review appear as filters.

```json
{
  "ache": "#B65C3F",
  "grief": "#6A7DA3"
}
```

**Palette.** The colours live in `:root` at the top of
`src/styles/global.css` (`--card`, `--accent`, `--gold`, `--cream` and so on).
Change them there and the whole site follows.

## URLs

| Address | Page |
| --- | --- |
| `/blog/` | Home |
| `/blog/reviews/` | All reviews |
| `/blog/reviews/feel/<feeling>/` | Reviews that left a feeling behind |
| `/blog/reviews/<id>/` | One review |
| `/blog/notebook/` | All notebook pieces |
| `/blog/notebook/<thought\|poem\|story>/` | One kind |
| `/blog/notebook/<id>/` | One notebook piece |
| `/blog/tags/`, `/blog/tags/<tag>/` | Tags |
| `/blog/search/` | Search |
| `/blog/about/` | About |
| `/blog/rss.xml`, `/blog/sitemap.xml` | Feed and sitemap |

Every link from the old hash version still works. `#/post/tfios`,
`#/reviews/feel/grief`, `#/tag/ya`, `#/search/plath` and the rest are redirected
to the address above as soon as the page opens. `#/log` goes home; `#/index`
and `#/archive/…` go to Reviews.

## Deploying

Pushing to `master` builds and publishes the site. The workflow is
`.github/workflows/deploy.yml`; there's nothing to run by hand.

**One-time setup.** In **Settings → Pages**, change **Source** from *Deploy from
a branch* to **GitHub Actions**. That's the only change. Don't set a branch or a
folder — Actions supplies the built site now, not the repo.

## Troubleshooting

**The build failed.** The error names the file and the field. It's almost always
a typo in the frontmatter of the post you last edited: a missing quote, a
`level` outside 1–5, or a `form` that isn't `Thought`, `Poem` or `Story`.

**A post isn't showing.** Check that `draft` isn't `true`, that the file is in
the right folder, and that `id` matches the filename.

**Search finds nothing.** It indexes the built site, so it does nothing in
`npm run dev`. Run `npm run build && npm run preview`.

**A verse lost its line breaks.** The `` ```verse `` fence has to be on its own
line, and so does the closing `` ``` ``.

**Hindi shows as boxes.** The Devanagari font is subset to the characters
already in the repo at build time. Add the new verse, run `npm run build`, and
the glyphs come with it.

**An old link 404s.** The redirect only runs on the home page. `…/blog/#/post/x`
works; `…/blog/reviews/#/post/x` doesn't, and never did.

## Roadmap

- [x] Move content into Markdown files and rebuild as a static site with Astro,
      with real URLs and per-post link previews
- [ ] A phone-friendly writing desk, self-hosted, that commits new posts to this
      repo
- [ ] Email subscriptions from the RSS feed

## Contact

No comment box, on purpose. If you want to argue about a book,
[email me](mailto:shrutipandey1505@gmail.com). I read all of them and answer
most.

— Shruti
