import { describe, expect, it } from 'vitest';
import { productionRedirect, resolveSeoConfig } from '../src/lib/seo-config';

describe('canonical deployment', () => {
	it('indexes the public domain and keeps local and branch previews out of search', () => {
		expect(
			resolveSeoConfig(new URL('https://ellieseal.co.uk/murals/hull')).indexableDeployment
		).toBe(true);
		for (const host of [
			'http://localhost:5173',
			'https://branch.ellie-exhibition-shop.pages.dev'
		]) {
			expect(resolveSeoConfig(new URL(host))).toEqual({
				siteUrl: 'https://ellieseal.co.uk',
				indexableDeployment: false
			});
		}
	});
	it('honours a valid production override and rejects unsafe or local origins', () => {
		expect(
			resolveSeoConfig(new URL('https://example.com/shop'), 'https://example.com/path?query=1')
		).toEqual({ siteUrl: 'https://example.com', indexableDeployment: true });
		for (const value of [
			'javascript:alert(1)',
			'https://user:secret@example.com',
			'http://localhost:5173',
			'https://127.0.0.1',
			'not a url'
		]) {
			expect(resolveSeoConfig(new URL('https://ellieseal.co.uk'), value).siteUrl).toBe(
				'https://ellieseal.co.uk'
			);
		}
	});
	it('redirects only public host aliases and preserves path and parameters', () => {
		expect(
			productionRedirect(
				new URL('http://www.ellieseal.co.uk/murals/hull?q=wall'),
				'https://ellieseal.co.uk'
			)
		).toBe('https://ellieseal.co.uk/murals/hull?q=wall');
		expect(
			productionRedirect(new URL('https://branch.example/murals'), 'https://ellieseal.co.uk')
		).toBeNull();
		expect(
			productionRedirect(new URL('https://ellieseal.co.uk/murals'), 'https://ellieseal.co.uk')
		).toBeNull();
	});
});
