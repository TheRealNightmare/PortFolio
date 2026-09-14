<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils.ts';

	/**
	 * A full-bleed horizontal section: a flat colored ground and a centered
	 * content column. Alternating band colors down a page is what gives the site
	 * its rhythm — the color blocks do the work, with no texture layered on top.
	 *
	 * Pass color={undefined} for a plain background band.
	 */
	type BandProps = HTMLAttributes<HTMLElement> & {
		color?: string;
		/** Hard border on the bottom edge. */
		edge?: boolean;
		/** Vertical padding scale. */
		size?: 'sm' | 'default' | 'lg';
		/** Extra classes for the inner content column. */
		innerClass?: string;
		children?: Snippet;
	};

	let {
		color,
		edge = true,
		size = 'default',
		class: className,
		innerClass,
		children,
		...restProps
	}: BandProps = $props();

	const padding = { sm: 'py-8', default: 'py-14', lg: 'py-20 sm:py-28' };
</script>

<section
	data-color={color}
	class={cn(
		'relative',
		color ? 'bg-clr text-on-clr' : 'bg-background text-foreground',
		edge && 'border-b-4 border-border',
		padding[size],
		className
	)}
	{...restProps}
>
	<div class={cn('relative z-10 mx-auto w-full max-w-5xl px-4', innerClass)}>
		{@render children?.()}
	</div>
</section>
