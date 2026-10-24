import { error } from '@sveltejs/kit';
import { getCollection } from '$lib/commerce/shopify';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent, fetch }) => {
	const data = await parent();
	if (!data.config.live) error(503, 'The collection is temporarily unavailable. Please try again.');
	let result;
	try {
		result = await getCollection(data.config, params.handle, fetch);
	} catch {
		error(503, 'The collection is temporarily unavailable. Please try again.');
	}
	if (!result) error(404, 'This collection could not be found.');
	return { ...result, catalogError: false };
};
