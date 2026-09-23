import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

import { FavoriteThemes } from './src/lib/components/ui/style/favorite-themes';

/**
 * The registry's colors.css defines all 586 themes (~540 KB), but the site only ever
 * renders its default. This strips every other `[data-theme=…]` block from the compiled
 * stylesheet, leaving the registry file itself untouched on disk.
 *
 * The kept theme is also applied to `:root` and to *any* `[data-theme]` value, so a
 * visitor with a stale theme saved by mode-watcher, or with JavaScript off, still gets
 * the default colors instead of an unstyled page.
 *
 * It runs after Tailwind (which inlines colors.css itself), on the compiled CSS.
 */
function onlyDefaultTheme(): Plugin {
	const keep = FavoriteThemes[0];
	// One rule whose selector is a list of theme attributes (minifiers may merge identical
	// themes). Blocks hold only custom properties, so they never contain nested braces.
	const themeRule = /((?:\[data-theme=[^\]]+\]\s*,\s*)*\[data-theme=[^\]]+\])\s*\{([^{}]*)\}/g;
	const themeName = /\[data-theme=(['"]?)([^\]'"]+)\1\]/g;

	return {
		name: 'only-default-theme',
		transform(code, id) {
			if (!/\/components\/ui\/style\/tailwind\.css(\?|$)/.test(id)) return;

			let kept = 0;
			let removed = 0;
			const out = code.replace(themeRule, (_rule, selectors: string, body: string) => {
				const names = [...selectors.matchAll(themeName)].map((m) => m[2]);
				if (names.includes(keep)) {
					kept++;
					return `:root,[data-theme]{${body}}`;
				}
				removed += names.length;
				return '';
			});

			if (kept !== 1) {
				throw new Error(
					`[only-default-theme] expected exactly one "${keep}" theme block, found ${kept}. ` +
						'Did the registry change how colors.css is structured?'
				);
			}
			this.info?.(`kept "${keep}", removed ${removed} other themes`);
			return { code: out, map: null };
		}
	};
}

export default defineConfig({
	plugins: [
		tailwindcss(),
		onlyDefaultTheme(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Fully prerendered static output, deployed to Cloudflare Pages.
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: '404.html',
				precompress: false,
				strict: true
			})
		})
	]
});
