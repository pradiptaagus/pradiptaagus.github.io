# Hugo Portfolio + Blog Site Plan

## Phase 1: Theme Setup
1. Add **PaperMod** theme (popular, clean, great for portfolios + blogs)
2. Configure `hugo.toml` with base settings (title, baseURL, theme, params)
3. Set up navigation menu (Home, About, Portfolio, Blog, Resume)

## Phase 2: Content Structure
4. Create content sections:
   - `content/_index.md` — Home landing page
   - `content/about/_index.md` — About page
   - `content/portfolio/` — Portfolio section with archetype for projects
   - `content/blog/` — Blog section with archetype for posts
   - `content/resume/_index.md` — Resume/CV page
5. Create archetypes: `portfolio.md` (project fields), `blog.md` (post fields)

## Phase 3: Customization
6. Add custom layouts/overrides in `layouts/` partials
7. Configure Tailwind CSS via assets pipeline (or add via custom CSS)
8. Set up site params: social links, avatar, SEO, analytics placeholder
9. Add contact info (email, social links) to site footer

## Phase 4: GitHub Pages Deployment
9. Create `.github/workflows/hugo.yml` for CI/CD
10. Add `README.md` with setup instructions

## Phase 5: Sample Content
11. Create 2-3 sample portfolio items
12. Create 1-2 sample blog posts
