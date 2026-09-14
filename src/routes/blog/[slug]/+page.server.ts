import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { listPosts } from '$lib/blog';
import { getPost } from '$lib/blog.server';
import type { EntryGenerator, PageServerLoad } from './$types';

// Tells adapter-static which slugs to prerender.
export const entries: EntryGenerator = () => listPosts(dev).map((post) => ({ slug: post.slug }));

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPost(params.slug);
	if (!post || (post.draft && !dev)) error(404, `No post named "${params.slug}"`);

	const posts = listPosts(dev);
	const index = posts.findIndex((p) => p.slug === post.slug);

	return {
		post,
		prev: index > 0 ? posts[index - 1] : null,
		next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null
	};
};
