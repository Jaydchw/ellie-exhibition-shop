import { getSiteOrigin } from '$lib/server/seo-config';
import { sitemapIndexXml, xmlResponse } from '$lib/server/sitemap';
import { getHostedShopUrl } from '$lib/server/hosted-shop-config';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = ({ url }) =>
	xmlResponse(
		sitemapIndexXml(getSiteOrigin(url), getHostedShopUrl(url) ? ['/sitemap-pages.xml'] : undefined)
	);
