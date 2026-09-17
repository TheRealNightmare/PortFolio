<script lang="ts">
	// Self-hosted fonts — no runtime request to a font CDN, no layout shift.
	import '@fontsource/archivo-black';
	import '@fontsource-variable/space-grotesk';
	import '@fontsource-variable/jetbrains-mono';
	import './app.css';

	import MenuIcon from '@lucide/svelte/icons/menu';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	import favicon from '$lib/assets/favicon.svg';
	import { nav, site, socials } from '$lib/config';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import MorseButton from '$lib/components/site/morse-button.svelte';
	import { ThemeInit } from '$lib/components/ui/style';

	let { children } = $props();

	let mobileOpen = $state(false);
	let arcade = $state(false);

	function isActive(href: string): boolean {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}

	// Easter egg: the Konami code cranks everything up a notch.
	const KONAMI = [
		'ArrowUp',
		'ArrowUp',
		'ArrowDown',
		'ArrowDown',
		'ArrowLeft',
		'ArrowRight',
		'ArrowLeft',
		'ArrowRight',
		'b',
		'a'
	];
	let progress = 0;

	function onKeydown(event: KeyboardEvent) {
		const expected = KONAMI[progress];
		const key = expected.length === 1 ? event.key.toLowerCase() : event.key;
		progress = key === expected ? progress + 1 : key === KONAMI[0] ? 1 : 0;
		if (progress === KONAMI.length) {
			progress = 0;
			arcade = !arcade;
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:window onkeydown={onKeydown} />

<ThemeInit>
	<div class="flex min-h-screen flex-col" class:arcade>
		<header class="sticky top-0 z-40 neoretro-border-b bg-background">
			<div class="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
				<a
					href={resolve('/')}
					class="font-display neoretro-focus mr-auto text-lg tracking-tighter uppercase"
				>
					{site.shortName}<span class="text-red">_</span>
				</a>

				<nav class="hidden items-center gap-2 sm:flex" aria-label="Main">
					{#each nav as item (item.href)}
						<Button
							href={item.href}
							size="sm"
							color={isActive(item.href) ? item.color : 'white'}
							aria-current={isActive(item.href) ? 'page' : undefined}
							class="font-mono text-xs tracking-wider uppercase"
						>
							{item.label}
						</Button>
					{/each}
				</nav>

				<MorseButton />

				<Sheet.Root bind:open={mobileOpen}>
					<Sheet.Trigger class="sm:hidden">
						{#snippet child({ props })}
							<Button {...props} size="icon-sm" color="white" aria-label="Open menu">
								<MenuIcon />
							</Button>
						{/snippet}
					</Sheet.Trigger>
					<Sheet.Content side="right" color="white" class="w-64">
						<Sheet.Header>
							<Sheet.Title class="font-display tracking-tighter uppercase">Menu</Sheet.Title>
						</Sheet.Header>
						<nav class="flex flex-col gap-2 px-4 pb-4" aria-label="Mobile">
							{#each nav as item (item.href)}
								<Button
									href={item.href}
									color={isActive(item.href) ? item.color : 'white'}
									class="font-mono tracking-wider uppercase"
									onclick={() => (mobileOpen = false)}
								>
									{item.label}
								</Button>
							{/each}
						</nav>
					</Sheet.Content>
				</Sheet.Root>
			</div>
		</header>

		<main class="flex-1">
			{@render children?.()}
		</main>

		<footer data-color="black" class="border-t-4 border-border bg-clr text-on-clr">
			<div
				class="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center"
			>
				<div class="mr-auto">
					<p class="font-display text-xl tracking-tighter uppercase">{site.name}</p>
					<p class="mt-1 font-mono text-xs opacity-70">
						{site.location} · built with SvelteKit &amp; neo-retro · © {new Date().getFullYear()}
					</p>
					<p class="mt-1 font-mono text-xs opacity-50">psst... try the Konami code.</p>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each socials as link (link.href)}
						<Button
							href={link.href}
							size="sm"
							color={link.color}
							target={link.href.startsWith('mailto:') ? undefined : '_blank'}
							rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
							class="font-mono text-xs tracking-wider uppercase"
						>
							{link.label}
						</Button>
					{/each}
				</div>
			</div>
		</footer>
	</div>
</ThemeInit>
