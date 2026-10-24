import { finishAccountLogin } from '$lib/server/customer-account';
import { getAccountConfig } from '$lib/server/customer-account-config';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url, fetch }) => {
	let destination = '/account';
	try {
		await finishAccountLogin(getAccountConfig(), cookies, url, fetch);
	} catch {
		destination = '/account?error=sign-in';
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
