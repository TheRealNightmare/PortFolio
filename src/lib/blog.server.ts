import { readFileSync } from 'node:fs';
import { Marked } from 'marked';
import { codeToHtml } from 'shiki';

import { type Post, rawPost } from './blog';

/**
 * Pixel size of a WebP under `static/`, read from its header so the cover's
 * width/height attributes are always right (a wrong ratio causes layout shift).
 */
export function webpSize(publicPath: string): { width: number; height: number } | null {
	try {
		const buf = readFileSync(`static${publicPath}`);
		if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
			return null;
		}
		const chunk = buf.toString('ascii', 12, 16);
		if (chunk === 'VP8 ') {
			return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
		}
		if (chunk === 'VP8L') {
			const bits = buf.readUInt32LE(21);
			return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
		}
		if (chunk === 'VP8X') {
			return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
		}
	} catch {
		// Missing file: fall through and let the page render without dimensions.
	}
	return null;
}

/**
 * Render one post to HTML. Server-only so Shiki (and its grammars) never reach
 * the client bundle — every post is rendered once, at build time.
 */
export async function getPost(slug: string): Promise<Post | null> {
	const found = rawPost(slug);
	if (!found) return null;
	const { meta, body } = found;

	const marked = new Marked({ async: true, gfm: true });

	// The page already renders the post title as the one <h1>, so a `#` in the
	// markdown is demoted to <h2> to keep a single top-level heading.
	marked.use({
		walkTokens(token) {
			if (token.type === 'heading' && token.depth === 1) token.depth = 2;
		}
	});

	marked.use({
		async: true,
		walkTokens: async (token) => {
			if (token.type !== 'code') return;
			// Shiki themes mirror the neo-retro light/dark modes.
			token.text = await codeToHtml(token.text, {
				lang: isKnownLang(token.lang) ? token.lang! : 'text',
				themes: { light: 'github-light', dark: 'github-dark' },
				defaultColor: false
			});
			token.escaped = true;
		},
		renderer: {
			// walkTokens already produced the full <pre> markup.
			code({ text }) {
				return text;
			}
		}
	});

	const html = await marked.parse(body);
	return {
		...meta,
		html: html as string,
		coverSize: meta.cover ? webpSize(meta.cover) : null
	};
}

const KNOWN_LANGS = new Set([
	'bash',
	'sh',
	'shell',
	'zsh',
	'c',
	'cpp',
	'css',
	'diff',
	'docker',
	'go',
	'html',
	'java',
	'js',
	'javascript',
	'json',
	'jsx',
	'md',
	'markdown',
	'php',
	'python',
	'py',
	'rust',
	'sql',
	'svelte',
	'ts',
	'typescript',
	'tsx',
	'vue',
	'yaml',
	'yml'
]);

function isKnownLang(lang: string | undefined): boolean {
	return !!lang && KNOWN_LANGS.has(lang.toLowerCase());
}
