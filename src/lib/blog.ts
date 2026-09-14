export type PostMeta = {
	slug: string;
	title: string;
	date: string;
	summary: string;
	tags: string[];
	draft: boolean;
	readingTime: number;
	/** Optional cover image, as a path under `static/` (e.g. `/blog-cicd.webp`). */
	cover?: string;
	coverAlt?: string;
};

export type Post = PostMeta & { html: string };

/** Raw markdown files, resolved at build time by Vite. */
const files = import.meta.glob('/src/content/blog/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

type Frontmatter = Record<string, string | string[] | boolean>;

/**
 * Minimal YAML frontmatter parser — supports `key: value`, quoted strings,
 * `[a, b]` inline arrays, and booleans. Enough for post metadata, no extra dependency.
 */
function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
	if (!match) return { data: {}, body: raw };

	const data: Frontmatter = {};
	for (const line of match[1].split(/\r?\n/)) {
		const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim());
		if (!kv) continue;
		const key = kv[1];
		let value = kv[2].trim();

		if (value.startsWith('[') && value.endsWith(']')) {
			data[key] = value
				.slice(1, -1)
				.split(',')
				.map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
				.filter(Boolean);
			continue;
		}
		value = value.replace(/^['"]|['"]$/g, '');
		if (value === 'true' || value === 'false') {
			data[key] = value === 'true';
			continue;
		}
		data[key] = value;
	}
	return { data, body: raw.slice(match[0].length) };
}

function slugFromPath(path: string): string {
	return path.split('/').pop()!.replace(/\.md$/, '');
}

function str(v: unknown, fallback = ''): string {
	return typeof v === 'string' ? v : fallback;
}

function readingTime(body: string): number {
	const words = body.trim().split(/\s+/).length;
	return Math.max(1, Math.round(words / 200));
}

function toMeta(path: string, raw: string): { meta: PostMeta; body: string } {
	const { data, body } = parseFrontmatter(raw);
	const slug = slugFromPath(path);
	return {
		meta: {
			slug,
			title: str(data.title, slug),
			date: str(data.date, '1970-01-01'),
			summary: str(data.summary),
			tags: Array.isArray(data.tags) ? data.tags : [],
			draft: data.draft === true,
			readingTime: readingTime(body),
			cover: str(data.cover) || undefined,
			coverAlt: str(data.coverAlt) || undefined
		},
		body
	};
}

/** All published posts, newest first. Drafts are excluded outside of `dev`. */
export function listPosts(includeDrafts = false): PostMeta[] {
	return Object.entries(files)
		.map(([path, raw]) => toMeta(path, raw).meta)
		.filter((p) => includeDrafts || !p.draft)
		.sort((a, b) => b.date.localeCompare(a.date));
}

export function allTags(posts: PostMeta[]): string[] {
	return [...new Set(posts.flatMap((p) => p.tags))].sort();
}

/** Internal: used by blog.server.ts to render a post body. */
export function rawPost(slug: string): { meta: PostMeta; body: string } | null {
	const entry = Object.entries(files).find(([path]) => slugFromPath(path) === slug);
	return entry ? toMeta(entry[0], entry[1]) : null;
}
