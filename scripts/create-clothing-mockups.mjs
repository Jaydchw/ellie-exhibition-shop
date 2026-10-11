import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const catalogue = JSON.parse(
	readFileSync(new URL('../src/lib/content/clothing.json', import.meta.url), 'utf8')
);
const colours = { 'Desert Dust': '#ddd1b9', Ash: '#deded8', Black: '#30312e', White: '#f1efea' };
mkdirSync(new URL('../static/products/', import.meta.url), { recursive: true });
for (const product of catalogue.products)
	for (const colour of product.colours) {
		const hoodie = product.type === 'Hoodie';
		const body = hoodie
			? 'M146 101 100 120 53 317 97 333 143 220 134 442Q250 462 366 442L357 220 403 333 447 317 400 120 354 101 310 89 190 89Z'
			: 'M181 76 118 100 43 196 106 241 145 194 137 430Q250 449 363 430L355 194 394 241 457 196 382 100 319 76Q250 111 181 76Z';
		const art = product.artwork
			? '<image href="data:image/png;base64,' +
				readFileSync(
					new URL('../src/lib/assets/images/art-' + product.artwork + '.png', import.meta.url)
				).toString('base64') +
				'" x="179" y="' +
				(hoodie ? 196 : 182) +
				'" width="142" height="101" preserveAspectRatio="xMidYMid meet"/>'
			: '<text x="250" y="' +
				(hoodie ? 241 : 230) +
				'" text-anchor="middle" fill="' +
				(colour === 'Black' ? '#f1ece1' : '#183754') +
				'" font-family="Georgia,serif" font-size="31" font-weight="bold" letter-spacing="-1.8">Seal Stuff</text>';
		const svg =
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><defs><linearGradient id="fabric" x1="0" x2="1" y2=".3"><stop stop-color="#000" stop-opacity=".1"/><stop offset=".3" stop-color="#fff" stop-opacity=".05"/><stop offset=".7" stop-color="#fff" stop-opacity=".09"/><stop offset="1" stop-color="#000" stop-opacity=".13"/></linearGradient><filter id="shadow" x="-.3" y="-.3" width="1.6" height="1.6"><feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#302c24" flood-opacity=".17"/></filter></defs><g filter="url(#shadow)"><path d="' +
			body +
			'" fill="' +
			colours[colour] +
			'" stroke="#000" stroke-opacity=".14"/><path d="' +
			body +
			'" fill="url(#fabric)"/>' +
			(hoodie
				? '<path d="M181 113Q161 57 211 35Q250 16 289 35Q339 57 319 113L283 148 250 119 217 148Z" fill="' +
					colours[colour] +
					'" stroke="#000" stroke-opacity=".17"/><path d="M211 49Q250 78 289 49L283 113 250 133 217 113Z" fill="#000" opacity=".1"/><path d="M191 334 172 391Q250 403 328 391L309 334Z" fill="none" stroke="#000" stroke-opacity=".18"/><path d="M218 129 210 186M282 129 291 186" stroke="' +
					(colour === 'Black' ? '#73726d' : '#b6af9f') +
					'" stroke-width="3"/>'
				: '<path d="M183 78Q250 146 317 78" fill="none" stroke="#000" stroke-opacity=".13" stroke-width="9"/><path d="M190 80Q250 130 310 80" fill="none" stroke="' +
					colours[colour] +
					'" stroke-width="6"/>') +
			'<path d="M148 187 160 407M352 187 340 407M147 425Q250 441 353 425" fill="none" stroke="#000" stroke-opacity=".08"/>' +
			art +
			'</g></svg>';
		writeFileSync(
			new URL(
				'../static/products/' +
					product.handle +
					'-' +
					colour.toLowerCase().replaceAll(' ', '-') +
					'.svg',
				import.meta.url
			),
			svg
		);
	}
console.log(
	'Generated 12 clothing illustrations. Replace with approved supplier mockups in Shopify.'
);
