import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			// SvelteKit uses `$$Props`-style ambient types that trip this rule.
			'@typescript-eslint/no-explicit-any': 'warn'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		}
	},
	{
		// Registry-owned components are vendored from neo-retro; don't lint upstream code.
		ignores: ['src/lib/components/ui/**', 'src/lib/components/copy-button.svelte', 'build/**']
	}
);
