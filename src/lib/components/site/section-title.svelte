<script lang="ts">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/utils.ts';

	/**
	 * Display heading with the neo-retro hard-shadow treatment.
	 * `kicker` renders a small mono label above it.
	 */
	type Props = {
		kicker?: string;
		level?: 1 | 2 | 3;
		class?: string;
		children?: Snippet;
	};

	let { kicker, level = 2, class: className, children }: Props = $props();

	const sizes = {
		1: 'text-4xl sm:text-6xl',
		2: 'text-3xl sm:text-5xl',
		3: 'text-2xl sm:text-3xl'
	};
</script>

<!-- Wrapped so the kicker and heading stay one unit inside flex parents. -->
<div>
	{#if kicker}
		<p class="mb-2 font-mono text-xs font-bold tracking-[0.25em] uppercase opacity-70">
			{kicker}
		</p>
	{/if}

	<svelte:element
		this={`h${level}`}
		class={cn(
			'font-display mt-0 mb-0 leading-[0.95] tracking-tighter uppercase',
			sizes[level],
			className
		)}
	>
		{@render children?.()}
	</svelte:element>
</div>
