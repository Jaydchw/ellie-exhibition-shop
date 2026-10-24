import { error, redirect } from '@sveltejs/kit';
import { collectionUrl } from '$lib/commerce/collection-navigation';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, url }) => {
	const data = await parent();
	if (data.catalogError) error(503, 'The shop is temporarily unavailable. Please try again.');
	const canonical = collectionUrl(`/shop${url.search}`, data.collections);
	if (canonical.startsWith('/collections/')) redirect(308, canonical);
	return {};
};
