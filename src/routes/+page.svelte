<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import { onMount } from 'svelte';

	import { resolve } from '$app/paths';
	import { about, heroLines, site, skills, socials } from '$lib/config';
	import Band from '$lib/components/site/band.svelte';
	import HeroArt from '$lib/components/site/hero-art.svelte';
	import SectionTitle from '$lib/components/site/section-title.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// The name is split so each letter can be colored and staggered.
	// Most letters use the band's own contrast color (`text-on-clr`) so the name
	// stays legible in every one of the 127 light themes; only a few are accented,
	// and those use the bright-* ramp, which is guaranteed to read on any ground.
	const accents: Record<number, string> = {
		0: 'text-bright-yellow',
		3: 'text-bright-magenta',
		6: 'text-bright-cyan'
	};
	const nameLines = ['MIRAZUL', 'ISLAM', 'NAHID'];
	// Running letter index across all lines, so the accent ramp and the intro
	// stagger continue unbroken from one line to the next.
	const lineOffsets = nameLines.map((_, i) =>
		nameLines.slice(0, i).reduce((n, line) => n + line.length, 0)
	);

	function letterClass(i: number): string {
		return accents[i % 7] ?? 'text-on-clr';
	}

	// Intro plays once per browser session, and never for reduced-motion users.
	// Applied after mount so the prerendered HTML is complete and visible without JS.
	let intro = $state(false);

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let seen: boolean;
		try {
			seen = sessionStorage.getItem('intro-played') === '1';
			sessionStorage.setItem('intro-played', '1');
		} catch {
			// Private mode / blocked storage: just skip the intro.
			seen = true;
		}
		if (!reduced && !seen) intro = true;
	});
</script>

<svelte:head>
	<title>{site.name} · {site.role}</title>
	<meta name="description" content={site.description} />
</svelte:head>

