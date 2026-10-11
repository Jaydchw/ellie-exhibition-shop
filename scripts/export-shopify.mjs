import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const source = readFileSync(new URL('../src/lib/art.ts', import.meta.url), 'utf8');
const options = JSON.parse(
	readFileSync(new URL('../src/lib/content/print-options.json', import.meta.url), 'utf8')
);
const clothing = JSON.parse(
	readFileSync(new URL('../src/lib/content/clothing.json', import.meta.url), 'utf8')
);
const artworks = [...source.matchAll(/id:\s*(\d+),\s*title:\s*'([^']+)',\s*slug:\s*'([^']+)'/g)];
if (artworks.length !== 6)
	throw new Error('Expected six artworks. Review the exporter if the artwork source changes.');
const allProducts = [
	...artworks.map(([, id, title, handle]) => ({
		handle,
		title,
		type: 'Art print',
		description: title + ' by Ellie Seal. Available as a poster, fine art print or framed print.',
		tags: 'Art, Prints',
		variants: options.sizes.flatMap((size, i) =>
			Object.entries(options.retailPrices).map(([finish, prices]) => ({
				option1: 'Size',
				value1: size,
				option2: 'Finish',
				value2: finish,
				price: prices[i],
				sku: `SEAL-${id}-${size}-${finish.toUpperCase().replaceAll(' ', '-')}`
			}))
		)
	})),
	...clothing.products.map((item) => ({
		handle: item.handle,
		title: item.title,
		type: item.type,
		description:
			item.description +
			' Printed on ' +
			item.blank +
			'.<br>' +
			item.sizeGuide.headers.join(' / ') +
			'<br>' +
			item.sizeGuide.rows.map((row) => row.join(' / ')).join('<br>'),
		tags: 'Clothing, Unisex',
		variants: item.colours.flatMap((colour) =>
			clothing.sizes.map((size) => ({
				option1: 'Colour',
				value1: colour,
				option2: 'Size',
				value2: size,
				price: item.price,
				sku: `SEAL-${item.handle.toUpperCase()}-${colour.toUpperCase()}-${size}`
			}))
		)
	}))
];
// Clothing remains available for a later launch, but is not part of the current shop.
const products = process.argv.includes('--include-clothing')
	? allProducts
	: allProducts.filter((product) => product.type === 'Art print');
const columns = [
	'Handle',
	'Title',
	'Body (HTML)',
	'Vendor',
	'Type',
	'Tags',
	'Published',
	'Option1 Name',
	'Option1 Value',
	'Option2 Name',
	'Option2 Value',
	'Variant SKU',
	'Variant Inventory Tracker',
	'Variant Inventory Policy',
	'Variant Fulfillment Service',
	'Variant Price',
	'Variant Compare At Price',
	'Variant Requires Shipping',
	'Variant Taxable',
	'Status'
];
const rows = [columns];
for (const p of products)
	for (const [i, v] of p.variants.entries())
		rows.push([
			p.handle,
			i ? '' : p.title,
			i ? '' : '<p>' + p.description + '</p>',
			i ? '' : 'Seal Stuff',
			i ? '' : p.type,
			i ? '' : p.tags,
			'FALSE',
			v.option1,
			v.value1,
			v.option2,
			v.value2,
			v.sku,
			'',
			'continue',
			'manual',
			v.price,
			'',
			'TRUE',
			'TRUE',
			i ? '' : 'draft'
		]);
const quote = (value) => '"' + String(value).replaceAll('"', '""') + '"';
mkdirSync(new URL('../setup/', import.meta.url), { recursive: true });
writeFileSync(
	new URL('../setup/shopify-products.csv', import.meta.url),
	'\uFEFF' + rows.map((row) => row.map(quote).join(',')).join('\r\n') + '\r\n'
);
console.log(
	`Exported ${products.length} draft products and ${rows.length - 1} variants. Sample sale is not exported. Review products and map fulfilment before publishing.`
);
