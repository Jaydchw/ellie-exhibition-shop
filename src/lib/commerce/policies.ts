import { storefront } from './shopify';
import type { ShopConfig } from './types';

export const policyFields = {
	'privacy-policy': 'privacyPolicy',
	'refund-policy': 'refundPolicy',
	'shipping-policy': 'shippingPolicy',
	'terms-of-service': 'termsOfService'
} as const;
export type PolicyHandle = keyof typeof policyFields;
const policyTags = [
	'p',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'ul',
	'ol',
	'li',
	'strong',
	'em',
	'b',
	'i',
	'a',
	'br',
	'hr',
	'blockquote',
	'div',
	'span',
	'table',
	'thead',
	'tbody',
	'tr',
	'th',
	'td',
	'dl',
	'dt',
	'dd'
] as const;
export type PolicyTag = (typeof policyTags)[number];
export type PolicyNode =
	| { text: string }
	| { tag: PolicyTag; children: PolicyNode[]; href?: string; id?: string };
export type StorePolicy = {
	id: string;
	handle: PolicyHandle;
	title: string;
	content: PolicyNode[];
	description: string;
};
type RawPolicy = { id: string; title: string; body: string };
const tags = new Set<string>(policyTags);
const hiddenTags = new Set([
	'script',
	'style',
	'iframe',
	'object',
	'embed',
	'template',
	'svg',
	'math',
	'textarea'
]);
const entities: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: '\u00a0',
	ndash: '–',
	mdash: '—',
	lsquo: '‘',
	rsquo: '’',
	ldquo: '“',
	rdquo: '”',
	copy: '©',
	reg: '®',
	bull: '•',
	hellip: '…',
	colon: ':',
	tab: '\t',
	newline: '\n'
};
function decodeText(value: string) {
	return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);?/gi, (entity, key: string) => {
		if (!key.startsWith('#')) return entities[key.toLowerCase()] ?? entity;
		const code = key.toLowerCase().startsWith('#x')
			? parseInt(key.slice(2), 16)
			: parseInt(key.slice(1), 10);
		return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
			? String.fromCodePoint(code)
			: '\ufffd';
	});
}
function attributes(source: string) {
	const values: Record<string, string> = {};
	for (const match of source.matchAll(
		/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
	)) {
		const name = match[1].toLowerCase();
		if ((name === 'href' || name === 'id') && !(name in values))
			values[name] = decodeText(match[2] ?? match[3] ?? match[4] ?? '');
	}
	return values;
}
function safeLink(value: string, domain: string): string | undefined {
	const link = value.trim();
	if (!link || link.startsWith('//')) return;
	if (link.startsWith('#')) return `#policy-${link.slice(1)}`;
	try {
		const url = new URL(link, `https://${domain}/`);
		if (
			!['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol) ||
			url.username ||
			url.password
		)
			return;
		if (
			url.hostname === domain &&
			/^\/policies\/(?:privacy-policy|refund-policy|shipping-policy|terms-of-service)\/?$/.test(
				url.pathname
			)
		)
			return url.pathname.replace(/\/$/, '') + url.search + url.hash;
		return url.href;
	} catch {
		return;
	}
}

// This produces component data, never HTML. Svelte escapes text and constructs
// only allowlisted elements with explicit attributes. Safety doesn't depend on
// this tokenizer reproducing a browser's handling of malformed HTML.
export function policyContent(html: string, domain: string): PolicyNode[] {
	if (html.length > 262144) throw new Error('The policy content could not be loaded.');
	const root: PolicyNode[] = [];
	const stack: { tag: string; children: PolicyNode[] }[] = [{ tag: '', children: root }];
	let hidden = '';
	for (const token of html.match(/<!--[\s\S]*?(?:-->|$)|<[^>]*>|[^<]+|</g) ?? []) {
		if (token.startsWith('<!--')) continue;
		const match = /^<\s*(\/?)\s*([a-z][a-z\d-]*)\b([^>]*)>/i.exec(token);
		if (!match) {
			if (!hidden) stack[stack.length - 1].children.push({ text: decodeText(token) });
			continue;
		}
		const closing = !!match[1];
		const rawTag = match[2].toLowerCase();
		if (hidden) {
			if (closing && rawTag === hidden) hidden = '';
			continue;
		}
		if (hiddenTags.has(rawTag)) {
			if (!closing && !/\/\s*>$/.test(token) && rawTag !== 'embed') hidden = rawTag;
			continue;
		}
		const tag = rawTag === 'h1' ? 'h2' : rawTag;
		if (!tags.has(tag)) continue;
		if (closing) {
			const index = stack.findLastIndex((entry) => entry.tag === tag);
			if (index > 0) stack.length = index;
			continue;
		}
		const attrs = attributes(match[3]);
		const href = tag === 'a' && attrs.href ? safeLink(attrs.href, domain) : undefined;
		const id =
			attrs.id && /^[a-z][\w:.-]{0,100}$/i.test(attrs.id) ? `policy-${attrs.id}` : undefined;
		const node: PolicyNode = {
			tag: tag as PolicyTag,
			children: [],
			...(href ? { href } : {}),
			...(id ? { id } : {})
		};
		stack[stack.length - 1].children.push(node);
		if (tag !== 'br' && tag !== 'hr' && stack.length < 32 && !/\/\s*>$/.test(token))
			stack.push(node);
	}
	return root;
}
export function policyText(nodes: PolicyNode[]): string {
	return nodes
		.map((node) => ('text' in node ? node.text : policyText(node.children)))
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}
export async function getPolicies(
	config: ShopConfig,
	fetcher: typeof fetch
): Promise<StorePolicy[]> {
	const fields = Object.values(policyFields)
		.map((field) => `${field} { id title body }`)
		.join(' ');
	const data = await storefront<{ shop: Record<string, RawPolicy | null> }>(
		config,
		`query ShopPolicies { shop { ${fields} } }`,
		{},
		fetcher
	);
	return Object.entries(policyFields).flatMap(([handle, field]) => {
		const raw = data.shop[field];
		if (!raw?.body?.trim()) return [];
		const content = policyContent(raw.body, config.domain);
		const text = policyText(content);
		if (!text) return [];
		return [
			{ id: raw.id, handle: handle as PolicyHandle, title: raw.title, content, description: text }
		];
	});
}
