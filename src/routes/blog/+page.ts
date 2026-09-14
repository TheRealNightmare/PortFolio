import { dev } from '$app/environment';
import { allTags, listPosts } from '$lib/blog';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	const posts = listPosts(dev);
	return { posts, tags: allTags(posts) };
};
