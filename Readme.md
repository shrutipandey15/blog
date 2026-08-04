# Aftertaste

A reading journal. **One file.** No build step, no dependencies, no framework.

## Publish it (3 minutes, once)

1. Make a new GitHub repo.
2. Upload `index.html` to the root.
3. Repo → **Settings** → **Pages** → Source: **Deploy from a branch** → `main` / `root` → Save.

Wait about a minute. Your site is at `https://yourname.github.io/reponame/`.

## Write a new review

Open `index.html` on github.com, click the pencil icon, edit in the browser.

Everything you write lives at the very top, between two markers:

```
▼▼▼  EDIT EVERYTHING BETWEEN HERE AND "STOP EDITING"  ▼▼▼
...your content...
▲▲▲  STOP EDITING. Design and logic below.  ▲▲▲
```

Below that line is design. You never need to read it.

To publish, copy any existing review block, paste it at the **top** of the
`REVIEWS` list, rewrite it, commit. Live in about 30 seconds.

A review looks like this:

```js
{
  slug: "piranesi",              // becomes the link: yoursite.com/#piranesi
  title: "Piranesi",
  author: "Susanna Clarke",
  date: "18 July 2026",
  read: "3 days",
  opener: "One line that makes someone click.",
  tags: [{ wonder: 90 }, { melancholy: 62 }, { unease: 48 }],
  blocks: [
    { p: "A paragraph." },
    { p: "A paragraph.", note: "A note that sits in the margin." },
    { quote: "A line pulled out large." },
  ],
  after: "The one thing the book left behind.",
},
```

**Tags** are emotion + intensity 0–100. The first is dominant — it colours the
pull quotes. Together they generate that review's colour band, so the order and
the intensities are doing real visual work.

## The other things you can change

Also at the top:

- `SITE.name` — the title
- `SITE.thesis` — the opening statement
- `CURRENT` — what you're reading now (set to `null` to hide that section)
- `EMOTIONS` — the thirteen words and their colours

## If something breaks

The page will tell you. Instead of going blank it prints **"This page could not
be built"** with the actual problem — almost always a missing comma or an
unclosed quote in the block you last edited. Undo that commit and try again.

## What happens as the shelf grows

You never scroll to write — new reviews go at the **top** of the list, which is the
top of the file, no matter how many you have.

The page manages its own length:

- The **newest 8** show as full cards, with opener and emotion tags.
- Everything older drops into **the archive** — one compact line each, grouped by
  year. Six older books add about a screen, not six.
- Change `const RECENT = 8;` if you want more or fewer full cards.

## Things the site does on its own

- **Filter by emotion.** Tap any emotion and the shelf shows only the books that
  left it behind. The tags on each review are tappable too. Counts come from your
  own reviews, so an emotion only appears once you've used it.
- **Newer / older links** at the bottom of every review.
- **"If this one did it for you"** — suggests two other books that share emotions
  with the one just read.
- **Reading time**, calculated from the review.
- **Share cards.** Every review sets its own page title, description and OpenGraph
  tags, so links posted to WhatsApp or Instagram show the book title and your
  opener rather than the site name.
- **Bad links** get a proper "that review doesn't exist" page.
- **Your scroll position** is remembered when you go back to the shelf.

## Drafts

Add `draft: true,` to any review and it vanishes from the site while staying in
the file. Remove the line to publish.

```js
{
  slug: "half-finished",
  draft: true,
  title: "...",
}
```

## Local preview

Double-click `index.html`. Works offline, no server.
