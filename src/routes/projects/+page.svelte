<script lang="ts">
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import GithubIcon from '@lucide/svelte/icons/github';
	import StarIcon from '@lucide/svelte/icons/star';

	import { resolve } from '$app/paths';
	import { site } from '$lib/config';
	import { absoluteUrl, graph, personJsonLd } from '$lib/seo';
	import Band from '$lib/components/site/band.svelte';
	import SectionTitle from '$lib/components/site/section-title.svelte';
	import Seo from '$lib/components/site/seo.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let totalStars = $derived(data.projects.reduce((sum, p) => sum + p.stars, 0));
</script>

<Seo
	title="Projects"
	description="Projects by {site.name}: a Raspberry Pi chess vision system, a Bengali-English sentiment model, a full-stack digital library and more."
	path="/projects"
	jsonLd={graph(
		{
			'@type': 'CollectionPage',
			name: `Projects · ${site.name}`,
			url: absoluteUrl('/projects'),
			mainEntity: {
				'@type': 'ItemList',
				itemListElement: data.projects.map((project, i) => ({
					'@type': 'ListItem',
					position: i + 1,
					item: {
						'@type': 'SoftwareSourceCode',
						name: project.title,
						description: project.description,
						codeRepository: project.url,
						...(project.language && { programmingLanguage: project.language }),
						author: { '@id': personJsonLd()['@id'] }
					}
				}))
			}
		},
		personJsonLd()
	)}
/>

<Band color="yellow">
	<SectionTitle kicker="the work" level={1}>Things I built</SectionTitle>
	<p class="mt-5 max-w-2xl text-base font-bold sm:text-lg">
		Some of these solve a real problem. Some exist because I wanted to know how something worked and
		reading about it wasn't enough. Stars and languages come straight from GitHub every time the
		site rebuilds, so nothing here is inflated.
	</p>
	<div class="mt-6 flex flex-wrap gap-2 font-mono text-xs">
		<Badge color="white">{data.projects.length} projects</Badge>
		<Badge color="white"><StarIcon />{totalStars} stars</Badge>
		<Badge color="white">Data fetched at build time</Badge>
	</div>
</Band>

<Band edge={false} size="lg">
	{#if data.stale}
		<Alert.Root color="red" class="mb-8">
			<Alert.Title class="font-display uppercase">Showing a cached snapshot</Alert.Title>
			<Alert.Description>
				GitHub was unreachable during the last build, so the stars and languages below may be a
				little out of date. The projects are real either way.
			</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="sticker-grid grid gap-7 sm:grid-cols-2">
		{#each data.projects as project (project.name)}
			<Card.Root
				color={project.color}
				class="sticker flex h-full flex-col {project.featured ? 'sticker-flat sm:col-span-2' : ''}"
			>
				<Card.Header>
					<div class="flex flex-wrap items-start justify-between gap-3">
						<Card.Title
							class="font-display tracking-tight uppercase {project.featured
								? 'text-3xl sm:text-4xl'
								: 'text-2xl'}"
						>
							<h2 class="heading-inherit">{project.title}</h2>
						</Card.Title>
						{#if project.featured}
							<Badge color="white" class="font-mono text-[0.65rem] uppercase">Flagship</Badge>
						{/if}
					</div>
					<Card.Description class="leading-relaxed {project.featured ? 'text-base' : 'text-sm'}">
						{project.description}
					</Card.Description>
				</Card.Header>

				<Card.Content class="flex flex-wrap items-start gap-2">
					{#if project.language}
						<Badge color="white" class="font-mono text-xs">{project.language}</Badge>
					{/if}
					{#if project.stars > 0}
						<Badge color="white" class="font-mono text-xs"><StarIcon />{project.stars}</Badge>
					{/if}
					{#each project.highlights as highlight (highlight)}
						<Badge color="white" class="font-mono text-[0.65rem] uppercase">{highlight}</Badge>
					{/each}
				</Card.Content>

				<Card.Footer class="mt-auto flex-wrap gap-2">
					<Button
						href={project.url}
						size="sm"
						color="white"
						target="_blank"
						rel="noreferrer"
						class="font-mono text-xs uppercase"
					>
						<GithubIcon />Source
					</Button>
					{#if project.homepage}
						<Button
							href={project.homepage}
							size="sm"
							color="white"
							target="_blank"
							rel="noreferrer"
							class="font-mono text-xs uppercase"
						>
							<ExternalLinkIcon />Live
						</Button>
					{/if}
					{#if project.post}
						<Button
							href={resolve(`/blog/[slug]`, { slug: project.post })}
							size="sm"
							color="white"
							class="font-mono text-xs uppercase"
						>
							<FileTextIcon />Read the write-up
						</Button>
					{/if}
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>

	<p class="mt-12 text-center font-mono text-sm">
		The rest of the mess lives on
		<a
			class="font-bold neoretro-link"
			href="https://github.com/{site.handle}"
			target="_blank"
			rel="noreferrer">github.com/{site.handle}</a
		>.
	</p>
</Band>
