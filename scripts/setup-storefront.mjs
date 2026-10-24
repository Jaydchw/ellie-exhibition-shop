import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// This is an operator-only setup command. No Admin credentials enter the website bundle.
const envPath = fileURLToPath(new URL('../.env', import.meta.url));
if (existsSync(envPath)) process.loadEnvFile(envPath);

const flags = process.argv.slice(2);
if (flags.some((flag) => !['--apply', '--dry-run'].includes(flag))) {
	console.error('Use --dry-run (default) or --apply.');
	process.exit(1);
}
if (flags.includes('--apply') && flags.includes('--dry-run')) {
	console.error('Choose either --dry-run or --apply.');
	process.exit(1);
}
const apply = flags.includes('--apply');
const domain = (process.env.PUBLIC_SHOPIFY_STORE_DOMAIN ?? '')
	.trim()
	.replace(/^https:\/\//, '')
	.replace(/\/$/, '');
const token = (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? '').trim();
const version = process.env.PUBLIC_SHOPIFY_API_VERSION || '2026-07';

const faqs = [
	{
		handle: 'prints-and-originals',
		question: 'What is the difference between prints and originals?',
		answer:
			'An original is the one-off artwork painted by Ellie. Prints reproduce her artwork on paper, with the sizes and finishes listed on each product.'
	},
	{
		handle: 'delivery-and-collection',
		question: 'Can I have my order delivered or collect it?',
		answer:
			'Enter your address at checkout to see the delivery options and costs for your order. Collection is available for eligible originals when offered at checkout. Prints are fulfilled by Prodigi; originals are packed and sent by Ellie. They may arrive separately.'
	},
	{
		handle: 'order-times',
		question: 'How long will my order take?',
		answer:
			'Prints are made to order. Originals are existing artworks, packed individually. Check the product description and delivery information at checkout for your order, and follow your confirmation and shipping updates.'
	},
	{
		handle: 'framed-prints',
		question: 'Can I order my print framed?',
		answer:
			'Choose a framed finish on the product page where available. The product description lists the available sizes and finishes.'
	},
	{
		handle: 'damaged-order',
		question: 'What if something arrives damaged?',
		answer:
			'Email Ellie with your order number and photographs of the item and packaging. Keep the packaging while we investigate. The shop policies explain the available return and refund options.'
	}
];

const contentValues = {
	title: 'Website content',
	home_title: 'Ellie Seal',
	home_text: 'Fine artist & mural painter.',
	shop_title: 'Shop',
	shop_text: 'Prints and original paintings by Ellie Seal.',
	about_title: 'Ellie Seal',
	about_text:
		'Ellie is an artist working across painting, sculpture and dance.\n\nInspired by Hilma af Klint and Wassily Kandinsky, her abstract work explores the energy and gesture of a body in motion.\n\nSeal Stuff brings together her prints and original paintings. Alongside her studio work, Ellie paints colourful murals for homes, businesses and shared spaces.'
};

const textField = (key, name, type = 'single_line_text_field', description) => ({
	key,
	name,
	type,
	...(description ? { description } : {})
});
const imageField = (key, name) => ({
	key,
	name,
	type: 'file_reference',
	description: 'Choose an image from Shopify Files. Add descriptive alternative text to the file.',
	validations: [{ name: 'file_type_options', value: '["Image"]' }]
});

function contentDefinition(faqDefinitionId) {
	return {
		name: 'Website content',
		type: 'storefront_content',
		description: 'Edit the homepage, shop introduction, About page and selected FAQs here.',
		displayNameKey: 'title',
		access: { storefront: 'PUBLIC_READ' },
		fieldDefinitions: [
			{ ...textField('title', 'Entry name'), required: true },
			textField('home_title', 'Homepage heading'),
			textField('home_text', 'Homepage introduction', 'multi_line_text_field'),
			imageField('home_image', 'Homepage image'),
			textField('shop_title', 'Shop heading'),
			textField('shop_text', 'Shop introduction', 'multi_line_text_field'),
			imageField('shop_image', 'Shop image'),
			textField('about_title', 'About heading'),
			textField(
				'about_text',
				'About text',
				'multi_line_text_field',
				'Separate paragraphs with a blank line.'
			),
			imageField('about_image', 'About image'),
			{
				key: 'faqs',
				name: 'FAQs',
				type: 'list.metaobject_reference',
				description: 'Choose FAQ entries and drag them into the order shown on the Help page.',
				validations: [{ name: 'metaobject_definition_id', value: faqDefinitionId }]
			}
		]
	};
}

console.log(`${apply ? 'APPLY' : 'DRY RUN'}: Shopify website content setup`);
console.log(
	'Create missing FAQ/website content definitions, seed entries, artwork/care fields, and Prints/Originals collections.'
);
console.log(
	'Create main-menu/footer menus only if absent; preserve existing menus and all merchant content.'
);
console.log(
	'No products, inventory, publications, orders, shipping, fulfilment or payment settings are changed.'
);
if (!apply) {
	console.log(
		`Plan: ${faqs.length} FAQ entries; storefront_content/main; artwork.medium/dimensions/year/framing/care_instructions.`
	);
	console.log(
		'Collections: prints (type Art print), originals (type Original painting). Menus: main-menu, footer.'
	);
	console.log(
		'No network requests made. Run with --apply and a server-only SHOPIFY_ADMIN_ACCESS_TOKEN to create missing resources.'
	);
	process.exit(0);
}
if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain)) {
	console.error("Set PUBLIC_SHOPIFY_STORE_DOMAIN to the store's myshopify.com domain.");
	process.exit(1);
}
if (!/^\d{4}-(01|04|07|10)$/.test(version)) {
	console.error(
		'PUBLIC_SHOPIFY_API_VERSION must be a supported quarterly version, for example 2026-07.'
	);
	process.exit(1);
}
if (!token) {
	console.error(
		'Setup is pending: SHOPIFY_ADMIN_ACCESS_TOKEN is not available. The public Storefront token cannot create these resources. See setup/SHOPIFY-CONTENT.md.'
	);
	process.exit(1);
}

