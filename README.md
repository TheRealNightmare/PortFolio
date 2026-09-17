# mirazulislamnahid.com

Personal portfolio and blog for **Mirazul Islam Nahid** — a fully static SvelteKit site
deployed to Cloudflare Pages.

Every visual element comes from the [neo-retro](https://neo-retro.zurat.dev/) design system
(a shadcn-svelte component registry). Nothing on this site uses UI from outside that registry.

- **Projects** are pulled from the GitHub API **at build time** — no client-side API calls, no rate limits for visitors.
- **Blog posts** are markdown files in this repo. Publishing a post is a `git push`.
- **Contact** is links only. No forms, no backend, no database.

---

## Prerequisites

| Tool               | Version         | Notes                          |
| ------------------ | --------------- | ------------------------------ |
| Node.js            | 22 or newer     | pinned in `.nvmrc`             |
| npm                | ships with Node |                                |
| Git                | any             |                                |
| Cloudflare account | —               | for Pages hosting + the domain |

---

## First-time setup

```bash
git clone <your-repo-url> portfolio
cd portfolio
npm install
npm run dev
```

Open **http://localhost:5173**. The dev server hot-reloads on save.

---

## Project structure

```
src/
├── content/blog/          ← your blog posts (.md) — this is the whole CMS
│   └── building-cicd-pipeline-nuxt-aws.md
├── lib/
│   ├── config.ts          ← ALL your personal info lives here. Edit this file.
│   ├── blog.ts            ← reads the markdown files, parses frontmatter
│   ├── blog.server.ts     ← renders markdown → HTML with Shiki (build-time only)
│   ├── projects.server.ts ← the build-time GitHub fetch (shared by home + projects)
│   ├── data/
│   │   └── repos.fallback.json   ← offline snapshot of your GitHub repos
│   └── components/
│       ├── site/          ← band / section-title — the page vocabulary
│       └── ui/            ← neo-retro components. Don't hand-edit these.
├── routes/
│   ├── +layout.svelte     ← header, nav, footer, fonts, theme wrapper
│   ├── app.css            ← fonts + sticker utilities
│   ├── +page.svelte       ← home / about
│   ├── projects/
│   │   └── +page.svelte
│   ├── blog/
│   │   ├── +page.svelte     ← post list, search + tag filter
│   │   └── [slug]/          ← individual post pages
│   ├── resume/+page.svelte  ← experience, education, skills, contact
│   └── +error.svelte        ← 404 page
static/
└── Mirazul_Islam_CV.pdf  ← the CV served by the resume page
```

---

## Editing your info

Everything personal lives in **`src/lib/config.ts`**. You should never need to edit a component.

| Export                     | What it controls                                                         |
| -------------------------- | ------------------------------------------------------------------------ |
| `site`                     | Your name, role, tagline, location, avatar, and the site's canonical URL |
| `about`                    | The paragraphs in the About section on the home page                     |
| `socials`                  | The link buttons in the header footer, home page and resume              |
| `skills`                   | The skill cards (grouped) on the home and resume pages                   |
| `experience` / `education` | The resume timeline cards                                                |
| `projectRepos`             | Which GitHub repos appear on /projects, in order                         |
| `projectOverrides`         | Custom titles/descriptions/tags for repos                                |
| `nav`                      | The header navigation links                                              |

> Everything in here is real content — there are no placeholders left. Edit `config.ts`
> and every page that reads from it updates on the next build.

### Colors

Any `color` field must be a neo-retro palette name:
`red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, or the `bright-*` variants.
Don't use hex codes — the palette changes with the active theme, hex codes don't.

**The site is light-only.** The theme picker lists all 127 light themes and defaults to
`gruvbox-light`. To change the default, edit the first entry of `FavoriteThemes` in
`src/lib/components/ui/style/favorite-themes.ts`.

---

## Adding a project

1. Open `src/lib/config.ts`.
2. Add the repository name to `projectRepos`:

   ```ts
   export const projectRepos: string[] = [
   	'Verso2.0',
   	'ScrollSense',
   	'MyNewProject' // ← added
   ];
   ```

3. Optionally give it a nicer title or description in `projectOverrides` (useful because
   several repos have no description set on GitHub):

   ```ts
   MyNewProject: {
   	title: 'My New Project',
   	blurb: 'What it does, in one sentence.',
   	highlights: ['Rust', 'CLI'],
   	color: 'cyan',    // palette name — the card's background
   	featured: true    // gives it a full-width card
   }
   ```

4. Commit, then `npm run deploy`. The build pulls the fresh star count and language automatically.

If a name in `projectRepos` doesn't exist on your GitHub, the build logs a warning and skips
it rather than failing.

---

## Writing a blog post

Create a new file in `src/content/blog/`. **The filename becomes the URL** —
`my-first-post.md` → `/blog/my-first-post`.

```markdown
---
title: The title shown on the page
date: 2026-09-20
summary: One sentence used on the blog index and in link previews.
tags: [svelte, machine-learning]
draft: false
---

Your post body, in normal markdown.

## A heading

Regular paragraphs, **bold**, _italic_, [links](https://example.com), lists, tables
and blockquotes all work.

Fenced code blocks are syntax-highlighted with Shiki, in both light and dark themes:
open a fence with three backticks and a language (`python`, `ts`, `bash`, `svelte`, …).
```

### Frontmatter fields

| Field     | Required    | Notes                                                                  |
| --------- | ----------- | ---------------------------------------------------------------------- |
| `title`   | yes         | Falls back to the filename                                             |
| `date`    | yes         | `YYYY-MM-DD`. Posts sort newest-first by this                          |
| `summary` | recommended | Shown on the index and in `<meta description>`                         |
| `tags`    | no          | `[a, b]` — become clickable filters on the blog index                  |
| `draft`   | no          | `true` = visible in `npm run dev`, **excluded from production builds** |

Reading time is calculated automatically. Then:

```bash
git add src/content/blog/my-first-post.md
git commit -m "post: my first post"
git push
```

Then `npm run deploy` to push the rebuilt site to Cloudflare.

---

## Commands

| Command           | What it does                                                    |
| ----------------- | --------------------------------------------------------------- |
| `npm run dev`     | Dev server at http://localhost:5173, hot reload, drafts visible |
| `npm run build`   | Prerenders the whole site into `build/`                         |
| `npm run preview` | Serves the built `build/` folder locally, exactly as deployed   |
| `npm run check`   | TypeScript + Svelte type checking                               |
| `npm run lint`    | Prettier check + ESLint                                         |
| `npm run format`  | Auto-format the codebase                                        |
| `npm run deploy`  | Builds, then uploads `build/` to Cloudflare Pages via Wrangler  |

---

## Environment variables

| Variable       | Required                                        | Purpose                                                                 |
| -------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| `GITHUB_TOKEN` | Optional locally, **recommended on Cloudflare** | Raises the GitHub API rate limit during the build from 60/hr to 5000/hr |

Without it the build still works — it just uses the unauthenticated API, and falls back to
the committed snapshot if it gets rate-limited.

To create one:

1. GitHub → Settings → Developer settings → **Personal access tokens** → Fine-grained tokens.
2. **Generate new token**. Repository access: _Public repositories (read-only)_. No extra
   permissions are needed — public repo metadata is all this site reads.
3. Copy the token.
4. In Cloudflare Pages: your project → **Settings → Variables and Secrets** → add
   `GITHUB_TOKEN` as a **secret** for the Production (and Preview) environment.

Locally, if you want it: `GITHUB_TOKEN=ghp_xxx npm run build`.
**Never commit the token.**

---

## Deploying to Cloudflare Pages

The site is a fully prerendered static bundle, deployed by **direct upload** with Wrangler —
no Git connection on the Cloudflare side. The target project is `mirazulislamnahid`, declared
in `wrangler.jsonc`; deploying overwrites what is currently live there.

### One-time setup

```bash
npx wrangler login     # opens a browser, grants Wrangler access to your account
npx wrangler whoami    # confirm it picked the right account
```

If you would rather not use the browser login (CI, headless box), create an API token with
the **Cloudflare Pages: Edit** permission and export it instead:

```bash
export CLOUDFLARE_API_TOKEN=...
```

### Every deploy

```bash
npm run deploy
```

That runs `npm run build` and then `wrangler pages deploy`, uploading `build/` to the
`mirazulislamnahid` project. Only changed files are re-uploaded, so repeat deploys are fast.
Wrangler prints the deployment URL when it finishes.

Custom domains already attached to the project stay attached — direct upload replaces the
files, not the project settings.

### Notes

- `static/_headers` sets caching: `/_app/immutable/*` is fingerprinted so it is cached for a
  year; everything else must revalidate, so a redeploy shows up immediately.
- `GITHUB_TOKEN` is read from your shell during `npm run build`. Without it the build falls
  back to unauthenticated GitHub API calls (60/hr), which is plenty for six repos, and to
  `src/lib/data/repos.fallback.json` if the API is unreachable.
- `site.url` in `src/lib/config.ts` drives canonical URLs and social previews — keep it in
  sync with the domain you actually serve.
- To deploy a throwaway build without touching production, use
  `npx wrangler pages deploy --branch preview`, which publishes to a preview URL instead.

---

## Refreshing the GitHub project data

Project stars, descriptions and languages are baked in **at build time**, so they only change
when the site rebuilds. Any of these will do it:

- Push any commit (including a new blog post).
- Click **Retry deployment** in the Cloudflare Pages dashboard.
- Use a **Deploy Hook** — Pages project → _Settings → Builds → Deploy hooks → Add_. You get
  a URL you can call any time:

  ```bash
  curl -X POST "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/<your-hook-id>"
  ```

  To refresh daily, put that curl in a Cloudflare Worker with a Cron Trigger
  (`0 3 * * *` for 03:00 UTC), or in a GitHub Actions scheduled workflow.

### Updating the offline snapshot

`src/lib/data/repos.fallback.json` is used only when the GitHub API is unreachable during a
build. Regenerate it occasionally so the fallback isn't stale:

```bash
curl -s "https://api.github.com/users/TheRealNightmare/repos?per_page=100&sort=pushed" \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const k=['name','description','language','stargazers_count','html_url','homepage','pushed_at'];console.log(JSON.stringify(JSON.parse(s).map(r=>Object.fromEntries(k.map(x=>[x,r[x]]))),null,2))})" \
  > src/lib/data/repos.fallback.json
```

---

## Troubleshooting

**Projects page shows a yellow "cached snapshot" banner**
The GitHub API failed during the build. Usually a rate limit — add `GITHUB_TOKEN` in
Cloudflare. The page still renders from the committed snapshot, so the site never breaks.

**A project is missing from /projects**
The repo name in `projectRepos` must match GitHub exactly, including capitalisation
(`Verso2.0`, not `verso2.0`). Check the build log for
`"<name>" is in projectRepos but was not found on GitHub`.

**A blog post doesn't appear**
Check `draft: false` in the frontmatter — drafts only show in `npm run dev`. Also confirm the
file is directly in `src/content/blog/` with a `.md` extension (subfolders aren't scanned).

**A deep link like `/blog/some-post` 404s after a hard refresh**
Every post is prerendered to a real HTML file, so this shouldn't happen. If you added a post
and only see it in dev, you haven't rebuilt. Confirm `build/blog/some-post.html` exists after
`npm run build`.

**Cloudflare build fails with a Node version error**
Pages reads `.nvmrc` (Node 22). If it's ignoring it, set a `NODE_VERSION` environment
variable to `22` in the Pages project settings.

**`npm run build` fails on a link 404**
The prerenderer is strict: a link to a file that doesn't exist fails the build. Most likely
`static/Mirazul_Islam_CV.pdf` was deleted or renamed. Put the file back, or update the
`href` and `download` on the CV button in `src/routes/resume/+page.svelte` to match.

---

## Adding more neo-retro components

The registry has ~58 components; only the ones this site uses are installed. To add another:

```bash
npx shadcn-svelte@1.1.1 add --no-deps
```

Pick from the list (or pass a name, e.g. `add carousel`). Files land in
`src/lib/components/ui/`. If the CLI reports missing peer dependencies, install those with
`npm i` — the message lists them.

The full component reference lives in `.agent/skills/neo-retro-components/SKILL.md`
(props for every component) and `.agent/skills/neo-retro-common/SKILL.md` (colors, types).

**Keep everything on-system.** Don't introduce another UI library, hand-rolled components that
duplicate registry ones, or hard-coded hex colors — the whole point of the registry is that
all 40+ themes in the theme picker keep working.

---

## License

Code: MIT. Blog post content: © Mirazul Islam Nahid.

---

## Design conventions

The look is a deliberate "arcade / zine" take on neo-retro. If you edit pages, keep to these:

- **Pages are stacks of full-bleed bands**, not one centered column. Use
  `<Band color="blue">…</Band>` from `src/lib/components/site/` and alternate the colors down
  the page — that alternation is what stops it looking like a template.
- **Band grounds are flat colour, no background texture.** Keep them that way; patterned
  grounds were tried and made the pages look busy.
- **Never color text with the same palette color as its band.** A `text-red` heading on a
  `color="red"` band vanishes. Use `text-on-clr` and accent with the `bright-*` ramp.
- **Card grids**: `class="sticker-grid"` on the container, `class="sticker"` on each card, for
  the alternating tilt and hover pop. Add `sticker-flat` to any full-width card.
- **Motion is optional**: everything animated is disabled under `prefers-reduced-motion`, and
  the hero intro is applied after mount so the page is complete without JavaScript.
- **Fonts** are self-hosted via fontsource and wired to `--font-display` / `--font-sans` /
  `--font-mono` in `src/routes/app.css`. Swap the packages there to change them.
- There's a **Konami code** easter egg in `+layout.svelte` (↑↑↓↓←→←→BA) that tilts everything
  harder. The footer hints at it.
