<script lang="ts">
	import { site } from '$lib/config';
	import { absoluteUrl } from '$lib/seo';

	/**
	 * Everything a page puts in <head> for search engines and link previews:
	 * title, description, canonical, Open Graph, Twitter card and JSON-LD.
	 */
	type Props = {
		/** Page name; rendered as "title · site name" unless `fullTitle` is set. */
		title: string;
		/** Use `title` verbatim, without the site-name suffix. */
		fullTitle?: boolean;
		/** Aim for 120–160 characters: that's what Google shows. */
		description: string;
		/** Path of this page, e.g. `/blog`. Becomes the canonical URL. */
		path: string;
		type?: 'website' | 'article';
		image?: { src: string; alt: string; width?: number; height?: number };
		jsonLd?: object;
	};

	let {
		title,
		fullTitle = false,
		description,
		path,
		type = 'website',
		image = { src: site.ogImage, alt: `${site.name}, ${site.role}`, width: 1200, height: 630 },
		jsonLd
	}: Props = $props();

	let pageTitle = $derived(fullTitle ? title : `${title} · ${site.name}`);
	let canonical = $derived(absoluteUrl(path));

	// `<` is escaped so no string in the data can close the script tag early.
	let jsonLdScript = $derived(
		jsonLd
			? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</` +
					'script>'
			: ''
	);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={absoluteUrl(image.src)} />
	<meta property="og:image:alt" content={image.alt} />
	{#if image.width && image.height}
		<meta property="og:image:width" content={String(image.width)} />
		<meta property="og:image:height" content={String(image.height)} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:creator" content={site.twitter} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={absoluteUrl(image.src)} />
	<meta name="twitter:image:alt" content={image.alt} />

	{#if jsonLdScript}
		<!-- Built from config and post frontmatter at build time, never user input. -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html jsonLdScript}
	{/if}
</svelte:head>
