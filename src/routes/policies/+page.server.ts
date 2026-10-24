import { error } from '@sveltejs/kit';
import { getPolicies } from '$lib/commerce/policies';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { config } = await parent();
	try {
		return { policies: await getPolicies(config, fetch) };
	} catch {
		error(503, 'Shop policies are temporarily unavailable. Please try again.');
	}
};
