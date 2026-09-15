<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';

	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Band from '$lib/components/site/band.svelte';
	import { Button } from '$lib/components/ui/button';

	const quips: Record<number, string> = {
		404: "This page doesn't exist. It might never have. I've checked twice.",
		500: 'Something broke on my end. Genuinely my fault, not yours.'
	};

	let quip = $derived(quips[page.status] ?? 'Well, that was unexpected.');
	// Never reuse the band's own color here, or a digit disappears into the ground.
	const digitColors = ['text-on-clr', 'text-bright-yellow', 'text-bright-cyan'];
</script>

<svelte:head>
	<title>{page.status} · Nothing here</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<Band color="red" size="lg">
	<p class="mb-4 font-mono text-xs font-bold tracking-[0.3em] uppercase">Error</p>

	<h1 class="font-display mb-6 text-[clamp(5rem,26vw,14rem)] leading-[0.8] tracking-tighter">
		{#each String(page.status).split('') as digit, i (i)}
			<span class="inline-block {digitColors[i % digitColors.length]}">{digit}</span>
		{/each}
	</h1>

	<p class="max-w-xl text-lg font-bold">{quip}</p>
	{#if page.error?.message && page.status !== 404}
		<p class="mt-2 font-mono text-sm opacity-80">{page.error.message}</p>
	{/if}

	<div class="mt-8 flex flex-wrap gap-3">
		<Button href={resolve('/')} color="white" size="lg" class="font-display uppercase">
			<ArrowLeftIcon />Take me home
		</Button>
		<Button href={resolve('/projects')} color="yellow" size="lg" class="font-display uppercase">
			See the work instead
		</Button>
	</div>
</Band>
