import { describe, expect, it, vi } from 'vitest';
import {
	getPolicies,
	policyContent,
	policyText,
	type PolicyNode
} from '../src/lib/commerce/policies';
import type { ShopConfig } from '../src/lib/commerce/types';

const config: ShopConfig = {
	domain: 'sample.myshopify.com',
	token: 'public-test-token',
	version: '2026-07',
	live: true,
	accountUrl: '',
	newsletterUrl: ''
};
function elements(nodes: PolicyNode[]): Exclude<PolicyNode, { text: string }>[] {
	return nodes.flatMap((node) => ('text' in node ? [] : [node, ...elements(node.children)]));
}

describe('Shopify policy content', () => {
	it('preserves merchant headings, lists, formatting, contact links and local policy links', () => {
		const nodes = policyContent(
			'<h1>Privacy &amp; choices</h1><p>Your <strong>rights</strong>.</p><ul><li><a href="mailto:ellie@example.com">Email</a></li><li><a href="https://sample.myshopify.com/policies/refund-policy">Refunds</a></li></ul>',
			config.domain
		);
		const tags = elements(nodes);
		expect(tags.map((node) => node.tag)).toEqual(['h2', 'p', 'strong', 'ul', 'li', 'a', 'li', 'a']);
		expect(tags.filter((node) => node.tag === 'a').map((node) => node.href)).toEqual([
			'mailto:ellie@example.com',
			'/policies/refund-policy'
		]);
		expect(policyText(nodes)).toBe('Privacy & choices Your rights . Email Refunds');
	});
	it.each([
		'javascript:alert(1)',
		'jav&#x61;script:alert(1)',
		'java&#10;script:alert(1)',
		'javascript&colon;alert(1)',
		'data:text/html,unsafe',
		'//example.com/track',
		'https://name:secret@example.com'
	])('omits unsafe link %s and every event/style attribute', (href) => {
		const [anchor] = elements(
			policyContent(
				`<a href="${href}" onclick="alert(1)" style="color:red" target="_blank">Contact</a>`,
				config.domain
			)
		);
		expect(anchor).toEqual({ tag: 'a', children: [{ text: 'Contact' }] });
	});
	it('does not represent executable or embedded elements and keeps entity-encoded markup as inert text', () => {
		const nodes = policyContent(
			'<script>alert(1)</script><svg><a href="javascript:1">Hidden</a></svg><img src=x onerror=alert(1)><p>&lt;script&gt;literal&lt;/script&gt;</p>',
			config.domain
		);
		expect(elements(nodes).map((node) => node.tag)).toEqual(['p']);
		expect(policyText(nodes)).toBe('<script>literal</script>');
	});
	it('bounds nested component depth for malformed or excessive merchant markup', () => {
		const nodes = policyContent(
			'<div>'.repeat(1000) + 'Policy text' + '</div>'.repeat(1000),
			config.domain
		);
		const depth = (entries: PolicyNode[]): number =>
			Math.max(0, ...entries.map((node) => ('text' in node ? 0 : 1 + depth(node.children))));
		expect(depth(nodes)).toBeLessThanOrEqual(32);
		expect(policyText(nodes)).toBe('Policy text');
	});
	it('namespaces merchant anchor identifiers without allowing arbitrary attributes', () => {
		const tags = elements(
			policyContent(
				'<h2 id="your-rights">Rights</h2><a href="#your-rights">Jump</a>',
				config.domain
			)
		);
		expect(tags[0].id).toBe('policy-your-rights');
		expect(tags[1].href).toBe('#policy-your-rights');
	});
});

describe('Shopify policies API', () => {
	it('uses the merchant policies and excludes empty or unpublished legal content', async () => {
		const fetcher = vi.fn().mockResolvedValue(
			Response.json({
				data: {
					shop: {
						privacyPolicy: {
							id: 'privacy',
							title: 'Your privacy',
							body: '<h2>Your choices</h2><p>Merchant privacy text.</p>'
						},
						refundPolicy: null,
						shippingPolicy: { id: 'shipping', title: 'Shipping', body: '<p> </p>' },
						termsOfService: {
							id: 'terms',
							title: 'Terms',
							body: '<script>not policy content</script>'
						}
					}
				}
			})
		);
		const policies = await getPolicies(config, fetcher);
		expect(policies).toHaveLength(1);
		expect(policies[0]).toMatchObject({
			handle: 'privacy-policy',
			title: 'Your privacy',
			description: 'Your choices Merchant privacy text.'
		});
		const request = JSON.parse(fetcher.mock.calls[0][1].body);
		expect(request.query).toContain('privacyPolicy { id title body }');
		expect(request.query).toContain('termsOfService { id title body }');
	});
	it('reports unavailable policies rather than inventing fallback legal text', async () => {
		await expect(
			getPolicies(config, vi.fn().mockResolvedValue(new Response('', { status: 503 })))
		).rejects.toThrow('shop');
		const fetcher = vi.fn();
		await expect(getPolicies({ ...config, live: false }, fetcher)).rejects.toThrow('not connected');
		expect(fetcher).not.toHaveBeenCalled();
	});
});
