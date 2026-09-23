/**
 * One-off image pipeline. Run with `npm run images` and commit the output.
 *
 *   static/og.png            1200×630 share card for link previews (og:image)
 *   static/blog-*-800.webp   800px copies of each blog cover, used via srcset
 *
 * Colors come from the gruvbox-light theme in the registry CSS so the card
 * matches the site's default theme; nothing is hardcoded here.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';

import { site } from '../src/lib/config.ts';

const THEME = 'gruvbox-light';

async function themeColors() {
	const css = await readFile('src/lib/components/ui/style/colors.css', 'utf8');
	const block = new RegExp(`\\[data-theme='${THEME}'\\]\\s*\\{([^}]*)\\}`).exec(css);
	if (!block) throw new Error(`theme ${THEME} not found in colors.css`);
	return Object.fromEntries(
		[...block[1].matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()])
	);
}

/** Tiny hyperscript so the card reads as a tree instead of nested object literals. */
const h = (type, style, ...children) => ({
	type,
	props: { style: { display: 'flex', ...style }, children: children.flat() }
});

async function ogCard() {
	const c = await themeColors();
	const font = await readFile(
		'node_modules/@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff'
	);
	const ink = '#000';
	const accents = { 0: c['bright-yellow'], 3: c['bright-magenta'], 6: c['bright-cyan'] };

	// Same treatment as the hero: black letters on blue, every 7th letter accented.
	let n = 0;
	const nameLines = site.name
		.toUpperCase()
		.split(' ')
		.map((word) =>
			h(
				'div',
				{},
				...word
					.split('')
					.map((ch) => h('span', { color: accents[n++ % 7] ?? c['text-on-blue'] }, ch))
			)
		);

	const tree = h(
		'div',
		{
			width: '100%',
			height: '100%',
			background: c.blue,
			border: `12px solid ${ink}`,
			padding: '56px 64px',
			flexDirection: 'column',
			justifyContent: 'space-between',
			fontFamily: 'Archivo Black'
		},
		h(
			'div',
			{ fontSize: 26, letterSpacing: 6, color: c['text-on-blue'] },
			`${site.role} · ${site.location}`.toUpperCase()
		),
		h(
			'div',
			{
				flexDirection: 'column',
				fontSize: 104,
				lineHeight: 0.95,
				letterSpacing: -3,
				textShadow: `6px 6px 0 ${c['primary-background']}`
			},
			...nameLines
		),
		h(
			'div',
			{ alignItems: 'center', gap: 20 },
			h(
				'div',
				{
					background: c.yellow,
					color: c['text-on-yellow'],
					border: `5px solid ${ink}`,
					boxShadow: `8px 8px 0 0 ${ink}`,
					padding: '10px 22px',
					fontSize: 30
				},
				new URL(site.url).host.toUpperCase()
			),
			h(
				'div',
				{
					background: c['primary-background'],
					color: c['primary-foreground'],
					border: `5px solid ${ink}`,
					boxShadow: `8px 8px 0 0 ${ink}`,
					padding: '10px 22px',
					fontSize: 30
				},
				'WORK · BLOG · RESUME'
			)
		)
	);

	const svg = await satori(tree, {
		width: 1200,
		height: 630,
		fonts: [{ name: 'Archivo Black', data: font, weight: 400, style: 'normal' }]
	});
	const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toBuffer();
	await writeFile('static/og.png', png);
	console.log(`static/og.png  ${(png.length / 1024).toFixed(1)} KB`);
}

async function coverVariants() {
	const covers = (await readdir('static')).filter((f) => /^blog-.*(?<!-800)\.webp$/.test(f));
	for (const file of covers) {
		const out = `static/${file.replace(/\.webp$/, '-800.webp')}`;
		const info = await sharp(`static/${file}`)
			.resize({ width: 800 })
			.webp({ quality: 75 })
			.toFile(out);
		console.log(`${out}  ${(info.size / 1024).toFixed(1)} KB`);
	}
}

await ogCard();
await coverVariants();
