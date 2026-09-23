<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

	import { resolve } from '$app/paths';
	import { site } from '$lib/config';
	import Band from '$lib/components/site/band.svelte';
	import Seo from '$lib/components/site/seo.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { absoluteUrl, graph, personJsonLd } from '$lib/seo';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let formattedDate = $derived.by(() => {
		const d = new Date(data.post.date);
		return Number.isNaN(d.getTime())
			? data.post.date
			: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
	});

	let postUrl = $derived(absoluteUrl(`/blog/${data.post.slug}`));
	let coverAlt = $derived(data.post.coverAlt ?? data.post.title);
</script>

<Seo
	title={data.post.seoTitle ?? data.post.title}
	fullTitle
	description={data.post.seoDescription ?? data.post.summary}
	path="/blog/{data.post.slug}"
	type="article"
	image={data.post.cover
		? { src: data.post.cover, alt: coverAlt, ...data.post.coverSize }
		: undefined}
	jsonLd={graph(
		{
			'@type': 'BlogPosting',
			headline: data.post.seoTitle ?? data.post.title,
			name: data.post.title,
			description: data.post.summary,
			datePublished: data.post.date,
			url: postUrl,
			mainEntityOfPage: postUrl,
			keywords: data.post.tags.join(', '),
			inLanguage: 'en',
			...(data.post.cover && { image: absoluteUrl(data.post.cover) }),
			author: personJsonLd()
		},
		{
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
				{ '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
				{ '@type': 'ListItem', position: 3, name: data.post.title, item: postUrl }
			]
		}
	)}
/>

<article>
	<Band color="magenta">
		<Button
			href={resolve('/blog')}
			size="sm"
			color="white"
			class="mb-6 font-mono text-xs uppercase"
		>
			<ArrowLeftIcon />All posts
		</Button>

		<h1
			class="font-display mb-4 text-[clamp(1.9rem,6vw,3.75rem)] leading-[0.95] tracking-tighter uppercase"
		>
			{data.post.title}
		</h1>

		<p class="max-w-2xl text-base font-bold">{data.post.summary}</p>

		<div class="mt-5 flex flex-wrap items-center gap-2 font-mono text-xs uppercase">
			<time datetime={data.post.date}>{formattedDate}</time>
			<span>· {data.post.readingTime} min read</span>
			{#each data.post.tags as tag (tag)}
				<Badge color="white" class="font-mono text-[0.65rem]">#{tag}</Badge>
			{/each}
			{#if data.post.draft}
				<Badge color="red" class="font-mono text-[0.65rem]">draft</Badge>
			{/if}
		</div>
	</Band>

	<Band edge={false} innerClass="max-w-3xl">
		{#if data.post.cover}
			<img
				src={data.post.cover}
				alt={coverAlt}
				class="mb-8 h-auto w-full border-2 border-border shadow-shadow"
				width={data.post.coverSize?.width}
				height={data.post.coverSize?.height}
				fetchpriority="high"
			/>
		{/if}
		<!-- Rendered from your own markdown at build time. -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="post-body">{@html data.post.html}</div>
	</Band>
</article>

<Band color="yellow" edge={false} size="sm">
	<nav class="flex flex-col gap-3 sm:flex-row sm:justify-between" aria-label="More posts">
		{#if data.prev}
			<Button
				href={resolve(`/blog/[slug]`, { slug: data.prev.slug })}
				color="white"
				class="font-mono text-xs uppercase sm:max-w-[48%]"
			>
				<ArrowLeftIcon /><span class="truncate">{data.prev.title}</span>
			</Button>
		{:else}
			<span></span>
		{/if}
		{#if data.next}
			<Button
				href={resolve(`/blog/[slug]`, { slug: data.next.slug })}
				color="white"
				class="font-mono text-xs uppercase sm:ml-auto sm:max-w-[48%]"
			>
				<span class="truncate">{data.next.title}</span><ArrowRightIcon />
			</Button>
		{/if}
	</nav>
	<p class="mt-6 text-center font-mono text-sm">
		Liked this? See <a class="font-bold neoretro-link" href={resolve('/projects')}
			>what I've built</a
		>
		or <a class="font-bold neoretro-link" href={resolve('/resume')}>who wrote it</a>.
	</p>
</Band>

<style>
	/* Markdown output styling, built only from neo-retro theme tokens. */
	.post-body {
		font-size: 1.0625rem;
	}

	.post-body :global(p),
	.post-body :global(ul),
	.post-body :global(ol),
	.post-body :global(blockquote),
	.post-body :global(pre),
	.post-body :global(table) {
		margin-block: 1.15rem;
	}

	.post-body :global(p),
	.post-body :global(li) {
		line-height: 1.75;
	}

	.post-body :global(h2) {
		text-transform: uppercase;
		letter-spacing: -0.03em;
	}

	.post-body :global(ul) {
		list-style: square;
		padding-left: 1.5rem;
	}

	.post-body :global(ol) {
		list-style: decimal;
		padding-left: 1.5rem;
	}

	.post-body :global(a) {
		font-weight: 700;
		text-decoration-line: underline;
		text-decoration-style: wavy;
		text-underline-offset: 2px;
		/* Long bare URLs would otherwise push the page sideways on narrow phones. */
		overflow-wrap: anywhere;
	}

	.post-body :global(blockquote) {
		border: 2px solid var(--color-border);
		border-left-width: 8px;
		background: var(--color-yellow);
		color: var(--color-on-yellow);
		box-shadow: var(--shadow-shadow);
		padding: 1rem 1.25rem;
		font-weight: 700;
	}

	.post-body :global(img) {
		border: 2px solid var(--color-border);
		box-shadow: var(--shadow-shadow);
		max-width: 100%;
	}

	.post-body :global(:not(pre) > code) {
		border: 2px solid var(--color-border);
		border-radius: 4px;
		background: var(--color-bright-white);
		color: var(--color-on-bright-white);
		padding: 0.05rem 0.35rem;
		font-size: 0.875em;
		font-weight: 600;
	}

	/* Shiki output — heavier neo-retro frame. */
	.post-body :global(pre.shiki) {
		border: 3px solid var(--color-border);
		box-shadow: 6px 6px 0 0 var(--color-border);
		border-radius: 4px;
		padding: 1.15rem;
		overflow-x: auto;
		font-size: 0.9rem;
	}

	.post-body :global(pre.shiki code) {
		border: none;
		background: none;
		padding: 0;
	}

	/* Site is light-only, so use Shiki's light variant. */
	.post-body :global(pre.shiki),
	.post-body :global(pre.shiki span) {
		color: var(--shiki-light);
		background-color: var(--shiki-light-bg);
	}

	.post-body :global(table) {
		width: 100%;
		border-collapse: collapse;
		display: block;
		overflow-x: auto;
	}

	.post-body :global(th),
	.post-body :global(td) {
		border: 2px solid var(--color-border);
		padding: 0.5rem 0.75rem;
		text-align: left;
	}

	.post-body :global(th) {
		background: var(--color-cyan);
		color: var(--color-on-cyan);
		text-transform: uppercase;
		font-size: 0.8rem;
		letter-spacing: 0.05em;
	}

	.post-body :global(hr) {
		border: none;
		border-top: 4px solid var(--color-border);
		margin-block: 2.5rem;
	}
</style>
