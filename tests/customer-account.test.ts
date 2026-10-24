import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { Cookies } from '@sveltejs/kit';
import {
	accountConfigured,
	accountGraphql,
	accountSession,
	beginAccountLogin,
	clearAccountSession,
	discoverAccount,
	finishAccountLogin,
	openAccountData,
	pkceChallenge,
	readAccountSession,
	saveAccountSession,
	sealAccountData,
	trustedAccountUrl,
	verifyAccountIdToken,
	type AccountConfig,
	type AccountSession
} from '../src/lib/server/customer-account';

const config: AccountConfig = {
	domain: 'sample.myshopify.com',
	clientId: 'shop-client',
	sessionSecret: 'a-long-random-secret-for-tests-only-12345'
};
const url = new URL('https://ellieseal.co.uk/account');
const auth = {
	authorization_endpoint: 'https://shopify.com/authentication/123/oauth/authorize',
	token_endpoint: 'https://shopify.com/authentication/123/oauth/token',
	end_session_endpoint: 'https://shopify.com/authentication/123/logout',
	jwks_uri: 'https://shopify.com/authentication/123/.well-known/jwks.json',
	issuer: 'https://shopify.com/authentication/123'
};
const graphql = 'https://shopify.com/123/account/customer/api/2026-10/graphql';
const session = (): AccountSession => ({
	accessToken: 'private-access-token',
	refreshToken: 'private-refresh-token',
	idToken: 'private-id-token',
	accessExpiresAt: Date.now() + 3600000,
	expiresAt: Date.now() + 86400000
});
const jar = () => {
	const values = new Map<string, string>();
	const set = vi.fn((name: string, value: string) => values.set(name, value));
	const cookies = {
		get: (name: string) => values.get(name),
		set,
		delete: (name: string) => values.delete(name)
	} as unknown as Cookies;
	return { values, cookies, set };
};
const discoveryFetcher = (override: Record<string, unknown> = {}) =>
	vi.fn(async (input: RequestInfo | URL) => {
		const requestUrl = String(input);
		if (requestUrl.endsWith('/.well-known/openid-configuration'))
			return Response.json({ ...auth, ...override });
		if (requestUrl.endsWith('/.well-known/customer-account-api'))
			return Response.json({ graphql_api: graphql });
		throw new Error('Unexpected request');
	});
const encode = (value: Uint8Array) =>
	btoa(String.fromCharCode(...value))
		.replaceAll('+', '-')
		.replaceAll('/', '_')
		.replaceAll('=', '');
let keys: CryptoKeyPair;
let publicJwk: JsonWebKey;
beforeAll(async () => {
	keys = await crypto.subtle.generateKey(
		{
			name: 'RSASSA-PKCS1-v1_5',
			modulusLength: 2048,
			publicExponent: new Uint8Array([1, 0, 1]),
			hash: 'SHA-256'
		},
		true,
		['sign', 'verify']
	);
	publicJwk = await crypto.subtle.exportKey('jwk', keys.publicKey);
});
const claimsFor = (nonce: string) => ({
	iss: auth.issuer,
	aud: config.clientId,
	nonce,
	sub: 'customer-1',
	iat: Math.floor(Date.now() / 1000),
	exp: Math.floor(Date.now() / 1000) + 3600
});
async function signedToken(claims: Record<string, unknown>) {
	const encoder = new TextEncoder();
	const header = encode(encoder.encode(JSON.stringify({ alg: 'RS256', kid: 'test-key' })));
	const payload = encode(encoder.encode(JSON.stringify(claims)));
	const data = `${header}.${payload}`;
	return `${data}.${encode(new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', keys.privateKey, encoder.encode(data))))}`;
}

