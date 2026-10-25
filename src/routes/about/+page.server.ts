import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	redirect(308, base + '/');
};
