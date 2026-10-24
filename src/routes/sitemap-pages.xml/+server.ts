import { getSiteOrigin } from '$lib/server/seo-config';
import { staticSitemapXml, xmlResponse } from '$lib/server/sitemap';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => xmlResponse(staticSitemapXml(getSiteOrigin(url)));
