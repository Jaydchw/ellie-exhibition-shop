import type { Collection, Product, ProductImage, Variant } from './commerce/types';

export function canonicalUrl(siteUrl: string, path = '/'): string {
	const url = new URL(siteUrl);
	const basePath = url.pathname.replace(/\/+$/, '');
	let pathname = (path.startsWith('/') ? path : '/').split(/[?#]/, 1)[0];
	if (basePath && pathname !== basePath && !pathname.startsWith(basePath + '/')) {
		pathname = basePath + '/' + pathname.replace(/^\/+/, '');
	}
	url.pathname = pathname.replace(/\/+$/, '') || '/';
	url.search = '';
	url.hash = '';
	return url.href;
}

export function absoluteImageUrl(siteUrl: string, image: ProductImage | string): string | null {
	try {
		const url = new URL(typeof image === 'string' ? image : image.url, siteUrl + '/');
		return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
	} catch {
		return null;
	}
}

export function searchDescription(value: string, fallback = ''): string {
	const text = value.replace(/\s+/g, ' ').trim() || fallback;
	if (text.length <= 160) return text;
	const clipped = text.slice(0, 157);
	return clipped.slice(0, Math.max(clipped.lastIndexOf(' '), 120)).trimEnd() + '…';
}

export function hasSearchFacets(url: URL): boolean {
	return ['q', 'search', 'category', 'finish', 'sort', 'available', 'tag'].some((key) =>
		url.searchParams.has(key)
	);
}

export function safeJsonLd(value: unknown): string {
	return JSON.stringify(value)
		.replace(/</g, '\\u003c')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
}

export function breadcrumbStructuredData(siteUrl: string, items: { name: string; path: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: canonicalUrl(siteUrl, item.path)
		}))
	};
}

function variantUrl(url: string, variant: Variant) {
	const result = new URL(url);
	result.searchParams.set('variant', variant.id);
	return result.href;
}

function offer(siteUrl: string, variant: Variant, url: string) {
	return {
		'@type': 'Offer',
		url,
		price: variant.price.amount,
		priceCurrency: variant.price.currencyCode,
		availability: variant.availableForSale
			? 'https://schema.org/InStock'
			: 'https://schema.org/OutOfStock',
		seller: { '@id': canonicalUrl(siteUrl) + '#organization' }
	};
}

export function productStructuredData(siteUrl: string, product: Product) {
	const url = canonicalUrl(siteUrl, '/shop/' + encodeURIComponent(product.handle));
	const common = {
		name: product.title,
		description: product.description,
		image: product.images.map((image) => absoluteImageUrl(siteUrl, image)).filter(Boolean),
		brand: { '@type': 'Brand', name: 'Seal Stuff' }
	};
	if (product.variants.length === 1) {
		const variant = product.variants[0];
		return {
			'@context': 'https://schema.org',
			'@type': 'Product',
			'@id': url + '#product',
			url,
			...common,
			...(variant.sku ? { sku: variant.sku } : {}),
			productID: product.id,
			offers: offer(siteUrl, variant, url)
		};
	}
	const optionProperty = (name: string): string => {
		if (/^colou?r$/i.test(name)) return 'color';
		if (/^size$/i.test(name)) return 'size';
		if (/^material$/i.test(name)) return 'material';
		if (/^pattern$/i.test(name)) return 'pattern';
		return name;
	};
	return {
		'@context': 'https://schema.org',
		'@type': 'ProductGroup',
		'@id': url + '#product',
		url,
		...common,
		productGroupID: product.id,
		variesBy: product.options.map((option) => {
			const property = optionProperty(option.name);
			return ['color', 'size', 'material', 'pattern'].includes(property)
				? 'https://schema.org/' + property
				: property;
		}),
		hasVariant: product.variants.map((variant) => {
			const selectedUrl = variantUrl(url, variant);
			const properties: Record<string, string> = {};
			const additionalProperty: { '@type': string; name: string; value: string }[] = [];
			for (const option of variant.selectedOptions) {
				const property = optionProperty(option.name);
				if (['color', 'size', 'material', 'pattern'].includes(property))
					properties[property] = option.value;
				else
					additionalProperty.push({
						'@type': 'PropertyValue',
						name: option.name,
						value: option.value
					});
			}
			return {
				'@type': 'Product',
				'@id': selectedUrl + '#product',
				url: selectedUrl,
				name:
					variant.title === 'Default Title' ? product.title : product.title + ' — ' + variant.title,
				productID: variant.id,
				...(variant.sku ? { sku: variant.sku } : {}),
				...(variant.image
					? { image: absoluteImageUrl(siteUrl, variant.image) }
					: { image: common.image }),
				...properties,
				...(additionalProperty.length ? { additionalProperty } : {}),
				offers: offer(siteUrl, variant, selectedUrl)
			};
		})
	};
}

export function collectionStructuredData(
	siteUrl: string,
	title: string,
	products: Product[],
	collection: Collection | null
) {
	const path = collection ? '/collections/' + encodeURIComponent(collection.handle) : '/shop';
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		'@id': canonicalUrl(siteUrl, path) + '#collection',
		url: canonicalUrl(siteUrl, path),
		name: title,
		mainEntity: {
			'@type': 'ItemList',
			itemListElement: products.map((product, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: product.title,
				url: canonicalUrl(siteUrl, '/shop/' + encodeURIComponent(product.handle))
			}))
		}
	};
}
