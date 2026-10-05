# Starr Mantra

A mobile-first Starr-Tree themed quote and mantra book.

## Live site

https://starrtree.github.io/StarrMantra/

## Features

- Swipe quote cards left/right with touch or pointer gestures
- Click left/right arrows positioned beside the active card
- Add quotes with author, source, and tag
- Search quotes, authors, sources, and tags
- Shuffle and delete quotes
- Import/export the quote library as JSON
- Saves automatically on the current device with `localStorage`
- Responsive phone, tablet, and desktop layouts
- No framework, build step, or dependency install required

## Deployment

This repository is designed for **GitHub Pages → Deploy from a branch**.

Use:

- Branch: `main`
- Folder: `/ (root)`

The live app is the root `index.html`, so GitHub Pages can serve it directly without GitHub Actions, Vite, React compilation, or a `gh-pages` branch.

## Editing

All current UI, styling, and behavior live in:

```text
index.html
```

That keeps deployment simple and avoids build-related blank screens.
