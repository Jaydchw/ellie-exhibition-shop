import { getSiteOrigin } from '$lib/server/seo-config';
import { robotsText } from '$lib/server/sitemap';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) =>
	new Response(robotsText(getSiteOrigin(url)), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=300, s-maxage=300',
			'X-Content-Type-Options': 'nosniff'
		}
	});
