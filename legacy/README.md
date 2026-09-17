# legacy

`index.html` is the whole site as it was before the Astro rebuild: content,
styles and a hash router in one file.

It is kept for two reasons. `scripts/migrate.mjs` reads the `POSTS`, `EMO`
and `CURRENT` arrays out of it, so the migration stays re-runnable and
checkable against the original. And it is the reference for the design: if
something in the rebuild looks wrong, this is what it is supposed to look
like.

Nothing here is served. To look at it, open the file in a browser.
