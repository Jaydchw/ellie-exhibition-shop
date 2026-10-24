import type { Cookies } from '@sveltejs/kit';

export type AccountConfig = {
	domain: string;
	clientId: string;
	clientSecret?: string;
	sessionSecret: string;
	discoveryDomain?: string;
};
type AuthDiscovery = {
	authorization_endpoint: string;
	token_endpoint: string;
	end_session_endpoint: string;
	jwks_uri: string;
	issuer: string;
};
export type AccountSession = {
	accessToken: string;
	refreshToken?: string;
	idToken: string;
	accessExpiresAt: number;
	expiresAt: number;
};
type LoginFlow = {
	state: string;
	nonce: string;
	verifier: string;
	redirectUri: string;
	expiresAt: number;
};
type TokenResult = {
	access_token: string;
	id_token?: string;
	refresh_token?: string;
	expires_in: number;
};
export type AccountAddress = {
	id: string;
	firstName: string | null;
	lastName: string | null;
	address1: string | null;
	address2: string | null;
	city: string | null;
	zip: string | null;
	zoneCode: string | null;
	territoryCode: string | null;
	phoneNumber: string | null;
	formatted: string[];
};
export type AccountCustomer = {
	id: string;
	displayName: string;
	firstName: string | null;
	lastName: string | null;
	emailAddress: { emailAddress: string } | null;
	defaultAddress: AccountAddress | null;
	orders: {
		nodes: {
			id: string;
			name: string;
			processedAt: string;
			financialStatus: string | null;
			fulfillmentStatus: string;
			statusPageUrl: string;
			totalPrice: { amount: string; currencyCode: string };
		}[];
		pageInfo: { hasNextPage: boolean; endCursor: string | null };
	};
};

const encoder = new TextEncoder();
const sessionName = 'seal-account';
const flowName = 'seal-account-flow';
const sessionLifetime = 60 * 60 * 24 * 7;
const cookieChunkSize = 3500;
const cookieChunkCount = 3;

export function accountConfigured(config: AccountConfig) {
	return (
		/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(config.domain) &&
		!!config.clientId &&
		config.sessionSecret.length >= 32
	);
}

function base64url(bytes: Uint8Array) {
	return btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}
function decodeBase64url(value: string) {
	if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid encoded account state.');
	return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
}
export function accountRandom() {
	return base64url(crypto.getRandomValues(new Uint8Array(32)));
}
export async function pkceChallenge(verifier: string) {
	return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(verifier))));
}
function equalState(actual: string, expected: string) {
	if (actual.length !== expected.length) return false;
	let different = 0;
	for (let i = 0; i < actual.length; i++)
		different |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
	return different === 0;
}

