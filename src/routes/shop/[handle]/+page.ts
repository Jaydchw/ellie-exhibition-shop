import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { storefrontOpen } from '$lib/commerce/availability';
import type { PageLoad } from './$types';
export const load: PageLoad = async ({ params, parent }) => {
	if (!storefrontOpen) redirect(307, resolve('/shop'));
	const data = await parent();
	if (data.catalogError) error(503, 'The shop is temporarily unavailable. Please try again.');
	const product = data.products.find((p) => p.handle === params.handle);
	if (!product) error(404, 'This piece could not be found.');
	return { product };
};
