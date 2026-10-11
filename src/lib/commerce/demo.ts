import { artworks } from '$lib/art';
import type { Product } from './types';
import printOptions from '$lib/content/print-options.json';
import clothing from '$lib/content/clothing.json';

// Retail proposals, NOT wholesale quotes. Shipping is charged separately.
export const sizes = printOptions.sizes;
export const retailPrices: Record<string, number[]> = printOptions.retailPrices;
export const finishes = Object.keys(retailPrices);
const prints: Product[] = artworks.map((art) => ({
	id: `demo-${art.id}`,
	handle: art.slug,
	title: art.title,
	description: art.description.map((p) => p.map((s) => s.text).join('')).join('\n\n'),
	productType: 'Art print',
	tags: ['Abstract', 'Monochrome', 'Movement'],
	images: [{ url: art.image, altText: art.alt }],
	options: [
		{ name: 'Size', values: sizes },
		{ name: 'Finish', values: finishes }
	],
	variants: sizes.flatMap((size, index) =>
		finishes.map((finish) => ({
			id: `demo-${art.id}-${size}-${finish}`,
			title: `${size} / ${finish}`,
			availableForSale: true,
			price: {
				amount: (retailPrices[finish][index] * (art.id === 1 ? 0.8 : 1)).toFixed(2),
				currencyCode: 'GBP'
			},
			compareAtPrice:
				art.id === 1 ? { amount: String(retailPrices[finish][index]), currencyCode: 'GBP' } : null,
			selectedOptions: [
				{ name: 'Size', value: size },
				{ name: 'Finish', value: finish }
			]
		}))
	)
}));

const garments: Product[] = clothing.products.map((item) => {
	const images = item.colours.map((colour) => ({
		url: `/products/${item.handle}-${colour.toLowerCase().replaceAll(' ', '-')}.svg`,
		altText: `${item.title} in ${colour.toLowerCase().replaceAll(' ', '-')}`
	}));
	return {
		id: `demo-${item.handle}`,
		handle: item.handle,
		title: item.title,
		description: item.description,
		productType: item.type,
		sizeGuide: item.sizeGuide,
		tags: ['Clothing', 'Unisex', item.artwork ? 'Artwork' : 'Seal Stuff'],
		images,
		options: [
			{ name: 'Colour', values: item.colours },
			{ name: 'Size', values: clothing.sizes }
		],
		variants: item.colours.flatMap((colour, i) =>
			clothing.sizes.map((size) => ({
				id: `demo-${item.handle}-${colour}-${size}`,
				title: `${colour} / ${size}`,
				availableForSale: true,
				price: { amount: String(item.price), currencyCode: 'GBP' },
				image: images[i],
				selectedOptions: [
					{ name: 'Colour', value: colour },
					{ name: 'Size', value: size }
				]
			}))
		)
	};
});
// The sample sale is confined to this fallback catalogue. Shopify controls live pricing.
export const demoProducts: Product[] = [...prints, ...garments];