async function sessionKey(secret: string) {
	if (secret.length < 32) throw new Error('Customer account sessions are not configured.');
	const digest = await crypto.subtle.digest('SHA-256', encoder.encode(secret));
	return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
function context(config: AccountConfig, purpose: string) {
	return encoder.encode(`Seal Stuff|${config.domain}|${config.clientId}|${purpose}`);
}
export async function sealAccountData(config: AccountConfig, purpose: string, data: unknown) {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encrypted = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv, additionalData: context(config, purpose) },
		await sessionKey(config.sessionSecret),
		encoder.encode(JSON.stringify(data))
	);
	return `${base64url(iv)}.${base64url(new Uint8Array(encrypted))}`;
}
export async function openAccountData<T>(config: AccountConfig, purpose: string, value: string) {
	try {
		const [iv, payload, extra] = value.split('.');
		if (!iv || !payload || extra) return null;
		const bytes = await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: decodeBase64url(iv), additionalData: context(config, purpose) },
			await sessionKey(config.sessionSecret),
			decodeBase64url(payload)
		);
		return JSON.parse(new TextDecoder().decode(bytes)) as T;
	} catch {
		return null;
	}
}
function cookieOptions(url: URL, maxAge?: number) {
	return {
		path: '/account',
		httpOnly: true,
		secure: url.protocol === 'https:',
		sameSite: 'lax' as const,
		...(maxAge !== undefined ? { maxAge } : {})
	};
}
function clearCookie(cookies: Cookies, name: string) {
	for (let i = 0; i < cookieChunkCount; i++)
		cookies.delete(`${name}${i || ''}`, { path: '/account' });
}
async function writeCookie(
	cookies: Cookies,
	url: URL,
	config: AccountConfig,
	name: string,
	data: unknown,
	maxAge: number
) {
	const sealed = await sealAccountData(config, name, data);
	const chunks = sealed.match(new RegExp(`.{1,${cookieChunkSize}}`, 'g'))!;
	if (chunks.length > cookieChunkCount)
		throw new Error('The customer account session is too large.');
	clearCookie(cookies, name);
	chunks.forEach((chunk, i) =>
		cookies.set(
			`${name}${i || ''}`,
			i ? chunk : `${chunks.length}:${chunk}`,
			cookieOptions(url, maxAge)
		)
	);
}
async function readCookie<T>(cookies: Cookies, config: AccountConfig, name: string) {
	const first = cookies.get(name);
	if (!first) return null;
	const colon = first.indexOf(':');
	const count = Number(first.slice(0, colon));
	if (colon !== 1 || !Number.isInteger(count) || count < 1 || count > cookieChunkCount) return null;
	let sealed = first.slice(colon + 1);
	for (let i = 1; i < count; i++) {
		const part = cookies.get(`${name}${i}`);
		if (!part) return null;
		sealed += part;
	}
	return openAccountData<T>(config, name, sealed);
}
export function clearAccountSession(cookies: Cookies) {
	clearCookie(cookies, sessionName);
	clearCookie(cookies, flowName);
}
export async function saveAccountSession(
	cookies: Cookies,
	url: URL,
	config: AccountConfig,
	session: AccountSession
) {
	await writeCookie(
		cookies,
		url,
		config,
		sessionName,
		session,
		Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000))
	);
}
export async function readAccountSession(cookies: Cookies, config: AccountConfig) {
	const session = await readCookie<AccountSession>(cookies, config, sessionName);
	return session &&
		typeof session.accessToken === 'string' &&
		typeof session.idToken === 'string' &&
		Number.isFinite(session.accessExpiresAt) &&
		session.expiresAt > Date.now()
		? session
		: null;
}

