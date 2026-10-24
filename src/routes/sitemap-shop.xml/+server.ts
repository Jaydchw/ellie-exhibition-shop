import { getSiteOrigin } from '$lib/server/seo-config';
import { getShopConfig } from '$lib/server/shop-config';
import { shopSitemapResponse, sitemapXml, xmlResponse } from '$lib/server/sitemap';
import { getHostedShopUrl } from '$lib/server/hosted-shop-config';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url, fetch }) =>
	getHostedShopUrl(url)
		? xmlResponse(sitemapXml(getSiteOrigin(url), []))
		: shopSitemapResponse(getSiteOrigin(url), getShopConfig(), fetch);