async function graphql(query, variables = {}) {
	const response = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
		body: JSON.stringify({ query, variables }),
		signal: AbortSignal.timeout(20000)
	});
	if (!response.ok)
		throw new Error(
			`Shopify Admin request failed (HTTP ${response.status}). Check the operator token and its scopes.`
		);
	const result = await response.json();
	if (result.errors?.length || !result.data) {
		throw new Error(
			`Shopify Admin rejected the request: ${result.errors?.map((error) => error.message).join('; ') || 'No data returned.'}`
		);
	}
	return result.data;
}

function payload(result, key) {
	const operation = result[key];
	if (operation?.userErrors?.length) {
		throw new Error(`${key}: ${operation.userErrors.map((error) => error.message).join('; ')}`);
	}
	if (!operation) throw new Error(`${key} did not return a result.`);
	return operation;
}

async function ensureDefinition(definition) {
	const found = await graphql(
		'query Definition($type: String!) { metaobjectDefinitionByType(type: $type) { id access { storefront } fieldDefinitions { key type { name } } } }',
		{ type: definition.type }
	);
	const existing = found.metaobjectDefinitionByType;
	if (existing) {
		const fields = new Map(existing.fieldDefinitions.map((field) => [field.key, field.type.name]));
		const incompatible = definition.fieldDefinitions.filter(
			(field) => fields.get(field.key) !== field.type
		);
		if (incompatible.length || existing.access.storefront !== 'PUBLIC_READ') {
			throw new Error(
				`Existing ${definition.type} definition differs from the required schema or is not public. It was left unchanged; review it in Shopify Settings > Metafields and metaobjects.`
			);
		}
		console.log(`Kept existing definition: ${definition.type}`);
		return existing.id;
	}
	const created = payload(
		await graphql(
			'mutation Definition($definition: MetaobjectDefinitionCreateInput!) { metaobjectDefinitionCreate(definition: $definition) { metaobjectDefinition { id } userErrors { message } } }',
			{ definition }
		),
		'metaobjectDefinitionCreate'
	);
	console.log(`Created definition: ${definition.type}`);
	return created.metaobjectDefinition.id;
}