// Discovery documents are trusted only when served by this shop. Every returned
// destination is checked before it can receive an authorization code or token.
export function trustedAccountUrl(value: string, config: AccountConfig) {
	const url = new URL(value);
	const host = url.hostname.toLowerCase();
	const configured = config.discoveryDomain?.toLowerCase();
	if (
		url.protocol !== 'https:' ||
		url.username ||
		url.password ||
		url.port ||
		!(
			host === config.domain.toLowerCase() ||
			host === configured ||
			host === 'shopify.com' ||
			host.endsWith('.shopify.com')
		)
	) {
		throw new Error('Shopify returned an unsupported account destination.');
	}
	return url.href;
}
async function fetchJson<T>(fetcher: typeof fetch, url: string, init?: RequestInit): Promise<T> {
	const headers = new Headers(init?.headers);
	if (!headers.has('User-Agent')) headers.set('User-Agent', 'SealStuff-CustomerAccounts/1.0');
	const response = await fetcher(url, {
		...init,
		headers,
		cache: 'no-store',
		redirect: 'error',
		signal: AbortSignal.timeout(15000)
	});
	if (!response.ok) throw new Error('Your account could not be reached. Please try again.');
	return response.json() as Promise<T>;
}
export async function discoverAccount(config: AccountConfig, fetcher: typeof fetch) {
	if (!accountConfigured(config)) throw new Error('Customer accounts are not connected yet.');
	const domain = config.discoveryDomain || config.domain;
	const origin = trustedAccountUrl(`https://${domain}`, config).replace(/\/$/, '');
	const [auth, api] = await Promise.all([
		fetchJson<AuthDiscovery>(fetcher, `${origin}/.well-known/openid-configuration`),
		fetchJson<{ graphql_api: string }>(fetcher, `${origin}/.well-known/customer-account-api`)
	]);
	for (const value of [
		auth.authorization_endpoint,
		auth.token_endpoint,
		auth.end_session_endpoint,
		auth.jwks_uri,
		auth.issuer,
		api.graphql_api
	])
		trustedAccountUrl(value, config);
	return { auth, graphql: api.graphql_api };
}
export async function beginAccountLogin(
	config: AccountConfig,
	cookies: Cookies,
	url: URL,
	fetcher: typeof fetch
) {
	if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname))
		throw new Error('Sign-in requires a secure website.');
	const { auth } = await discoverAccount(config, fetcher);
	const flow: LoginFlow = {
		state: accountRandom(),
		nonce: accountRandom(),
		verifier: accountRandom(),
		redirectUri: new URL('/account/callback', url.origin).href,
		expiresAt: Date.now() + 600000
	};
	await writeCookie(cookies, url, config, flowName, flow, 600);
	const destination = new URL(auth.authorization_endpoint);
	for (const [key, value] of Object.entries({
		client_id: config.clientId,
		scope: 'openid email customer-account-api:full',
		response_type: 'code',
		redirect_uri: flow.redirectUri,
		state: flow.state,
		nonce: flow.nonce,
		code_challenge: await pkceChallenge(flow.verifier),
		code_challenge_method: 'S256'
	}))
		destination.searchParams.set(key, value);
	return destination.href;
}
async function tokenRequest(
	config: AccountConfig,
	endpoint: string,
	body: URLSearchParams,
	fetcher: typeof fetch,
	origin: string
) {
	const headers = new Headers({
		'Content-Type': 'application/x-www-form-urlencoded',
		Origin: origin
	});
	if (config.clientSecret)
		headers.set('Authorization', `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`);
	const result = await fetchJson<TokenResult>(fetcher, endpoint, { method: 'POST', headers, body });
	if (
		typeof result.access_token !== 'string' ||
		!result.access_token ||
		!Number.isFinite(result.expires_in) ||
		result.expires_in <= 0
	)
		throw new Error('Shopify did not return a valid account session.');
	return result;
}
export async function verifyAccountIdToken(
	config: AccountConfig,
	token: string,
	nonce: string,
	auth: AuthDiscovery,
	fetcher: typeof fetch
) {
	const parts = token.split('.');
	if (parts.length !== 3) throw new Error('Invalid sign-in response.');
	const decode = (value: string) => JSON.parse(new TextDecoder().decode(decodeBase64url(value)));
	const header = decode(parts[0]) as { alg: string; kid: string };
	const claims = decode(parts[1]) as {
		iss: string;
		aud: string | string[];
		exp: number;
		iat: number;
		nonce: string;
		sub: string;
	};
	if (
		header.alg !== 'RS256' ||
		!header.kid ||
		claims.iss !== auth.issuer ||
		!(Array.isArray(claims.aud)
			? claims.aud.includes(config.clientId)
			: claims.aud === config.clientId) ||
		!Number.isFinite(claims.exp) ||
		claims.exp * 1000 <= Date.now() ||
		!Number.isFinite(claims.iat) ||
		claims.iat * 1000 > Date.now() + 60000 ||
		!claims.sub ||
		!equalState(claims.nonce ?? '', nonce)
	)
		throw new Error('The sign-in response could not be verified.');
	const jwks = await fetchJson<{ keys: (JsonWebKey & { kid?: string; alg?: string })[] }>(
		fetcher,
		trustedAccountUrl(auth.jwks_uri, config)
	);
	const jwk = jwks.keys.find(
		(key) => key.kid === header.kid && key.kty === 'RSA' && (!key.alg || key.alg === 'RS256')
	);
	if (!jwk) throw new Error('The sign-in key could not be verified.');
	const key = await crypto.subtle.importKey(
		'jwk',
		jwk,
		{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
		false,
		['verify']
	);
	const valid = await crypto.subtle.verify(
		'RSASSA-PKCS1-v1_5',
		key,
		decodeBase64url(parts[2]),
		encoder.encode(`${parts[0]}.${parts[1]}`)
	);
	if (!valid) throw new Error('The sign-in response could not be verified.');
}
export async function finishAccountLogin(
	config: AccountConfig,
	cookies: Cookies,
	url: URL,
	fetcher: typeof fetch
) {
	const flow = await readCookie<LoginFlow>(cookies, config, flowName);
	clearCookie(cookies, flowName);
	const state = url.searchParams.get('state') ?? '';
	const code = url.searchParams.get('code');
	if (
		!flow ||
		!flow.state ||
		!flow.nonce ||
		!flow.verifier ||
		flow.expiresAt <= Date.now() ||
		!equalState(state, flow.state) ||
		flow.redirectUri !== new URL('/account/callback', url.origin).href ||
		!code ||
		url.searchParams.has('error')
	)
		throw new Error('Your sign-in link has expired. Please try again.');
	const { auth } = await discoverAccount(config, fetcher);
	const result = await tokenRequest(
		config,
		auth.token_endpoint,
		new URLSearchParams({
			client_id: config.clientId,
			grant_type: 'authorization_code',
			code,
			redirect_uri: flow.redirectUri,
			code_verifier: flow.verifier
		}),
		fetcher,
		url.origin
	);
	if (!result.id_token) throw new Error('Shopify did not verify this sign-in.');
	await verifyAccountIdToken(config, result.id_token, flow.nonce, auth, fetcher);
	const session: AccountSession = {
		accessToken: result.access_token,
		refreshToken: result.refresh_token,
		idToken: result.id_token,
		accessExpiresAt: Date.now() + result.expires_in * 1000,
		expiresAt: Date.now() + sessionLifetime * 1000
	};
	await saveAccountSession(cookies, url, config, session);
}
export async function accountSession(
	config: AccountConfig,
	cookies: Cookies,
	url: URL,
	fetcher: typeof fetch
) {
	const session = await readAccountSession(cookies, config);
	if (!session || session.accessExpiresAt > Date.now() + 30000) return session;
	if (!session.refreshToken) {
		clearAccountSession(cookies);
		return null;
	}
	try {
		const { auth } = await discoverAccount(config, fetcher);
		const refreshed = await tokenRequest(
			config,
			auth.token_endpoint,
			new URLSearchParams({
				client_id: config.clientId,
				grant_type: 'refresh_token',
				refresh_token: session.refreshToken
			}),
			fetcher,
			url.origin
		);
		const next = {
			...session,
			accessToken: refreshed.access_token,
			refreshToken: refreshed.refresh_token ?? session.refreshToken,
			accessExpiresAt: Date.now() + refreshed.expires_in * 1000
		};
		await saveAccountSession(cookies, url, config, next);
		return next;
	} catch {
		clearAccountSession(cookies);
		return null;
	}
}
export async function accountGraphql<T>(
	config: AccountConfig,
	session: AccountSession,
	fetcher: typeof fetch,
	query: string,
	variables: Record<string, unknown> = {}
): Promise<T> {
	const { graphql } = await discoverAccount(config, fetcher);
	const response = await fetchJson<{ data?: T; errors?: { message: string }[] }>(fetcher, graphql, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: session.accessToken },
		body: JSON.stringify({ query, variables })
	});
	if (!response.data || response.errors?.length)
		throw new Error('Your account could not be loaded. Please try again.');
	return response.data;
}
export const accountQuery = `query Account($after: String) { customer { id displayName firstName lastName emailAddress { emailAddress } defaultAddress { id firstName lastName address1 address2 city zip zoneCode territoryCode phoneNumber formatted } orders(first: 10, after: $after, reverse: true, sortKey: PROCESSED_AT) { nodes { id name processedAt financialStatus fulfillmentStatus statusPageUrl totalPrice { amount currencyCode } } pageInfo { hasNextPage endCursor } } } }`;
