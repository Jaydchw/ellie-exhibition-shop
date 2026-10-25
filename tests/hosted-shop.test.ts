import { describe, expect, it } from 'vitest';
import { hostedShopDestination, onlineStoreOrigin } from '../src/lib/server/hosted-shop';

const options = { siteUrl: 'https://ellieseal.co.uk', storeDomain: 'pr8fqg-6y.myshopify.com' };
const destination = (path: string, overrides = {}, method = 'GET') =>
	hostedShopDestination(new URL(path, options.siteUrl), { ...options, ...overrides }, method);

describe('Shopify-hosted shopping handoff', () => {
	it('provides native shop links on previews without redirecting the preserved custom storefront', () => {
		expect(onlineStoreOrigin(options)).toBe('https://pr8fqg-6y.myshopify.com/');
		expect(onlineStoreOrigin({ ...options, shopUrl: 'https://shop.ellieseal.co.uk' })).toBe(
			'https://shop.ellieseal.co.uk/'
		);
		for (const origin of [
			'http://localhost:5173',
			'https://preview.ellie-exhibition-shop.pages.dev'
		]) {
			expect(hostedShopDestination(new URL('/shop', origin), options)).toBeNull();
		}
		expect(onlineStoreOrigin({ ...options, shopUrl: options.siteUrl })).toBeNull();
		expect(onlineStoreOrigin({ ...options, shopUrl: 'javascript:alert(1)' })).toBeNull();
	});
	it('opens the native Shopify shop without needing a Storefront API credential', () => {
		expect(destination('/shop')).toBe('https://pr8fqg-6y.myshopify.com/');
		expect(destination('/shop/')).toBe('https://pr8fqg-6y.myshopify.com/');
		expect(destination('/shop', {}, 'HEAD')).toBe('https://pr8fqg-6y.myshopify.com/');
		expect(destination('/shop', { storeDomain: undefined })).toBe(
			'https://pr8fqg-6y.myshopify.com/'
		);
		expect(destination('/shop', { storeDomain: '  ' })).toBe('https://pr8fqg-6y.myshopify.com/');
	});
	it('hands account entry points and the cart to native Shopify without forwarding return URLs', () => {
		for (const method of ['GET', 'HEAD']) {
			for (const path of ['/account', '/account/', '/account/login', '/account/login/']) {
				expect(
					destination(`${path}?return_to=https://other.example&code=local-code`, {}, method)
				).toBe('https://pr8fqg-6y.myshopify.com/account');
			}
			expect(destination('/cart?checkout=1', {}, method)).toBe(
				'https://pr8fqg-6y.myshopify.com/cart'
			);
		}
	});
	it('keeps OAuth endpoints, nested account routes and cart mutations in the custom app', () => {
		for (const path of [
			'/account/callback?code=local-code&state=local-state',
			'/account/logout',
			'/account/login/callback',
			'/account/orders',
			'/cart/add'
		]) {
			expect(destination(path)).toBeNull();
		}
		for (const path of ['/account', '/account/login', '/cart']) {
			for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
				expect(destination(path, {}, method)).toBeNull();
			}
		}
	});
	it('hands legacy saved and policy links to the native shop while leaving artist content local', () => {
		expect(destination('/saved')).toBe('https://pr8fqg-6y.myshopify.com/');
		expect(destination('/policies')).toBe(
			'https://pr8fqg-6y.myshopify.com/policies/privacy-policy'
		);
		expect(destination('/policies/refund-policy')).toBe(
			'https://pr8fqg-6y.myshopify.com/policies/refund-policy'
		);
		expect(destination('/policies/privacy-policy?return_to=https://other.example')).toBe(
			'https://pr8fqg-6y.myshopify.com/policies/privacy-policy'
		);
		for (const path of ['/policies/a%2Fb', '/policies/../contact', '/policies', '/saved']) {
			expect(destination(path, {}, 'POST')).toBeNull();
		}
	});
	it('hands legacy support and data-sharing links to the native Shopify pages', () => {
		for (const method of ['GET', 'HEAD']) {
			for (const path of ['/help', '/help/']) {
				expect(destination(path, {}, method)).toBe('https://pr8fqg-6y.myshopify.com/pages/contact');
			}
			for (const path of ['/contact', '/contact/']) {
				expect(destination(`${path}?return_to=https://other.example`, {}, method)).toBe(
					'https://shop.ellieseal.co.uk/pages/contact'
				);
			}
			expect(
				destination('/pages/data-sharing-opt-out?return_to=https://other.example', {}, method)
			).toBe('https://pr8fqg-6y.myshopify.com/pages/data-sharing-opt-out');
		}
		for (const path of ['/help', '/contact', '/pages/data-sharing-opt-out']) {
			expect(destination(path, {}, 'POST')).toBeNull();
			expect(hostedShopDestination(new URL(path, 'http://localhost:5173'), options)).toBeNull();
		}
	});
	it('keeps existing product and collection links on corresponding Shopify pages', () => {
		expect(destination('/shop/movement-study')).toBe(
			'https://pr8fqg-6y.myshopify.com/products/movement-study'
		);
		expect(destination('/collections/originals')).toBe(
			'https://pr8fqg-6y.myshopify.com/collections/originals'
		);
		expect(destination('/shop?category=prints')).toBe(
			'https://pr8fqg-6y.myshopify.com/collections/prints'
		);
	});
	it('converts product variants and searches while dropping unrelated app parameters', () => {
		expect(
			destination(
				'/shop/movement-study?variant=gid%3A%2F%2Fshopify%2FProductVariant%2F123&redirect=https://other.example'
			)
		).toBe('https://pr8fqg-6y.myshopify.com/products/movement-study?variant=123');
		expect(destination('/shop?q=blue+painting&finish=Poster&category=prints')).toBe(
			'https://pr8fqg-6y.myshopify.com/search?q=blue+painting&type=product'
		);
	});
	it('opens native product search from the header shortcut while retaining a real query', () => {
		for (const method of ['GET', 'HEAD']) {
			expect(destination('/shop?search=1', {}, method)).toBe(
				'https://pr8fqg-6y.myshopify.com/search?type=product'
			);
			expect(destination('/shop?search=1&q=++&category=prints', {}, method)).toBe(
				'https://pr8fqg-6y.myshopify.com/search?type=product'
			);
			expect(destination('/shop?search=1&q=blue+painting&category=prints', {}, method)).toBe(
				'https://pr8fqg-6y.myshopify.com/search?q=blue+painting&type=product'
			);
		}
		expect(destination('/shop?search=1', {}, 'POST')).toBeNull();
		expect(destination('/shop?search=0&category=prints')).toBe(
			'https://pr8fqg-6y.myshopify.com/collections/prints'
		);
	});
	it('preserves the custom shop as a reference on local and branch-preview hosts', () => {
		for (const origin of [
			'http://localhost:5173',
			'https://preview.ellie-exhibition-shop.pages.dev'
		]) {
			for (const path of [
				'/shop',
				'/shop?search=1',
				'/shop/a-painting',
				'/account',
				'/account/login',
				'/cart',
				'/saved',
				'/help',
				'/contact',
				'/pages/data-sharing-opt-out',
				'/policies/privacy-policy'
			]) {
				expect(hostedShopDestination(new URL(path, origin), options)).toBeNull();
			}
		}
	});
	it('does not divert artist pages, authentication callbacks or request bodies', () => {
		for (const path of [
			'/',
			'/about',
			'/murals',
			'/account/callback',
			'/shop/a-painting/unexpected'
		]) {
			expect(destination(path)).toBeNull();
		}
		expect(destination('/shop', {}, 'POST')).toBeNull();
	});
	it('supports a branded shop hostname without looping back into this app', () => {
		expect(destination('/shop', { shopUrl: 'https://shop.ellieseal.co.uk' })).toBe(
			'https://shop.ellieseal.co.uk/'
		);
		for (const shopUrl of [
			'https://ellieseal.co.uk',
			'https://www.ellieseal.co.uk',
			'javascript:alert(1)',
			'http://store.example',
			'https://user:secret@store.example',
			'https://store.example/path',
			'https://store.example?next=/shop',
			'https://127.0.0.1'
		]) {
			expect(destination('/shop', { shopUrl })).toBeNull();
		}
	});
	it('does not accept invalid store domains or encoded path traversal', () => {
		expect(destination('/shop', { storeDomain: 'other.example' })).toBeNull();
		expect(destination('/shop/a%2Fb')).toBeNull();
		expect(destination('/shop/%ZZ')).toBeNull();
	});
});
