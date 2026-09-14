import { dev } from '$app/environment';
import { listPosts } from '$lib/blog';
import { loadProjects } from '$lib/projects.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const { projects } = await loadProjects(fetch);
	return {
		// Featured projects first, then fill to four cards.
		projects: [...projects].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 4),
		posts: listPosts(dev).slice(0, 3)
	};
};
