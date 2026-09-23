/**
 * Broken-link check over the built site. Run after `npm run build`:
 *
 *   npm run links            internal links + external links
 *   npm run links -- --local internal links only (no network)
 *
 * Internal links must resolve to a file in build/. External links get a HEAD
 * request (GET if HEAD is refused). Exits non-zero if anything is broken.
 */
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { site } from '../src/lib/config.ts';

const BUILD = 'build';
const localOnly = process.argv.includes('--local');

// LinkedIn answers 999 to anything that isn't a logged-in browser; X blocks bots outright.
const BOT_WALLED = [/linkedin\.com/, /(^|\.)x\.com/, /twitter\.com/];

async function htmlFiles(dir) {
	const out = [];
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...(await htmlFiles(path)));
		else if (entry.name.endsWith('.html')) out.push(path);
	}
	return out;
}

/** `/blog/x` can be served by build/blog/x.html, build/blog/x/index.html or a static file. */
function resolvesLocally(pathname) {
	const p = decodeURIComponent(pathname).replace(/\/$/, '') || '/';
	if (p === '/') return existsSync(join(BUILD, 'index.html'));
	return [p, `${p}.html`, `${p}/index.html`].some((c) => existsSync(join(BUILD, c)));
}

async function checkExternal(url) {
	if (BOT_WALLED.some((re) => re.test(new URL(url).hostname))) return 'skipped (bot-walled)';
	const opts = { redirect: 'follow', signal: AbortSignal.timeout(15000) };
	try {
		let res = await fetch(url, { ...opts, method: 'HEAD' });
		if (res.status === 405 || res.status === 403)
			res = await fetch(url, { ...opts, method: 'GET' });
		return res.ok ? null : `HTTP ${res.status}`;
	} catch (err) {
		return err.cause?.code ?? err.name;
	}
}

const links = new Map(); // url -> Set of pages that use it
for (const file of await htmlFiles(BUILD)) {
	const html = await readFile(file, 'utf8');
	const page = '/' + file.slice(BUILD.length + 1).replace(/(index)?\.html$/, '');
	for (const [, url] of html.matchAll(/\s(?:href|src)="([^"#][^"]*)"/g)) {
		if (/^(mailto:|tel:|data:|javascript:)/.test(url)) continue;
		if (!links.has(url)) links.set(url, new Set());
		links.get(url).add(page);
	}
	for (const [, list] of html.matchAll(/\ssrcset="([^"]+)"/g)) {
		for (const candidate of list.split(',')) {
			const url = candidate.trim().split(/\s+/)[0];
			if (!links.has(url)) links.set(url, new Set());
			links.get(url).add(page);
		}
	}
}

const broken = [];
const external = [];
for (const [url, pages] of links) {
	const abs = new URL(url, `${site.url}/`);
	if (abs.origin === site.url) {
		if (!resolvesLocally(abs.pathname)) broken.push({ url, reason: 'no such file', pages });
	} else if (/^https?:$/.test(abs.protocol)) {
		external.push({ url: abs.href, pages });
	}
}

if (!localOnly) {
	const results = await Promise.all(
		external.map(async (l) => ({ ...l, reason: await checkExternal(l.url) }))
	);
	for (const r of results) {
		if (r.reason?.startsWith('skipped')) console.log(`  skip  ${r.url}`);
		else if (r.reason) broken.push(r);
		else console.log(`  ok    ${r.url}`);
	}
}

console.log(
	`\nChecked ${links.size} unique links (${external.length} external${localOnly ? ', not fetched' : ''}).`
);
if (broken.length) {
	console.error(`\n${broken.length} broken:`);
	for (const b of broken)
		console.error(`  ${b.reason}  ${b.url}\n    on ${[...b.pages].join(', ')}`);
	process.exit(1);
}
console.log('No broken links.');
