import { error, redirect } from '@sveltejs/kit';
import { storefront } from '$lib/commerce/shopify';
import { pageParagraphs } from '$lib/commerce/page-content';
import type { SearchMetadata } from '$lib/commerce/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent, fetch }) => {
	if (['about', 'help', 'murals', 'contact'].includes(params.handle))
		redirect(308, '/' + params.handle);
	const { config } = await parent();
	if (!config.live) error(503, 'This page is temporarily unavailable.');
	let result: {
		page: { title: string; body: string; seo?: SearchMetadata; updatedAt?: string } | null;
	};
	try {
		result = await storefront(
			config,
			`query WebsitePage($handle: String!) { page(handle: $handle) { title body seo { title description } updatedAt } }`,
			{ handle: params.handle },
			fetch
		);
	} catch {
		error(503, 'This page is temporarily unavailable.');
	}
	if (!result.page) error(404, 'Page not found.');
	return {
		merchantPage: {
			title: result.page.title,
			paragraphs: pageParagraphs(result.page.body),
			seo: result.page.seo,
			updatedAt: result.page.updatedAt
		}
	};
};
