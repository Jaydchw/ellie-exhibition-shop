import { describe, expect, it, vi } from 'vitest';
import { proxyStorefront } from '../src/lib/server/storefront-proxy';
import type { ShopConfig } from '../src/lib/commerce/types';

const config: ShopConfig = {
	domain: 'sample.myshopify.com',
	token: 'public-store-token',
	version: '2026-07',
	live: true,
	accountUrl: '',
	newsletterUrl: ''
};
function request(headers: Record<string, string> = {}, body = '{"query":"{ shop { name } }"}') {
	return new Request('https://ellieseal.co.uk/__shopify/api/unstable/graphql.json', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Origin: 'https://ellieseal.co.uk', ...headers },
		body
	});
}
const reply = () => Response.json({ data: { shop: { name: 'Seal Stuff' } } });

describe('same-origin Shopify consent proxy', () => {
	it('uses the fixed store/public token and forwards consent signals without exposing unrelated cookies', async () => {
		const fetcher = vi.fn().mockResolvedValue(reply());
		const result = await proxyStorefront(
			request({
				Cookie:
					'app_session=secret; _shopify_essential=essential; _tracking_consent=consent; __cmp_a=cmp-consent; __cmp_unrelated=private; _shopify_analytics=analytics',
				'Sec-GPC': '1',
				'Shopify-Storefront-Consent-Management': '1',
				'X-Shopify-Storefront-Access-Token': 'wrong-token',
				'Shopify-Storefront-Buyer-IP': 'spoofed'
			}),
			'unstable',
			config,
			fetcher,
			'198.51.100.1'
		);
		expect(result.status).toBe(200);
		expect(fetcher.mock.calls[0][0]).toBe('https://sample.myshopify.com/api/unstable/graphql.json');
		const options = fetcher.mock.calls[0][1];
		expect(options.headers.get('Cookie')).not.toContain('app_session');
		expect(options.headers.get('Cookie')).toContain('_shopify_essential=essential');
		expect(options.headers.get('Cookie')).toContain('__cmp_a=cmp-consent');
		expect(options.headers.get('Cookie')).not.toContain('__cmp_unrelated');
		expect(options.headers.get('Sec-GPC')).toBe('1');
		expect(options.headers.get('Shopify-Storefront-Consent-Management')).toBe('1');
		expect(options.headers.get('Sec-Shopify-Storefront-Origin')).toBe('https://ellieseal.co.uk');
		expect(options.headers.get('X-Shopify-Storefront-Access-Token')).toBe(config.token);
		expect(options.headers.get('Shopify-Storefront-Buyer-IP')).toBe('198.51.100.1');
		expect(options.redirect).toBe('manual');
	});
	it('preserves separate Shopify cookies, prevents caching and discards stale tracking/transport headers', async () => {
		const headers = new Headers({
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=600',
			'Server-Timing': '_cmp;desc="stale"',
			'Content-Encoding': 'gzip'
		});
		headers.append('Set-Cookie', '_shopify_essential=one; Path=/; Secure; HttpOnly; SameSite=Lax');
		headers.append('Set-Cookie', '__cmp_a=three; Path=/; Secure; SameSite=Lax');
		headers.append(
			'Set-Cookie',
			'_tracking_consent=two; Path=/; Expires=Thu, 01 Jan 2027 00:00:00 GMT; Secure'
		);
		const result = await proxyStorefront(
			request(),
			'2026-07',
			config,
			vi.fn().mockResolvedValue(new Response('{}', { headers }))
		);
		expect(result.headers.getSetCookie()).toHaveLength(3);
		expect(result.headers.getSetCookie()[0]).toContain('HttpOnly');
		expect(result.headers.getSetCookie()[1]).toBe('__cmp_a=three; Path=/; Secure; SameSite=Lax');
		expect(result.headers.getSetCookie()[2]).toContain('Expires=Thu, 01 Jan 2027');
		expect(result.headers.get('Cache-Control')).toBe('private, no-store');
		expect(result.headers.get('CDN-Cache-Control')).toBe('no-store');
		expect(result.headers.has('Content-Encoding')).toBe(false);
		expect(result.headers.has('Server-Timing')).toBe(false);
	});
	it.each([
		[{ Origin: 'https://other.example' }, 403],
		[{ 'Sec-Fetch-Site': 'cross-site' }, 403],
		[{ 'Content-Type': 'text/plain' }, 415]
	])('rejects invalid request headers before contacting Shopify', async (headers, status) => {
		const fetcher = vi.fn();
		expect((await proxyStorefront(request(headers), '2026-07', config, fetcher)).status).toBe(
			status
		);
		expect(fetcher).not.toHaveBeenCalled();
	});
	it('rejects arbitrary versions, JSONP, non-POST methods and oversized bodies', async () => {
		const fetcher = vi.fn();
		expect((await proxyStorefront(request(), '2020-01', config, fetcher)).status).toBe(404);
		expect(
			(
				await proxyStorefront(
					new Request('https://ellieseal.co.uk/api/2026-07/graphql.json?callback=steal', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: '{}'
					}),
					'2026-07',
					config,
					fetcher
				)
			).status
		).toBe(400);
		expect(
			(
				await proxyStorefront(
					new Request('https://ellieseal.co.uk/api/2026-07/graphql.json'),
					'2026-07',
					config,
					fetcher
				)
			).status
		).toBe(405);
		expect(
			(await proxyStorefront(request({}, ' '.repeat(256 * 1024 + 1)), '2026-07', config, fetcher))
				.status
		).toBe(413);
		expect(fetcher).not.toHaveBeenCalled();
	});
	it.each(['not JSON', '{}', '{"query":null}', '[]'])(
		'rejects malformed payload %s',
		async (body) => {
			const fetcher = vi.fn();
			expect((await proxyStorefront(request({}, body), '2026-07', config, fetcher)).status).toBe(
				400
			);
			expect(fetcher).not.toHaveBeenCalled();
		}
	);
	it('does not expose network errors, follow redirects or return an HTML password page', async () => {
		for (const response of [
			Promise.reject(new Error('secret internal hostname')),
			Promise.resolve(
				new Response(null, { status: 302, headers: { Location: 'https://other.example' } })
			),
			Promise.resolve(
				new Response('<h1>password</h1>', { headers: { 'Content-Type': 'text/html' } })
			)
		]) {
			const result = await proxyStorefront(
				request(),
				'2026-07',
				config,
				vi.fn().mockImplementation(() => response)
			);
			expect(result.status).toBe(502);
			expect(await result.text()).not.toContain('secret');
			expect(result.headers.get('Cache-Control')).toBe('private, no-store');
		}
	});
});
