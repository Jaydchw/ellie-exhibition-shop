import {
	clearAccountSession,
	discoverAccount,
	readAccountSession
} from '$lib/server/customer-account';
import { getAccountConfig } from '$lib/server/customer-account-config';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, url, fetch, request }) => {
	if (request.headers.get('origin') !== url.origin)
		return new Response('Please sign out from this website.', { status: 403 });
	const config = getAccountConfig();
	const session = await readAccountSession(cookies, config);
	clearAccountSession(cookies);
	let destination = '/account';
	if (session) {
		try {
			const { auth } = await discoverAccount(config, fetch);
			const logout = new URL(auth.end_session_endpoint);
			logout.searchParams.set('id_token_hint', session.idToken);
			logout.searchParams.set('post_logout_redirect_uri', new URL('/account', url.origin).href);
			destination = logout.href;
		} catch {
			/* The local session is cleared even if Shopify cannot be reached. */
		}
	}
	return new Response(null, {
		status: 303,
		headers: {
			Location: destination,
			'Cache-Control': 'no-store',
			'Referrer-Policy': 'no-referrer'
		}
	});
};
