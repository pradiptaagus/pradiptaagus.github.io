# Portfolio

Personal portfolio and blog built with [Hugo](https://gohugo.io/) and the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme.

## Quick Start

```bash
# Install dependencies
npm install

# Build Tailwind CSS and start dev server
npm run dev
```

Visit `http://localhost:1313`.

> **Note:** Always use `npm run dev` instead of `hugo server` directly. The dev script passes `--baseURL "http://localhost:1313/"` so all links stay on localhost — without it, clicking links would navigate to the production GitHub Pages URL.

## Build for Production

```bash
npm run build:css
hugo --minify
```

Output is in `public/`.

## Deployment

Pushing to `main` triggers GitHub Actions to build and deploy to GitHub Pages.