<!-- HERO -->
<Band color="blue" size="lg">
	<!-- Two columns from lg up: the name and copy on the left, the full-size
	     animated badge on the right. Below lg the column drops out and a compact
	     badge rides beside the name instead. -->
	<div class="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
		<div class:intro>
			<p class="mb-4 font-mono text-xs font-bold tracking-[0.3em] uppercase sm:text-sm">
				{site.heroKicker} · {site.location}
			</p>

			<!-- Below lg the badge rides next to the name in its compact size; the
			     full-size one in the right-hand column takes over from lg up. -->
			<div class="mb-6 flex items-center gap-4">
				<h1
					class="font-display text-[clamp(2.25rem,9vw,5.25rem)] leading-[0.95] tracking-tight uppercase [text-shadow:4px_4px_0_var(--color-border)]"
				>
					{#each nameLines as line, l (line)}
						<span class="block">
							{#each line.split('') as letter, i (i)}
								<span
									class="hero-letter inline-block {letterClass(lineOffsets[l] + i)}"
									style="--i: {lineOffsets[l] + i}">{letter}</span
								>
							{/each}
						</span>
					{/each}
				</h1>

				<div class="ml-auto shrink-0 lg:hidden">
					<HeroArt size="sm" />
				</div>
			</div>

			<div class="max-w-2xl space-y-2">
				{#each heroLines as line (line)}
					<p class="text-base font-bold sm:text-lg">{line}</p>
				{/each}
			</div>

			<div class="mt-8 flex flex-wrap gap-3">
				<Button href={resolve('/projects')} color="yellow" size="lg" class="font-display uppercase">
					See the work<ArrowRightIcon />
				</Button>
				<Button href={resolve('/blog')} color="magenta" size="lg" class="font-display uppercase">
					Read the blog
				</Button>
				<Button href={resolve('/resume')} color="white" size="lg" class="font-display uppercase">
					Who am I
				</Button>
			</div>
		</div>

		<div class="hidden lg:block">
			<HeroArt />
		</div>
	</div>
</Band>

<!-- SELECTED WORK -->
<Band>
	<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
		<SectionTitle kicker="01 — selected">Things I built</SectionTitle>
		<Button href={resolve('/projects')} color="white" class="font-mono text-xs uppercase">
			All of them<ArrowRightIcon />
		</Button>
	</div>

	<div class="sticker-grid grid gap-6 sm:grid-cols-2">
		{#each data.projects as project (project.name)}
			<Card.Root
				color={project.color}
				class="sticker flex h-full flex-col {project.featured ? 'sticker-flat sm:col-span-2' : ''}"
			>
				<Card.Header>
					<Card.Title class="font-display text-2xl tracking-tight uppercase">
						{project.title}
					</Card.Title>
					<Card.Description class="text-sm leading-relaxed">
						{project.description}
					</Card.Description>
				</Card.Header>
				<Card.Footer class="mt-auto flex-wrap gap-2">
					{#each project.highlights.slice(0, 4) as highlight (highlight)}
						<Badge color="white" class="font-mono text-[0.65rem] uppercase">{highlight}</Badge>
					{/each}
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
</Band>

<!-- ABOUT -->
<Band color="yellow">
	<div class="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
		<div>
			<SectionTitle kicker="02 — the person">Hello, I'm Nahid</SectionTitle>
			<div class="mt-6 max-w-2xl space-y-4 text-base leading-relaxed">
				{#each about as paragraph, i (i)}
					<p>{paragraph}</p>
				{/each}
			</div>
		</div>
		<div class="flex flex-wrap gap-2 sm:flex-col sm:items-end">
			<Badge color="white" class="font-mono"><MapPinIcon />{site.location}</Badge>
			<Badge color="green" class="font-mono">Open to work</Badge>
			<Badge color="cyan" class="font-mono" href={site.companyUrl}>@{site.company}</Badge>
		</div>
	</div>
</Band>

<!-- SKILLS -->
<Band>
	<SectionTitle kicker="03 — the toolbox">Currently obsessed with</SectionTitle>
	<div class="sticker-grid mt-8 grid gap-6 sm:grid-cols-2">
		{#each skills as group (group.group)}
			<Card.Root color={group.color} class="sticker">
				<Card.Header>
					<Card.Title class="font-display text-xl tracking-tight uppercase">
						{group.group}
					</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-wrap gap-2">
					{#each group.items as item (item)}
						<Badge color="white" class="font-mono text-xs">{item}</Badge>
					{/each}
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</Band>

<!-- WRITING -->
{#if data.posts.length}
	<Band color="magenta">
		<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
			<SectionTitle kicker="04 — the notebook">Lately I wrote</SectionTitle>
			<Button href={resolve('/blog')} color="white" class="font-mono text-xs uppercase">
				Every post<ArrowRightIcon />
			</Button>
		</div>

		<div class="sticker-grid grid gap-6">
			{#each data.posts as post (post.slug)}
				<Card.Root color="white" class="sticker">
					<Card.Header>
						<Card.Title class="font-display text-xl tracking-tight uppercase">
							<a class="neoretro-link" href={resolve(`/blog/[slug]`, { slug: post.slug })}>
								{post.title}
							</a>
						</Card.Title>
						<Card.Description>{post.summary}</Card.Description>
					</Card.Header>
					<Card.Footer class="gap-2 font-mono text-xs uppercase opacity-70">
						<time datetime={post.date}>{post.date}</time>
						<span>·</span>
						<span>{post.readingTime} min</span>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	</Band>
{/if}

<!-- CONTACT -->
<Band color="green" edge={false} size="lg">
	<SectionTitle kicker="05 — say hi">Let's build something</SectionTitle>
	<p class="mt-4 max-w-xl text-base font-bold">
		If you wanna build something together, just knock me up — no contact form, no autoresponder.
		Pick whichever of these you already have open and say hi.
	</p>
	<div class="mt-8 flex flex-wrap gap-3">
		{#each socials as link (link.href)}
			<Button
				href={link.href}
				color={link.color}
				size="lg"
				target="_blank"
				rel="noreferrer"
				class="font-display uppercase"
			>
				{link.label}
			</Button>
		{/each}
	</div>
</Band>
