import { redirect } from '@sveltejs/kit';
export function load({ params }: { params: { slug: string } }) {
	redirect(308, '/shop/' + encodeURIComponent(params.slug));
}
