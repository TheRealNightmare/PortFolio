import { loadProjects } from '$lib/projects.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => loadProjects(fetch);
