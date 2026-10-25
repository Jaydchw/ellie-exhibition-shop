import type { MenuLink, StoreContent } from '../commerce/types';

export type { StoreContent } from '../commerce/types';

// Used until Shopify's Storefront content entry is published, and during outages.
// Return fresh objects so request-local consumers never share mutable content.
export function defaultStoreContent(): StoreContent {
	return {
		homeTitle: 'Ellie Seal',
		homeText: 'Fine artist & mural painter.',
		homeImage: null,
		shopTitle: 'Shop',
		shopText: 'Original paintings, prints and framed artwork by Ellie Seal.',
		shopImage: null,
		aboutTitle: 'Ellie Seal',
		aboutText:
			'Ellie is an artist working across painting, sculpture and dance. Seal Stuff brings together her original paintings and art prints.\n\nInspired by artists including Hilma af Klint and Wassily Kandinsky, her abstract work explores the energy and gesture of a body in motion.\n\nAlongside her studio practice, Ellie paints colourful murals for homes, businesses and shared spaces.',
		aboutImage: null,
		faqs: [
			{
				id: 'default-originals',
				title: 'What is an original painting?',
				body: 'An original is the physical artwork painted by Ellie. Each listing describes the piece, its dimensions, materials and framing. Originals are sold individually; prints are separate products.'
			},
			{
				id: 'default-print-finishes',
				title: 'Can I order my print framed?',
				body: 'Choose a framed finish on the product page where available. Check the description and product photographs for the available sizes, paper and frame options.'
			},
			{
				id: 'default-delivery',
				title: 'How is my order delivered?',
				body: 'Available delivery methods and costs are shown at checkout. Prints are made to order through Prodigi. Original paintings are packed and dispatched separately, so mixed orders can arrive in more than one parcel.'
			},
			{
				id: 'default-damage',
				title: 'What if something arrives damaged?',
				body: 'Please email us with your order number and photographs of the item and its packaging so we can help. Keep the packaging while we investigate. See our shop policies for return and refund information.'
			},
			{
				id: 'default-murals',
				title: 'Can I commission a mural?',
				body: 'Visit the Murals page to see previous projects and get in touch about your space.'
			}
		]
	};
}

export function defaultMenu(handle: string): MenuLink[] {
	const links =
		handle === 'footer'
			? [
					['Shop', '/shop'],
					['Murals', '/murals'],
					['Help & contact', '/help'],
					['Shop policies', '/policies']
				]
			: [
					['Home', '/'],
					['Shop', '/shop'],
					['Prints', '/collections/prints'],
					['Originals', '/collections/originals'],
					['Murals', '/murals']
				];
	return links.map(([title, url], index) => ({
		id: `default-${handle}-${index}`,
		title,
		url,
		items: []
	}));
}