async function ensureEntry(type, handle, values) {
	const found = await graphql(
		'query Entry($handle: MetaobjectHandleInput!) { metaobjectByHandle(handle: $handle) { id } }',
		{ handle: { type, handle } }
	);
	if (found.metaobjectByHandle) {
		console.log(`Kept existing entry: ${type}/${handle}`);
		return found.metaobjectByHandle.id;
	}
	const created = payload(
		await graphql(
			'mutation Entry($metaobject: MetaobjectCreateInput!) { metaobjectCreate(metaobject: $metaobject) { metaobject { id } userErrors { message } } }',
			{
				metaobject: {
					type,
					handle,
					fields: Object.entries(values).map(([key, value]) => ({ key, value }))
				}
			}
		),
		'metaobjectCreate'
	);
	console.log(`Created entry: ${type}/${handle}`);
	return created.metaobject.id;
}

async function readAll(connection, query, variables = {}) {
	const nodes = [];
	let after = null;
	do {
		const data = await graphql(query, { ...variables, after });
		nodes.push(...data[connection].nodes);
		after = data[connection].pageInfo.hasNextPage ? data[connection].pageInfo.endCursor : null;
	} while (after);
	return nodes;
}

async function run() {
	const installation = await graphql(
		'query SetupAccess { currentAppInstallation { accessScopes { handle } } }'
	);
	const granted = new Set(
		installation.currentAppInstallation.accessScopes.map((scope) => scope.handle)
	);
	const required = [
		'write_metaobject_definitions',
		'write_metaobjects',
		'write_products',
		'write_online_store_navigation'
	];
	const missing = required.filter((scope) => !granted.has(scope));
	if (missing.length)
		throw new Error(
			`Admin token needs these setup scopes before any resources can be created: ${missing.join(', ')}.`
		);

	const faqDefinitionId = await ensureDefinition({
		name: 'Website FAQ',
		type: 'storefront_faq',
		description: 'Questions and answers selected in Website content.',
		displayNameKey: 'question',
		access: { storefront: 'PUBLIC_READ' },
		fieldDefinitions: [
			{ ...textField('question', 'Question'), required: true },
			{ ...textField('answer', 'Answer', 'multi_line_text_field'), required: true }
		]
	});
	await ensureDefinition(contentDefinition(faqDefinitionId));
	const faqIds = [];
	for (const faq of faqs) {
		faqIds.push(
			await ensureEntry('storefront_faq', faq.handle, {
				question: faq.question,
				answer: faq.answer
			})
		);
	}
	await ensureEntry('storefront_content', 'main', {
		...contentValues,
		faqs: JSON.stringify(faqIds)
	});

	const artworkFields = await readAll(
		'metafieldDefinitions',
		'query ArtworkFields($after: String) { metafieldDefinitions(first: 100, after: $after, ownerType: PRODUCT, namespace: "artwork") { nodes { key type { name } access { storefront } } pageInfo { hasNextPage endCursor } } }'
	);
	for (const [key, name, type] of [
		['medium', 'Artwork medium', 'single_line_text_field'],
		['dimensions', 'Artwork dimensions', 'single_line_text_field'],
		['year', 'Artwork year', 'single_line_text_field'],
		['framing', 'Artwork framing', 'single_line_text_field'],
		['care_instructions', 'Care instructions', 'multi_line_text_field']
	]) {
		const existing = artworkFields.find((field) => field.key === key);
		if (existing) {
			if (existing.type.name !== type || existing.access.storefront !== 'PUBLIC_READ') {
				throw new Error(
					`Existing artwork.${key} differs from the required public ${type} field. It was left unchanged; review its definition in Shopify.`
				);
			}
			console.log(`Kept existing field: artwork.${key}`);
			continue;
		}
		payload(
			await graphql(
				'mutation ArtworkField($definition: MetafieldDefinitionInput!) { metafieldDefinitionCreate(definition: $definition) { createdDefinition { id } userErrors { message } } }',
				{
					definition: {
						namespace: 'artwork',
						key,
						name,
						type,
						ownerType: 'PRODUCT',
						access: { storefront: 'PUBLIC_READ' }
					}
				}
			),
			'metafieldDefinitionCreate'
		);
		console.log(`Created field: artwork.${key}`);
	}

	const collections = await readAll(
		'collections',
		'query Collections($after: String) { collections(first: 100, after: $after) { nodes { id handle title ruleSet { rules { column relation condition } } } pageInfo { hasNextPage endCursor } } }'
	);
	const collectionIds = {};
	for (const [handle, title, productType] of [
		['prints', 'Prints', 'Art print'],
		['originals', 'Originals', 'Original painting']
	]) {
		const existing = collections.find((collection) => collection.handle === handle);
		if (existing) {
			collectionIds[handle] = existing.id;
			console.log(
				`Kept existing collection: ${handle} (check its products and Headless availability)`
			);
			if (
				existing.ruleSet &&
				!existing.ruleSet.rules.some(
					(rule) =>
						rule.column === 'TYPE' && rule.relation === 'EQUALS' && rule.condition === productType
				)
			) {
				console.warn(
					`Review ${handle} collection conditions: the store uses product type "${productType}". Existing conditions were preserved.`
				);
			}
			continue;
		}
		const created = payload(
			await graphql(
				'mutation Collection($input: CollectionInput!) { collectionCreate(input: $input) { collection { id } userErrors { message } } }',
				{
					input: {
						handle,
						title,
						sortOrder: 'MANUAL',
						ruleSet: {
							appliedDisjunctively: false,
							rules: [{ column: 'TYPE', relation: 'EQUALS', condition: productType }]
						}
					}
				}
			),
			'collectionCreate'
		);
		collectionIds[handle] = created.collection.id;
		console.log(`Created collection: ${handle}; not published by this script`);
	}

	const menus = await readAll(
		'menus',
		'query Menus($after: String) { menus(first: 100, after: $after) { nodes { handle } pageInfo { hasNextPage endCursor } } }'
	);
	const link = (title, path) => ({ title, type: 'HTTP', url: `https://${domain}${path}` });
	const menuPlans = [
		{
			handle: 'main-menu',
			title: 'Main menu',
			items: [
				link('Home', '/'),
				link('Shop all', '/shop'),
				{ title: 'Prints', type: 'COLLECTION', resourceId: collectionIds.prints },
				{ title: 'Originals', type: 'COLLECTION', resourceId: collectionIds.originals },
				link('About', '/about'),
				link('Murals', '/murals')
			]
		},
		{
			handle: 'footer',
			title: 'Footer menu',
			items: [link('About', '/about'), link('Help', '/help'), link('Shop policies', '/policies')]
		}
	];
	for (const menu of menuPlans) {
		if (menus.some((existing) => existing.handle === menu.handle)) {
			console.log(
				`Kept existing menu: ${menu.handle}. Add Prints/Originals links in Content > Menus if needed.`
			);
			continue;
		}
		payload(
			await graphql(
				'mutation Menu($handle: String!, $title: String!, $items: [MenuItemCreateInput!]!) { menuCreate(handle: $handle, title: $title, items: $items) { menu { id } userErrors { message } } }',
				menu
			),
			'menuCreate'
		);
		console.log(`Created menu: ${menu.handle}`);
	}
	console.log(
		'Setup resources are ready. Review content/images, menus, Headless scopes/publications and original shipping before launch. See setup/SHOPIFY-CONTENT.md.'
	);
}

try {
	await run();
} catch (error) {
	const message = error instanceof Error ? error.message : 'Shopify setup failed.';
	console.error(message.replaceAll(token, '[redacted]'));
	console.error(
		'Setup did not finish. Resources already created are preserved; rerunning is safe after fixing the reported problem.'
	);
	process.exitCode = 1;
}
