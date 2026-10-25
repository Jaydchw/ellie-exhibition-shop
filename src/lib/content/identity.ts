import { socialLinks } from './site';
import { absoluteImageUrl, canonicalUrl } from '../seo';

export function siteIdentity(siteUrl: string, portrait: string, hostedShopUrl?: string | null) {
	const home = canonicalUrl(siteUrl);
	const artist = home + '#artist';
	const organization = home + '#organization';
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': home + '#website',
				name: 'Ellie Seal',
				alternateName: 'Seal Stuff',
				url: home,
				inLanguage: 'en-GB',
				publisher: { '@id': organization },
				author: { '@id': artist }
			},
			{
				'@type': 'Person',
				'@id': artist,
				name: 'Ellie Seal',
				url: home,
				jobTitle: 'Artist and mural painter',
				image: absoluteImageUrl(siteUrl, portrait),
				sameAs: [socialLinks.instagram.href, socialLinks.facebook.href]
			},
			{
				'@type': 'OnlineStore',
				'@id': organization,
				name: 'Seal Stuff',
				url: hostedShopUrl || canonicalUrl(siteUrl, '/shop'),
				email: socialLinks.email.handle,
				sameAs: [socialLinks.instagram.href],
				brand: { '@type': 'Brand', name: 'Seal Stuff' }
			}
		]
	};
}
