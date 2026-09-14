/**
 * Single source of truth for every piece of personal content on the site.
 * Edit this file — not the components — to change what the portfolio says.
 */

export type PaletteColor =
	| 'red'
	| 'green'
	| 'yellow'
	| 'blue'
	| 'magenta'
	| 'cyan'
	| 'white'
	| 'bright-red'
	| 'bright-green'
	| 'bright-yellow'
	| 'bright-blue'
	| 'bright-magenta'
	| 'bright-cyan';

export const site = {
	name: 'Mirazul Islam Nahid',
	shortName: 'Nahid',
	handle: 'TheRealNightmare',
	role: 'Software Developer',
	/**
	 * The hero kicker only. `role` stays plain for the page <title>, the resume
	 * badge and anything else a recruiter reads straight.
	 */
	heroKicker: 'Aspiring 10x developer · currently benchmarking at 1.4x',
	tagline: 'Always exploring, always learning, building things as I grow.',
	location: 'Dhaka, Bangladesh',
	company: 'Moner Bondhu',
	companyUrl: 'https://github.com/Moner-Bondhu',
	avatar: 'https://avatars.githubusercontent.com/u/84902415?v=4',
	// Used for canonical URLs and OG tags. Change to your Cloudflare domain.
	url: 'https://mirazulislamnahid.com',
	description:
		'Portfolio and blog of Mirazul Islam Nahid — software developer in Dhaka, Bangladesh, building web applications and teaching himself machine learning by rebuilding it from scratch.'
};

/** Short lines under the hero name. Kept punchy on purpose. */
export const heroLines = ['Always exploring, always learning, building things as I grow.'];

export const about = [
	`I'm a developer in ${site.location}. Most of what I know came from building the thing
	 badly first, then figuring out why it was bad. That's still the method.`,
	`My work splits about evenly between full-stack web — Laravel, Vue, React, and lately
	 SvelteKit — and Python. When something feels like magic, I rebuild it by hand until it
	 doesn't. That's how I ended up writing an autograd engine, and how I ended up training a
	 sentiment model that has to cope with people typing Bengali and English in the same sentence.`,
	`I'd rather ship something small that actually works than plan something large that doesn't.`
];

export type SocialLink = {
	label: string;
	href: string;
	color: PaletteColor;
};

export const socials: SocialLink[] = [
	{ label: 'GitHub', href: 'https://github.com/TheRealNightmare', color: 'green' },
	{ label: 'LinkedIn', href: 'https://linkedin.com/in/therealnightmare/', color: 'blue' },
	{ label: 'X', href: 'https://x.com/nightMARE496', color: 'magenta' }
	// TODO: add an email once you want one public, e.g.
	// { label: 'Email', href: 'mailto:you@example.com', color: 'yellow' }
];

export const skills: { group: string; items: string[]; color: PaletteColor }[] = [
	{
		group: 'Languages',
		items: ['Python', 'TypeScript', 'JavaScript', 'PHP', 'SQL'],
		color: 'yellow'
	},
	{
		group: 'Web',
		items: ['SvelteKit', 'Vue 3', 'React', 'Laravel', 'Tailwind CSS'],
		color: 'cyan'
	},
	{
		group: 'ML & Data',
		items: ['PyTorch', 'Transformers', 'NumPy', 'scikit-learn', 'OpenCV'],
		color: 'magenta'
	},
	{
		group: 'Everything else',
		items: ['Git', 'Docker', 'Linux', 'Raspberry Pi', 'Cloudflare'],
		color: 'green'
	}
];

export type TimelineEntry = {
	title: string;
	org: string;
	period: string;
	description: string;
	color: PaletteColor;
};

// TODO: replace the placeholder dates/descriptions with your real history.
export const experience: TimelineEntry[] = [
	{
		title: 'Software Developer',
		org: 'Moner Bondhu',
		period: 'Present',
		description:
			'Building and maintaining web products. TODO: replace with your actual responsibilities, stack and start date.',
		color: 'green'
	}
];

export const education: TimelineEntry[] = [
	{
		title: 'BSc in Computer Science & Engineering',
		org: 'TODO: your university',
		period: 'TODO: years',
		description: 'TODO: coursework, focus areas, notable results.',
		color: 'blue'
	}
];

