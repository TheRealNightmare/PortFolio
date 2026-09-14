import { Marked } from 'marked';
import { codeToHtml } from 'shiki';

import { type Post, rawPost } from './blog';

/**
 * Render one post to HTML. Server-only so Shiki (and its grammars) never reach
 * the client bundle — every post is rendered once, at build time.
 */
export async function getPost(slug: string): Promise<Post | null> {
	const found = rawPost(slug);
	if (!found) return null;
	const { meta, body } = found;

	const marked = new Marked({ async: true, gfm: true });

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
	return { ...meta, html: html as string };
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
