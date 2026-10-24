import { storefront } from '$lib/commerce/shopify';
import { pageParagraphs } from '$lib/commerce/page-content';
import type { SearchMetadata } from '$lib/commerce/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { config } = await parent();
	const defaults = {
		contactTitle: 'Get in touch.',
		contactParagraphs: [] as string[],
		contactSeo: null as SearchMetadata | null
	};
	if (!config.live) return defaults;
	try {
		const { page } = await storefront<{
			page: { title: string; body: string; seo?: SearchMetadata } | null;
		}>(
			config,
			'query ContactPage { page(handle: "contact") { title body seo { title description } } }',
			{},
			fetch
		);
		if (!page) return defaults;
		return {
			contactTitle: page.title.trim() || defaults.contactTitle,
			contactParagraphs: pageParagraphs(page.body),
			contactSeo: page.seo ?? null
		};
	} catch {
		// Contact details stay available while Shopify's editorial content is offline.
		return defaults;
	}
};
