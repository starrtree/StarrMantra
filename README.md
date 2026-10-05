# Starr Mantra

A mobile-first Starr-Tree themed mantra and quote book.

## Features

- Swipe quote cards left/right on mobile
- Click left/right arrows on the sides of the card
- Add new quotes with author, source, and tag
- Search quotes, authors, sources, and tags
- Shuffle, delete, import, and export quotes
- Saves automatically to the browser with `localStorage`
- Responsive layout for phone, tablet, and desktop
- GitHub Pages deployment workflow included

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

This repo includes `.github/workflows/deploy.yml` for GitHub Pages.

If the first workflow fails because Pages has not been configured yet:

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Set **Build and deployment → Source** to **GitHub Actions**.
4. Re-run the deploy workflow or push another commit.

Expected public URL after deployment:

```text
https://starrtree.github.io/StarrMantra/
```
