import { redirect } from '@sveltejs/kit';
import { beginAccountLogin } from '$lib/server/customer-account';
import { getAccountConfig } from '$lib/server/customer-account-config';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url, fetch }) => {
	let destination;
	try {
		destination = await beginAccountLogin(getAccountConfig(), cookies, url, fetch);
	} catch {
		redirect(303, '/account?error=sign-in');
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
