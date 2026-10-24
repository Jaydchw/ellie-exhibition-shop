import { env } from '$env/dynamic/public';
import { resolveSeoConfig } from '$lib/seo-config';

export function getSeoConfig(url: URL) {
	return resolveSeoConfig(url, env.PUBLIC_SITE_URL);
}

export function getSiteOrigin(url: URL): string {
	return getSeoConfig(url).siteUrl;
}
