import { error } from '@sveltejs/kit';
import { artworks, buildArtworkEmailLink, getArtworkBySlug } from '$lib/art';

export const prerender = true;

export function entries() {
	return artworks.map((artwork) => ({ slug: artwork.slug }));
}

export function load({ params }) {
	const artwork = getArtworkBySlug(params.slug);

	if (!artwork) {
		error(404, 'Artwork not found');
	}

	return {
		artwork,
		emailLink: buildArtworkEmailLink(artwork)
	};
}
