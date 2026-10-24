// The public website listed by Culture Hull. Deployments can override this
// canonical origin without rebuilding through PUBLIC_SITE_URL.
export const defaultSiteUrl = 'https://ellieseal.co.uk';

export function resolveSeoConfig(requestUrl: URL, configuredUrl = '') {
	let canonical = new URL(defaultSiteUrl);
	try {
		const candidate = new URL(configuredUrl);
		if (
			candidate.protocol === 'https:' &&
			!candidate.username &&
			!candidate.password &&
			!candidate.port &&
			candidate.hostname !== 'localhost' &&
			!candidate.hostname.endsWith('.localhost') &&
			!/^\d+(?:\.\d+){3}$/.test(candidate.hostname) &&
			!candidate.hostname.startsWith('[')
		)
			canonical = candidate;
	} catch {
		// An unset or invalid override must not generate malformed canonical URLs.
	}
	return {
		siteUrl: canonical.origin,
		indexableDeployment: requestUrl.origin === canonical.origin
	};
}

export function productionRedirect(requestUrl: URL, siteUrl: string): string | null {
	const canonical = new URL(siteUrl);
	const bareHost = (host: string) => host.replace(/^www\./, '');
	if (bareHost(requestUrl.hostname) !== bareHost(canonical.hostname)) return null;
	if (requestUrl.origin === canonical.origin) return null;
	const destination = new URL(requestUrl);
	destination.protocol = canonical.protocol;
	destination.hostname = canonical.hostname;
	destination.port = '';
	return destination.href;
}
