import type { ShopConfig } from '../commerce/types';

const MAX_BODY_BYTES = 256 * 1024;
const PRIVATE_HEADERS = {
	'Cache-Control': 'private, no-store',
	'CDN-Cache-Control': 'no-store',
	'Cloudflare-CDN-Cache-Control': 'no-store',
	'X-Content-Type-Options': 'nosniff',
	Vary: 'Cookie, Origin'
};

function failure(status: number, message: string) {
	return Response.json({ errors: [{ message }] }, { status, headers: PRIVATE_HEADERS });
}

function shopifyCookies(value: string) {
	// Application sessions, authentication and unrelated cookies must never be
	// disclosed to Shopify. Shopify owns the values and lifecycle of these cookies.
	return value
		.split(';')
		.map((cookie) => cookie.trim())
		.filter((cookie) =>
			/^(?:_shopify_[^=;\s]+|_tracking_consent|__cmp_a|_cmp[^=;\s]*)=/.test(cookie)
		)
		.join('; ');
}

async function readBody(request: Request) {
	const reader = request.body?.getReader();
	if (!reader) return '';
	const chunks: Uint8Array[] = [];
	let size = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > MAX_BODY_BYTES) {
				await reader.cancel();
				return null;
			}
			chunks.push(value);
		}
	} finally {
		reader.releaseLock();
	}
	const body = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		body.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return new TextDecoder().decode(body);
}

/**
 * Shopify's Customer Privacy SDK uses a same-origin Storefront API endpoint to
 * persist HTTP-only consent cookies. Support its unstable endpoint as well as
 * the app's configured stable API version, always against this store only.
 *
 * Protocol reference: Shopify/hydrogen core/request-routing/interceptors/
 * sfapi-proxy.ts and proxy.ts. The current protocol forwards consent cookies;
 * Server-Timing is deliberately not used to infer or store visitor consent.
 */
export async function proxyStorefront(
	request: Request,
	version: string,
	config: ShopConfig,
	fetcher: typeof fetch,
	buyerIp?: string
) {
	if (request.method !== 'POST') return failure(405, 'Only POST requests are supported.');
	if (!config.live || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(config.domain))
		return failure(503, 'The shop is temporarily unavailable.');
	if (version !== config.version && version !== 'unstable')
		return failure(404, 'This Storefront API version is unavailable.');
	const url = new URL(request.url);
	const origin = request.headers.get('Origin');
	if ((origin && origin !== url.origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site')
		return failure(403, 'Use this endpoint from the shop website.');
	if (url.searchParams.has('callback')) return failure(400, 'JSONP is not supported.');
	if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') ?? ''))
		return failure(415, 'Send a JSON request.');
	if (Number(request.headers.get('Content-Length') ?? 0) > MAX_BODY_BYTES)
		return failure(413, 'This request is too large.');
	let body: string | null;
	try {
		body = await readBody(request);
	} catch {
		return failure(400, 'This request could not be read.');
	}
	if (body === null) return failure(413, 'This request is too large.');
	try {
		const payload = JSON.parse(body) as { query?: unknown } | null;
		if (!payload || typeof payload.query !== 'string' || !payload.query.trim())
			return failure(400, 'Send a GraphQL query.');
	} catch {
		return failure(400, 'Send valid JSON.');
	}
	const headers = new Headers({
		'Content-Type': 'application/json',
		Accept: 'application/json',
		'X-Shopify-Storefront-Access-Token': config.token,
		'Sec-Shopify-Storefront-Origin': url.origin
	});
	for (const name of [
		'Accept-Language',
		'User-Agent',
		'Origin',
		'Referer',
		'Sec-GPC',
		'Shopify-Storefront-Consent-Management',
		'X-Shopify-UniqueToken',
		'X-Shopify-VisitToken'
	]) {
		const value = request.headers.get(name);
		if (value) headers.set(name, value);
	}
	const cookies = shopifyCookies(request.headers.get('Cookie') ?? '');
	if (cookies) headers.set('Cookie', cookies);
	// Never trust an IP header supplied by the browser. SvelteKit's adapter owns
	// getClientAddress(), including Cloudflare's trusted connection information.
	if (buyerIp) headers.set('Shopify-Storefront-Buyer-IP', buyerIp);
	let upstream: Response;
	try {
		upstream = await fetcher(`https://${config.domain}/api/${version}/graphql.json${url.search}`, {
			method: 'POST',
			headers,
			body,
			redirect: 'manual',
			signal: AbortSignal.any([request.signal, AbortSignal.timeout(15000)])
		});
	} catch {
		return failure(502, 'Privacy settings could not be reached. Please try again.');
	}
	if (
		(upstream.status >= 300 && upstream.status < 400) ||
		!upstream.headers.get('Content-Type')?.includes('application/json')
	)
		return failure(502, 'The shop returned an unexpected response. Please try again.');
	const responseHeaders = new Headers(PRIVATE_HEADERS);
	responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
	// Copy individual cookies rather than folding Set-Cookie into one header.
	// Keep Shopify's attributes verbatim; do not read/write consent values here.
	for (const cookie of upstream.headers.getSetCookie()) {
		if (shopifyCookies(cookie.split(';', 1)[0])) responseHeaders.append('Set-Cookie', cookie);
	}
	return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}
