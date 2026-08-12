# Plan: Show tags at the bottom of blog cards

**Goal:** Display each post's tags as clickable pills at the bottom of its card on the blog list and homepage.

**Context:**
- Cards render in `themes/PaperMod/layouts/list.html` (`list.html:66-93`).
- All posts already have `tags` in front matter (e.g., `prevent-multiple-same-fetches-by-implementing-dedupe.md:7`).
- The theme ships a ready-made `.post-tags` pill style in `themes/PaperMod/assets/css/common/post-single.css:129-159` (background, border, hover).
- Site custom CSS lives in `assets/css/tailwind.css` and is loaded via `layouts/partials/extend_head.html`.

## Step 1 — Override the theme's list template

Hugo gives site templates precedence over theme templates. Copy `themes/PaperMod/layouts/list.html` to `layouts/list.html` (do NOT edit theme sources, so theme updates don't wipe the change).

In the copied file, add a tags block after the `entry-footer` (currently line 91) and before the `entry-link` overlay:

```html
{{- if .Params.tags }}
<div class="post-tags">
  {{- range (.GetTerms "tags") }}
  <a href="{{ .Permalink }}">{{ .LinkTitle }}</a>
  {{- end }}
</div>
{{- end }}
```

## Step 2 — Add placement CSS

Add to `assets/css/tailwind.css`:

```css
.post-entry .post-tags {
  margin-block-start: 12px;   /* spacing below the meta footer */
  position: relative;
  z-index: 1;                 /* lift pills above the .entry-link overlay so links are clickable */
}
```

The `z-index` is required because `.entry-link` is an absolutely-positioned anchor covering the entire card (`post-entry.css:93-100`).

## Step 3 — Verify

Run `hugo server` and confirm:
1. Pills appear at the bottom of each card on `/blog/` and the homepage (first post too).
2. Pills are clickable (not swallowed by the card overlay).
3. Clicking a tag navigates to `/tags/<tag>/`, which Hugo auto-generates via `themes/PaperMod/layouts/taxonomy.html`.

## Notes
- No front-matter changes needed; the `if .Params.tags` guard handles posts without tags.
- Files touched: `layouts/list.html` (new), `assets/css/tailwind.css` (edit).