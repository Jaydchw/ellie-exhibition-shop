import type { Collection } from './types';

// Older menus linked to shop filters. Prefer the merchant's actual collection
// when it exists so membership, ordering and introductory content come from Shopify.
export function collectionUrl(url: string, collections: Collection[]): string {
	if (!url.startsWith('/shop?')) return url;
	const parsed = new URL(url, 'https://storefront.invalid');
	const params = parsed.searchParams;
	const category = params.get('category');
	if (!category) return url;
	const collection = collections.find((item) => item.handle === category);
	if (!collection) return url;
	params.delete('category');
	return `/collections/${encodeURIComponent(collection.handle)}${params.size ? `?${params}` : ''}${parsed.hash}`;
}
