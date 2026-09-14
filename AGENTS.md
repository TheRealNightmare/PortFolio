# Project conventions

This is a static SvelteKit portfolio + blog for Mirazul Islam Nahid, deployed to Cloudflare Pages.

## Hard rule: stay inside the neo-retro design system

All UI comes from the [neo-retro](https://neo-retro.zurat.dev/) shadcn-svelte registry.

- **Component Reference**: See `.agent/skills/neo-retro-common/SKILL.md` for shared types/colors
  and `.agent/skills/neo-retro-components/SKILL.md` for HTML tag replacements and props for all
  components.
- Use registry components instead of raw HTML where the reference says so
  (`<Button>` not `<button>`, `<Badge>` not `<span>`, `<Card>` not a styled `<div>`).
- Never introduce another UI library, and never hand-roll a component that already exists in
  the registry. Add missing ones with `npx shadcn-svelte@1.1.1 add --no-deps <name>`.
- Colors must be palette names (`red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`,
  and `bright-*`). No hex codes — the palette is theme-dependent.
- Only theme tokens exist for color utilities: `bg-background`, `text-foreground`,
  `bg-clr`/`text-on-clr`, `var(--color-border)`, `var(--shadow-shadow)`. There is **no**
  `muted-foreground` token; use opacity utilities for de-emphasis.

### Contrast rule (learned the hard way)

**Never color text with the same palette color as the band it sits on** — a `text-red` heading
on a `color="red"` band is invisible in most themes. Inside a colored band, default to
`text-on-clr` and accent sparingly with the `bright-*` ramp, which reads on any ground.
This bug shipped twice during the redesign (the hero name and the 404 digits).

## Layout vocabulary

Pages are built as a vertical stack of full-bleed bands, not one centered column. Two local
components in `src/lib/components/site/` compose _from_ registry primitives:

- `band.svelte` — a full-bleed section: a flat colored ground + a centered `max-w-5xl` column.
  Alternate band colors down a page; this is what gives the site rhythm.
  **Bands carry no background texture.** The registry's `BackgroundPattern` was removed on
  purpose — 11 different patterns made the site look busy. Keep grounds flat; if you ever want
  texture back, re-add the component with `npx shadcn-svelte@1.1.1 add --no-deps background-pattern`.
- `section-title.svelte` — display heading with the hard text-shadow and an optional kicker.
  It renders kicker + heading inside a wrapper div so it stays one unit inside flex parents.

Card grids get `class="sticker-grid"` on the container and `class="sticker"` on each card for
the alternating tilt + hover pop. Full-width cards also need `sticker-flat` — a wide card at an
angle swings past the content column.

## Theming: light only

`src/lib/components/ui/style/themes.ts` and `favorite-themes.ts` are the **two registry files
this project intentionally modifies**. They filter the theme list to light themes only and set
`gruvbox-light` as the default. `npx shadcn-svelte add --overwrite` will clobber them — re-apply
the change if that happens. Everything else under `src/lib/components/ui/` is untouched
upstream code and is excluded from lint and format so it stays diffable.

## Content

All personal content lives in `src/lib/config.ts`. Blog posts are markdown in
`src/content/blog/`. Don't hardcode either into components.

## Constraints

- The site is fully prerendered (`adapter-static`). No server runtime exists in production.
- The GitHub API is only ever called from `+page.server.ts` at build time, never the browser.
  The shared loader is `src/lib/projects.server.ts`.
- Shiki must stay in `blog.server.ts` — importing it from a universal load adds ~700KB to the
  client bundle. The same applies to `Avatar.Fallback` (pulls in all of dicebear).
- Motion is an enhancement, never a gate: the hero intro is applied after mount so the
  prerendered HTML is complete, and every animation is disabled under `prefers-reduced-motion`.

## Before committing

```bash
npm run check && npm run lint && npm run build
```
