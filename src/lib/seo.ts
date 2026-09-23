import { education, experience, site, socials } from './config';

/** A path like `/blog/x` → `https://domain/blog/x`. The home page is the bare origin + `/`. */
export function absoluteUrl(path: string): string {
	return path.startsWith('http') ? path : `${site.url}${path}`;
}

/** schema.org `Person` for the site owner. Shared by the home page, résumé and post authorship. */
export function personJsonLd() {
	const [job] = experience;
	const [school] = education;
	return {
		'@type': 'Person',
		'@id': `${site.url}/#person`,
		name: site.name,
		alternateName: site.shortName,
		url: `${site.url}/`,
		image: site.avatar,
		jobTitle: site.role,
		description: site.description,
		...(job && {
			worksFor: { '@type': 'Organization', name: job.org, url: site.companyUrl }
		}),
		...(school && {
			alumniOf: { '@type': 'CollegeOrUniversity', name: school.org }
		}),
		address: {
			'@type': 'PostalAddress',
			addressLocality: 'Dhaka',
			addressCountry: 'BD'
		},
		sameAs: socials.filter((s) => !s.href.startsWith('mailto:')).map((s) => s.href)
	};
}

export function websiteJsonLd() {
	return {
		'@type': 'WebSite',
		'@id': `${site.url}/#website`,
		name: site.name,
		url: `${site.url}/`,
		description: site.description,
		inLanguage: 'en',
		publisher: { '@id': `${site.url}/#person` }
	};
}

/** Wraps nodes in a single `@graph` so one script tag can describe the whole page. */
export function graph(...nodes: object[]) {
	return { '@context': 'https://schema.org', '@graph': nodes };
}
