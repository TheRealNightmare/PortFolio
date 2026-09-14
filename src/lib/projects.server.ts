import { projectOverrides, projectRepos, site, type PaletteColor } from './config';
import fallbackRepos from './data/repos.fallback.json';

export type Project = {
	name: string;
	title: string;
	description: string;
	language: string | null;
	stars: number;
	url: string;
	homepage: string | null;
	pushedAt: string;
	highlights: string[];
	featured: boolean;
	color: PaletteColor;
};

type GhRepo = {
	name: string;
	description: string | null;
	language: string | null;
	stargazers_count: number;
	html_url: string;
	homepage: string | null;
	pushed_at: string;
};

const FALLBACK_COLORS: PaletteColor[] = ['green', 'blue', 'magenta', 'cyan', 'yellow', 'red'];

async function fetchRepos(fetch: typeof globalThis.fetch): Promise<GhRepo[]> {
	const token = process.env.GITHUB_TOKEN;
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
		'User-Agent': `${site.handle}-portfolio`
	};
	if (token) headers.Authorization = `Bearer ${token}`;

	const res = await fetch(
		`https://api.github.com/users/${site.handle}/repos?per_page=100&sort=pushed`,
		{ headers }
	);
	if (!res.ok) throw new Error(`GitHub API responded ${res.status} ${res.statusText}`);
	return (await res.json()) as GhRepo[];
}

/**
 * Runs during `vite build` because every route is prerendered — visitors never hit
 * the GitHub API. Falls back to a committed snapshot so an API outage or a rate
 * limit cannot break a deploy.
 */
export async function loadProjects(
	fetch: typeof globalThis.fetch
): Promise<{ projects: Project[]; stale: boolean }> {
	let repos: GhRepo[];
	let stale = false;

	try {
		repos = await fetchRepos(fetch);
		console.log(`[projects] fetched ${repos.length} repos from GitHub`);
	} catch (err) {
		console.warn(`[projects] GitHub fetch failed (${err}); using committed snapshot`);
		repos = fallbackRepos as GhRepo[];
		stale = true;
	}

	const byName = new Map(repos.map((r) => [r.name, r]));

	const projects: Project[] = projectRepos.flatMap((name, i) => {
		const repo = byName.get(name);
		if (!repo) {
			console.warn(`[projects] "${name}" is in projectRepos but was not found on GitHub`);
			return [];
		}
		const override = projectOverrides[name] ?? {};
		return [
			{
				name: repo.name,
				title: override.title ?? repo.name,
				description: override.blurb ?? repo.description ?? 'No description yet.',
				language: repo.language,
				stars: repo.stargazers_count,
				url: repo.html_url,
				homepage: repo.homepage || null,
				pushedAt: repo.pushed_at,
				highlights: override.highlights ?? [],
				featured: override.featured ?? false,
				color: override.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]
			}
		];
	});

	return { projects, stale };
}
