<script lang="ts">
	import SearchIcon from '@lucide/svelte/icons/search';

	import { resolve } from '$app/paths';
	import { site } from '$lib/config';
	import Band from '$lib/components/site/band.svelte';
	import SectionTitle from '$lib/components/site/section-title.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Pagination from '$lib/components/ui/pagination';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const PER_PAGE = 6;

	let query = $state('');
	let activeTag = $state<string | null>(null);
	let currentPage = $state(1);

	let filtered = $derived(
		data.posts.filter((post) => {
			const matchesTag = !activeTag || post.tags.includes(activeTag);
			const q = query.trim().toLowerCase();
			const matchesQuery =
				!q ||
				post.title.toLowerCase().includes(q) ||
				post.summary.toLowerCase().includes(q) ||
				post.tags.some((t) => t.toLowerCase().includes(q));
			return matchesTag && matchesQuery;
		})
	);

	// Reset to the first page whenever the filters change the result set.
	$effect(() => {
		void filtered.length;
		currentPage = 1;
	});

	let visible = $derived(filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE));

	const cardColors = ['white', 'cyan', 'yellow', 'green', 'blue'] as const;

	function toggleTag(tag: string) {
		activeTag = activeTag === tag ? null : tag;
	}

	function clearFilters() {
		query = '';
		activeTag = null;
	}

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return Number.isNaN(d.getTime())
			? iso
			: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>Blog · {site.name}</title>
	<meta
		name="description"
		content="Writing by {site.name} on web development, machine learning, and rebuilding things until they make sense."
	/>
</svelte:head>

<Band color="magenta">
	<SectionTitle kicker="the notebook" level={1}>Things I wrote</SectionTitle>
	<p class="mt-5 max-w-2xl text-base font-bold sm:text-lg">
		Notes from whatever I'm currently confused about. Mostly web development and machine learning,
		written the way I'd explain it to myself six months ago.
	</p>
</Band>

<Band edge={false} size="lg">
	<div class="mb-8 flex flex-col gap-4">
		<InputGroup.Root class="max-w-sm">
			<InputGroup.Addon>
				<SearchIcon />
			</InputGroup.Addon>
			<InputGroup.Input
				placeholder="Search posts…"
				bind:value={query}
				aria-label="Search posts"
				class="font-mono"
			/>
		</InputGroup.Root>

		{#if data.tags.length}
			<div class="flex flex-wrap gap-2">
				{#each data.tags as tag (tag)}
					<Button
						size="sm"
						color={activeTag === tag ? 'magenta' : 'white'}
						aria-pressed={activeTag === tag}
						class="font-mono text-xs uppercase"
						onclick={() => toggleTag(tag)}
					>
						#{tag}
					</Button>
				{/each}
			</div>
		{/if}
	</div>

	{#if visible.length === 0}
		<div class="py-16 text-center">
			<p class="mb-4 font-mono text-sm">Nothing matches that.</p>
			<Button color="white" class="font-mono text-xs uppercase" onclick={clearFilters}>
				Clear the filters
			</Button>
		</div>
	{:else}
		<div class="sticker-grid grid gap-7">
			{#each visible as post, i (post.slug)}
				<Card.Root color={cardColors[i % cardColors.length]} class="sticker">
					{#if post.cover}
						<a
							href={resolve(`/blog/[slug]`, { slug: post.slug })}
							tabindex="-1"
							aria-hidden="true"
							class="mx-6 block border-2 border-border"
						>
							<img
								src={post.cover}
								alt=""
								class="aspect-[16/9] w-full max-w-full object-cover"
								loading="lazy"
							/>
						</a>
					{/if}
					<Card.Header>
						<Card.Title class="font-display text-2xl tracking-tight uppercase">
							<a class="neoretro-link" href={resolve(`/blog/[slug]`, { slug: post.slug })}>
								{post.title}
							</a>
						</Card.Title>
						<Card.Description class="text-sm leading-relaxed">{post.summary}</Card.Description>
					</Card.Header>
					<Card.Footer class="flex-wrap gap-2 font-mono text-xs uppercase">
						<time class="opacity-70" datetime={post.date}>{formatDate(post.date)}</time>
						<span class="opacity-70">· {post.readingTime} min</span>
						{#each post.tags as tag (tag)}
							<Badge color="white" class="font-mono text-[0.65rem]">#{tag}</Badge>
						{/each}
						{#if post.draft}
							<Badge color="red" class="font-mono text-[0.65rem]">draft</Badge>
						{/if}
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{/if}

	{#if filtered.length > PER_PAGE}
		<div class="mt-12">
			<Pagination.Root
				count={filtered.length}
				perPage={PER_PAGE}
				bind:page={currentPage}
				activeColor="magenta"
				inactiveColor="white"
			>
				{#snippet children({ pages, currentPage: active })}
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.Previous />
						</Pagination.Item>
						{#each pages as p (p.key)}
							{#if p.type === 'ellipsis'}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link page={p} isActive={active === p.value}>
										{p.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.Next />
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		</div>
	{/if}
</Band>
