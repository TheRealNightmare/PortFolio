import { site } from '$lib/config';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(`User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`, {
		headers: { 'Content-Type': 'text/plain' }
	});