/**
 * Ordered allowlist of GitHub repositories to feature on /projects.
 * Data (description, language, stars) is fetched from the GitHub API at build time.
 *
 * Add a project by appending its repo name. Order here is the order on the page.
 *
 * Note: none of your repos currently have GitHub topics set, so this explicit list is
 * used instead of a topic filter. If you start tagging repos with a `portfolio` topic,
 * this list can be swapped for a filter in src/routes/projects/+page.server.ts.
 */
export const projectRepos: string[] = [
	'ScrollSense',
	'PlayerKoi',
	'Verso2.0',
	'RayTracing',
	'micrograd',
	'Laravel-Microservice'
];

export type ProjectOverride = {
	title?: string;
	blurb?: string;
	highlights?: string[];
	/** Flagship projects get a double-width card. */
	featured?: boolean;
	color?: PaletteColor;
};

/**
 * Per-repo presentation, merged over the GitHub API response.
 * Blurbs are written from each repo's README — keep them honest.
 */
export const projectOverrides: Record<string, ProjectOverride> = {
	ScrollSense: {
		title: 'ScrollSense',
		blurb:
			'Reads the mood of your social feed. A browser extension captures the posts you scroll past, a fine-tuned xlm-roberta-base scores each one — it handles Bengali-English code-mixed text, which is most of my timeline — and a dashboard turns months of scrolling into positivity-over-time charts, busiest-hour breakdowns and keyword clouds. One account and one JWT across the extension and the web app.',
		highlights: ['PyTorch', 'Transformers', 'Browser extension', 'Dashboard'],
		featured: true,
		color: 'magenta'
	},
	PlayerKoi: {
		title: 'PlayerKoi',
		blurb:
			'A chess board that watches itself. An overhead camera on a Raspberry Pi 5 tracks a physical game and streams live algebraic notation to a built-in web UI. The trick: it never identifies piece *type*. A 3-class per-square classifier only reports empty/white/black, gated by a cheap motion detector and cross-checked against every legal move — so the software keeps piece identity and vision does the easy half.',
		highlights: ['Raspberry Pi', 'Computer vision', 'python-chess', 'Real-time'],
		featured: true,
		color: 'cyan'
	},
	'Verso2.0': {
		title: 'Verso 2.0',
		blurb:
			'A full-stack digital library. Read EPUB and PDF books straight in the browser, join collaborative reading rooms, get AI recommendations, and moderate the whole thing from a Filament admin panel. React 19 on Laravel 13.',
		highlights: ['React 19', 'Laravel 13', 'EPUB reader', 'Filament'],
		color: 'blue'
	},
	RayTracing: {
		title: 'Ray Tracing',
		blurb:
			'A 2D light-and-shadow simulation in C with SDL2. A glowing circle casts 500 rays in every direction; a second circle drifts up and down and blocks the ones that hit it, carving out a moving shadow you can drag around with the mouse. No renderer, no GPU — every pixel is written straight into the window surface, and the circle test compares squared distances so it never calls sqrt.',
		highlights: ['C', 'SDL2', 'Software rendering', 'Geometry'],
		color: 'green'
	},
	micrograd: {
		title: 'micrograd',
		blurb:
			"Working through Karpathy's backprop video by hand — typing every line, re-deriving the math in the margins, and refusing to move on until a cell actually made sense. Learning in public, mess included.",
		highlights: ['Autograd', 'Backprop', 'Jupyter'],
		color: 'yellow'
	},
	'Laravel-Microservice': {
		title: 'Laravel Microservices',
		blurb:
			'Built purely to understand service architecture: splitting a Laravel monolith apart and making the pieces talk to each other.',
		highlights: ['Laravel', 'Service architecture'],
		color: 'red'
	}
};

export const nav: { label: string; href: string; color: PaletteColor }[] = [
	{ label: 'Home', href: '/', color: 'green' },
	{ label: 'Work', href: '/projects', color: 'yellow' },
	{ label: 'Blog', href: '/blog', color: 'magenta' },
	{ label: 'About', href: '/resume', color: 'cyan' }
];
