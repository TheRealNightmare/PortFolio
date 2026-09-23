# SEO: getting mirazulislamnahid.com into Google

The code side is done: every page has a title, description, canonical URL, share image and
structured data, and there's a sitemap. None of that makes Google show up on its own, though.
Google has to be told the site exists, and it has to see other sites linking to it. This file
covers both.

## 1. Verify the domain in Google Search Console (one time, ~10 minutes)

Use a **Domain property**. It covers `http`, `https`, `www` and every subdomain in one go.

1. Go to <https://search.google.com/search-console> and sign in with the Google account you want
   to own the site.
2. Click **Add property**, choose **Domain** (the left box, not "URL prefix") and enter
   `mirazulislamnahid.com`.
3. Google shows a TXT record that looks like `google-site-verification=AbC123…`. Copy it.
4. In the Cloudflare dashboard, open **mirazulislamnahid.com → DNS → Records → Add record**:
   - Type: `TXT`
   - Name: `@`
   - Content: paste the whole `google-site-verification=…` value
   - TTL: Auto
5. Save, go back to Search Console and click **Verify**. Cloudflare DNS usually propagates in a
   minute or two. If verification fails, wait five minutes and try again. **Leave the TXT record
   in place permanently**; removing it un-verifies you.

## 2. Tell Google what to crawl

1. **Deploy first** (`npm run deploy`), then confirm
   <https://mirazulislamnahid.com/sitemap.xml> opens in a browser. Search Console rejects a
   sitemap that isn't live yet.
2. In Search Console, go to **Sitemaps** and enter the **full URL**,
   `https://mirazulislamnahid.com/sitemap.xml`. A Domain property has no URL prefix, so just
   `sitemap.xml` is rejected as "Invalid sitemap address". Click **Submit**. It should show
   "Success" with 6 discovered URLs.
3. Go to **URL inspection**, paste each URL below one at a time and click **Request indexing**:
   - `https://mirazulislamnahid.com/`
   - `https://mirazulislamnahid.com/projects`
   - `https://mirazulislamnahid.com/blog`
   - `https://mirazulislamnahid.com/resume`
   - `https://mirazulislamnahid.com/blog/scrollsense-reading-your-feeds-mood`
   - `https://mirazulislamnahid.com/blog/building-cicd-pipeline-nuxt-aws`
4. Optional, but it's free traffic: in [Bing Webmaster Tools](https://www.bing.com/webmasters),
   choose **Import from Google Search Console**. Several other search engines, DuckDuckGo among
   them, draw on Bing's index.

**Expect days to a few weeks** before pages appear. Check **Pages** (the indexing report) in
Search Console weekly. "Discovered – currently not indexed" on a new site is normal; it means
Google knows about the page and hasn't gotten to it yet. Backlinks (below) are what speeds that
up.

To test the site is found at all, search Google for `site:mirazulislamnahid.com`.

## 3. Backlink strategy

Google trusts a new site based on who links to it. For a personal portfolio, the goal isn't
volume. It's a handful of links from places that are clearly about _you_, plus a few from
places developers read. Never buy links or use link farms or "SEO packages"; Google penalises
them and they're hard to undo.

Work through these roughly in order. The first group takes an afternoon and does most of the
work.

### Places you already own (do these first)

- [ ] **GitHub profile.** Set the **Website** field on your profile to
      `https://mirazulislamnahid.com`. If you have a profile README (`TheRealNightmare/TheRealNightmare`),
      link it there too.
- [ ] **Every featured repo.** Each repo's **About → Website** field: point ScrollSense at
      `/blog/scrollsense-reading-your-feeds-mood` and the others at `/projects`. That's six links from
      github.com in five minutes.
- [ ] **LinkedIn.** Set **Contact info → Website** and add the site under **Featured**. Share each
      new blog post as a LinkedIn post that links to it.
- [ ] **X bio** (`@nightMARE496`): put the URL in the website field of your profile.
- [x] **CV PDF.** Already prints `mirazulislamnahid.com` in the header, so every application
      carries it. Keep it there on future versions.
- [ ] **Email signature.**

### Places tied to your work and school

- [ ] **Moner Bondhu.** Ask to be listed, with a link, on the company's team or about page.
- [ ] **United International University.** CSE department student project showcases, club pages
      (programming club, AI/robotics club) and lab pages often list student projects. ScrollSense
      was an AI lab project, so ask the course instructor whether there's a showcase page.
- [ ] **ScrollSense co-authors.** Ask Fairoze and Rumman to link the write-up from their own
      profiles and portfolios, and link theirs back.

### Developer communities (one post per project, not spam)

- [ ] **Cross-post the blog posts to [dev.to](https://dev.to) and [Hashnode](https://hashnode.com).**
      Both let you set a **canonical URL**. Always set it to the original post on your site, so the
      copies send ranking credit back instead of competing with you.
- [ ] **Show-and-tell threads.** PlayerKoi (Raspberry Pi chess vision) is the most shareable project:
      r/raspberry_pi, r/chess, r/computervision. ScrollSense suits r/LanguageTechnology and
      Bengali NLP groups. Post the project itself with a link to the write-up, and follow each
      subreddit's self-promotion rules.
- [ ] **Built-with showcases.** Share the site in the Svelte Discord's showcase channel, and check
      whether the neo-retro registry has a "sites using it" list you can submit to.
- [ ] **Answer questions.** Useful answers on Stack Overflow or GitHub Discussions about Laravel,
      CI/CD on AWS or fine-tuning XLM-R, with the portfolio in your profile. Slow, but compounding.

### Keep it going

- [ ] Publish a post roughly monthly. Every post is a new page to rank and a new reason to share.
- [ ] When you ship a project, add it to `projectRepos` in `src/lib/config.ts` and write it up.
      Project write-ups are the posts people link to.

## 4. Re-check after each deploy

| Check                  | Where                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| Structured data valid  | [Rich Results Test](https://search.google.com/test/rich-results): home page and one post                    |
| Share preview renders  | [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/), [opengraph.xyz](https://opengraph.xyz) |
| Core Web Vitals        | [PageSpeed Insights](https://pagespeed.web.dev/) (mobile tab)                                               |
| No broken links        | `npm run build && npm run links`                                                                            |
| Preview host is hidden | `curl -sI https://mirazulislamnahid.pages.dev/ \| grep -i x-robots` should print `noindex`                  |

## How the SEO code is organised

- `src/lib/components/site/seo.svelte` renders every page's `<head>` tags. Pages pass `title`,
  `description`, `path` and optional `jsonLd`.
- `src/lib/seo.ts` builds the schema.org `Person`/`WebSite` data from `config.ts`.
- `src/routes/sitemap.xml/+server.ts` and `src/routes/robots.txt/+server.ts` are generated at
  build time from `site.url`, the nav and the published posts. New posts appear automatically.
- Blog frontmatter takes optional `seoTitle` (60 characters or fewer) and `seoDescription` (160 or
  fewer) when the on-page title or summary is too long for search results.
- `npm run images` regenerates `static/og.png` and the 800px blog covers. Run it after changing
  your name/role in config or adding a cover image, then commit the output.
