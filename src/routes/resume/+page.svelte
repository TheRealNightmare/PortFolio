<script lang="ts">
	import DownloadIcon from '@lucide/svelte/icons/download';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';

	import { about, education, experience, site, skills, socials } from '$lib/config';
	import Band from '$lib/components/site/band.svelte';
	import SectionTitle from '$lib/components/site/section-title.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	const timeline = [
		{ heading: 'Where I work', entries: experience },
		{ heading: 'Where I studied', entries: education }
	];
</script>

<svelte:head>
	<title>About · {site.name}</title>
	<meta name="description" content="Experience, education and skills of {site.name}." />
</svelte:head>

<Band color="green">
	<SectionTitle kicker="the résumé" level={1}>Who am I</SectionTitle>
	<div class="mt-6 max-w-2xl space-y-4 text-base leading-relaxed font-bold">
		{#each about as paragraph, i (i)}
			<p>{paragraph}</p>
		{/each}
	</div>

	<div class="mt-6 flex flex-wrap gap-2 font-mono text-xs">
		<Badge color="white"><MapPinIcon />{site.location}</Badge>
		<Badge color="white">{site.role}</Badge>
		<Badge color="white" href={site.companyUrl}>@{site.company}</Badge>
	</div>

	<div class="mt-8 flex flex-wrap gap-3">
		<!-- Drop your PDF at static/cv.pdf to replace the placeholder. -->
		<Button href="/cv.pdf" color="yellow" size="lg" download class="font-display uppercase">
			<DownloadIcon />Grab the CV
		</Button>
		{#each socials as link (link.href)}
			<Button
				href={link.href}
				color="white"
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

<!-- TIMELINE -->
<Band>
	{#each timeline as group, gi (group.heading)}
		<div class:mt-16={gi > 0}>
			<SectionTitle kicker={`0${gi + 1} — history`}>{group.heading}</SectionTitle>

			<ol class="mt-8 space-y-8 border-l-4 border-border pl-6 sm:pl-8">
				{#each group.entries as entry (entry.title + entry.org)}
					<li class="relative">
						<!-- Node on the line -->
						<span
							data-color={entry.color}
							class="absolute top-2 -left-[calc(1.5rem+0.5rem)] size-4 rounded-full border-4 border-border bg-clr sm:-left-[calc(2rem+0.5rem)]"
							aria-hidden="true"
						></span>

						<Card.Root color={entry.color}>
							<Card.Header>
								<div class="flex flex-wrap items-baseline justify-between gap-2">
									<Card.Title class="font-display text-xl tracking-tight uppercase">
										{entry.title}
									</Card.Title>
									<Badge color="white" class="font-mono text-[0.65rem] uppercase">
										{entry.period}
									</Badge>
								</div>
								<Card.Description class="font-mono text-sm">{entry.org}</Card.Description>
							</Card.Header>
							<Card.Content>
								<p class="text-sm leading-relaxed">{entry.description}</p>
							</Card.Content>
						</Card.Root>
					</li>
				{/each}
			</ol>
		</div>
	{/each}
</Band>

<!-- SKILLS -->
<Band color="blue">
	<SectionTitle kicker="03 — the toolbox">What I reach for</SectionTitle>
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

<!-- CONTACT -->
<Band color="yellow" edge={false} size="lg">
	<SectionTitle kicker="04 — say hi">Still reading?</SectionTitle>
	<p class="mt-4 max-w-xl text-base font-bold">
		Then you probably want to talk. I'm open to interesting work — pick a link, I read all of them.
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
