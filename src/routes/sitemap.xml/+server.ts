import { listPosts } from '$lib/blog';
import { nav, site } from '$lib/config';
import type { RequestHandler } from './$types';

export const prerender = true;

/** Every indexable page: the nav targets plus each published post. Drafts never appear. */
export const GET: RequestHandler = () => {
	const posts = listPosts();
	const newest = posts[0]?.date;

	const urls = [
		...nav.map((item) => ({
			loc: `${site.url}${item.href === '/' ? '/' : item.href}`,
			lastmod: item.href === '/blog' ? newest : undefined
		})),
		...posts.map((post) => ({ loc: `${site.url}/blog/${post.slug}`, lastmod: post.date }))
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(u) => `	<url>
		<loc>${u.loc}</loc>${u.lastmod ? `\n\t\t<lastmod>${u.lastmod}</lastmod>` : ''}
	</url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