describe('customer account session protection', () => {
	it('requires a separate Customer Account client and strong session secret', () => {
		expect(accountConfigured(config)).toBe(true);
		expect(accountConfigured({ ...config, clientId: '' })).toBe(false);
		expect(accountConfigured({ ...config, sessionSecret: 'short' })).toBe(false);
	});
	it('encrypts and authenticates account state, binding it to its shop, client and purpose', async () => {
		const value = await sealAccountData(config, 'session', { token: 'never-readable' });
		expect(value).not.toContain('never-readable');
		expect(await openAccountData(config, 'session', value)).toEqual({ token: 'never-readable' });
		expect(await openAccountData(config, 'flow', value)).toBeNull();
		expect(
			await openAccountData({ ...config, clientId: 'another-client' }, 'session', value)
		).toBeNull();
		expect(await openAccountData(config, 'session', value.slice(0, -4) + 'AAAA')).toBeNull();
	});
	it('chunks long tokens into secure HttpOnly cookies and rejects missing fragments', async () => {
		const { cookies, values, set } = jar();
		const original = { ...session(), idToken: 'a'.repeat(4200) };
		await saveAccountSession(cookies, url, config, original);
		expect(values.size).toBeGreaterThan(1);
		for (const [name, value, options] of set.mock.calls as unknown as [
			string,
			string,
			Record<string, unknown>
		][]) {
			expect(name).toMatch(/^seal-account\d?$/);
			expect(value.length).toBeLessThan(3600);
			expect(options).toMatchObject({
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				path: '/account'
			});
		}
		expect(await readAccountSession(cookies, config)).toEqual(original);
		values.delete('seal-account1');
		expect(await readAccountSession(cookies, config)).toBeNull();
	});
	it('expires sessions and clears all fragments when signing out', async () => {
		const { cookies, values } = jar();
		await saveAccountSession(cookies, url, config, { ...session(), expiresAt: Date.now() - 1 });
		expect(await readAccountSession(cookies, config)).toBeNull();
		clearAccountSession(cookies);
		expect(values.size).toBe(0);
	});
	it('implements the RFC 7636 PKCE challenge without padding', async () => {
		expect(await pkceChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe(
			'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
		);
	});
});

describe('Shopify account discovery and OAuth', () => {
	it.each([
		'http://shopify.com/token',
		'https://evil.example/token',
		'https://shopify.com.evil.example/token',
		'https://user:pass@shopify.com/token',
		'https://shopify.com:8443/token'
	])('never sends account credentials to %s', (destination) =>
		expect(() => trustedAccountUrl(destination, config)).toThrow()
	);
	it('uses discovered endpoints and rejects an unsafe discovery result', async () => {
		expect(await discoverAccount(config, discoveryFetcher())).toEqual({ auth, graphql });
		await expect(
			discoverAccount(config, discoveryFetcher({ token_endpoint: 'https://evil.example/token' }))
		).rejects.toThrow('destination');
	});
	it('sends a fresh state, nonce and S256 challenge and returns to this app', async () => {
		const { cookies, values } = jar();
		const login = new URL(await beginAccountLogin(config, cookies, url, discoveryFetcher()));
		expect(login.origin).toBe('https://shopify.com');
		expect(login.searchParams.get('redirect_uri')).toBe('https://ellieseal.co.uk/account/callback');
		expect(login.searchParams.get('code_challenge_method')).toBe('S256');
		expect(login.searchParams.get('state')).toHaveLength(43);
		expect(login.searchParams.get('nonce')).toHaveLength(43);
		expect(values.get('seal-account-flow')).not.toContain(login.searchParams.get('state'));
	});
	it('rejects callbacks with a mismatched state before exchanging any token', async () => {
		const { cookies } = jar();
		const fetcher = discoveryFetcher();
		await beginAccountLogin(config, cookies, url, fetcher);
		fetcher.mockClear();
		await expect(
			finishAccountLogin(
				config,
				cookies,
				new URL('https://ellieseal.co.uk/account/callback?code=code&state=wrong'),
				fetcher
			)
		).rejects.toThrow('expired');
		expect(fetcher).not.toHaveBeenCalled();
	});
	it('verifies signature, issuer, audience, expiry and nonce before establishing a session', async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValue(
				Response.json({ keys: [{ ...publicJwk, kid: 'test-key', alg: 'RS256' }] })
			);
		await expect(
			verifyAccountIdToken(config, await signedToken(claimsFor('nonce')), 'nonce', auth, fetcher)
		).resolves.toBeUndefined();
		for (const bad of [
			{ nonce: 'wrong' },
			{ iss: 'https://evil.example' },
			{ aud: 'other-client' },
			{ exp: 0 }
		]) {
			await expect(
				verifyAccountIdToken(
					config,
					await signedToken({ ...claimsFor('nonce'), ...bad }),
					'nonce',
					auth,
					fetcher
				)
			).rejects.toThrow('verified');
		}
		const token = await signedToken(claimsFor('nonce'));
		await expect(
			verifyAccountIdToken(
				config,
				token.slice(0, -8) + 'AAAAAAAA',
				'nonce',
				auth,
				vi.fn().mockResolvedValue(Response.json({ keys: [{ ...publicJwk, kid: 'test-key' }] }))
			)
		).rejects.toThrow('verified');
	});
	it('finishes an authenticated callback once and never exposes tokens in customer data', async () => {
		const { cookies, values } = jar();
		const login = new URL(await beginAccountLogin(config, cookies, url, discoveryFetcher()));
		const nonce = login.searchParams.get('nonce')!;
		const idToken = await signedToken(claimsFor(nonce));
		const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			if (String(input) === auth.token_endpoint) {
				const body = init!.body as URLSearchParams;
				expect(new Headers(init?.headers).get('Origin')).toBe(url.origin);
				expect(new Headers(init?.headers).get('User-Agent')).toBeTruthy();
				expect(await pkceChallenge(body.get('code_verifier')!)).toBe(
					login.searchParams.get('code_challenge')
				);
				return Response.json({
					access_token: 'secret-access',
					refresh_token: 'secret-refresh',
					id_token: idToken,
					expires_in: 3600
				});
			}
			if (String(input) === auth.jwks_uri)
				return Response.json({ keys: [{ ...publicJwk, kid: 'test-key' }] });
			return discoveryFetcher()(input);
		});
		const callback = new URL(
			`https://ellieseal.co.uk/account/callback?state=${login.searchParams.get('state')}&code=code`
		);
		await finishAccountLogin(config, cookies, callback, fetcher);
		expect((await readAccountSession(cookies, config))?.accessToken).toBe('secret-access');
		expect([...values.values()].join('')).not.toContain('secret-access');
		await expect(finishAccountLogin(config, cookies, callback, fetcher)).rejects.toThrow('expired');
		expect(fetcher.mock.calls.filter(([input]) => input === auth.token_endpoint)).toHaveLength(1);
	});
	it('refreshes expired access tokens without extending the session lifetime', async () => {
		const { cookies } = jar();
		const previous = { ...session(), accessExpiresAt: Date.now() - 1000 };
		await saveAccountSession(cookies, url, config, previous);
		const fetcher = vi.fn(async (input: RequestInfo | URL) =>
			String(input) === auth.token_endpoint
				? Response.json({ access_token: 'refreshed', refresh_token: 'rotated', expires_in: 3600 })
				: discoveryFetcher()(input)
		);
		const result = await accountSession(config, cookies, url, fetcher);
		expect(result?.accessToken).toBe('refreshed');
		expect(result?.expiresAt).toBe(previous.expiresAt);
	});
	it('uses the authenticated customer token and never caches private data', async () => {
		const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			if (String(input) === graphql) {
				expect(new Headers(init?.headers).get('Authorization')).toBe('private-access-token');
				expect(init?.redirect).toBe('error');
				expect(init?.cache).toBe('no-store');
				return Response.json({ data: { customer: { firstName: 'Ellie' } } });
			}
			return discoveryFetcher()(input);
		});
		expect(
			await accountGraphql(config, session(), fetcher, 'query Customer { customer { firstName } }')
		).toEqual({ customer: { firstName: 'Ellie' } });
	});
});
