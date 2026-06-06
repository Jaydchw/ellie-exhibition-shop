import art1 from '$lib/assets/images/art-1.png';
import art2 from '$lib/assets/images/art-2.png';
import art3 from '$lib/assets/images/art-3.png';
import art4 from '$lib/assets/images/art-4.png';
import art5 from '$lib/assets/images/art-5.png';
import art6 from '$lib/assets/images/art-6.png';

export type DescriptionSegment = {
	text: string;
	italic?: boolean;
};

export type Artwork = {
	id: number;
	title: string;
	slug: string;
	image: string;
	alt: string;
	status?: 'placeholder-title';
	medium: string;
	price: number | null;
	dimensions: {
		height: string;
		width: string;
		depth: string;
	};
	description: DescriptionSegment[][];
};

export const paperDimensions = {
	height: '55.5 cm',
	width: '75.5 cm',
	depth: '0.01 cm'
};

export const artworks: Artwork[] = [
	{
		id: 1,
		title: 'It Feels Like a Cosmic Shard',
		slug: 'it-feels-like-a-cosmic-shard',
		image: art1,
		alt: 'Abstract black linework artwork with sharp horizontal shard forms and a reaching figure.',
		medium: 'Original on Fabriano paper',
		price: 60,
		dimensions: paperDimensions,
		description: [
			[
				{ text: 'It Feels Like a Cosmic Shard', italic: true },
				{
					text: ' is Seals first attempt at depicting expressive movement. The name '
				},
				{ text: 'Cosmic Shard', italic: true },
				{
					text: ' describes the feeling of cutting through space with her body and how dancing resembles an unearthly, unexplainable experience.'
				}
			]
		]
	},
	{
		id: 2,
		title: 'It Feels Like Love Is the Key',
		slug: 'it-feels-like-love-is-the-key',
		image: art2,
		alt: 'Abstract black linework artwork with a dancer figure and sweeping angular movement.',
		medium: 'Original on Fabriano paper',
		price: null,
		dimensions: paperDimensions,
		description: [
			[
				{ text: 'It Feels Like Love Is the Key', italic: true },
				{
					text: ' is a homage piece to the late Jonathan Gaughan, the grandfather of Ellie Seal. Johnathan Gaughan spent his life spreading love and faith through his music career. This pieces depicts the movement and emotion of Ellie Seal as she dances to his most popular song "'
				},
				{ text: 'Love Is the Key', italic: true },
				{
					text: '" a song describing how his faith guided him through his troubles and how loving one another is the key to redemption.'
				}
			]
		]
	},
	{
		id: 3,
		title: 'It Feels Like Good and Evil',
		slug: 'it-feels-like-good-and-evil',
		image: art3,
		alt: 'Abstract black linework composition with mirrored forms resembling a yin and yang butterfly.',
		medium: 'Original on Fabriano paper',
		price: 45,
		dimensions: paperDimensions,
		description: [
			[
				{ text: 'It Feels Like Good and Evil', italic: true },
				{
					text: ' is a pieces depicting Seals reliance on balance with body and mind. Seal believes dancing tangentially mirrors life in that we must create a balance between the body and mind to remain content. This is portrayed with a '
				},
				{ text: 'ying and yang', italic: true },
				{ text: ' inspired composition.' }
			]
		]
	},
	{
		id: 4,
		title: 'It Feels Like a Whirl Pool',
		slug: 'it-feels-like-a-whirl-pool',
		image: art4,
		alt: 'Abstract black linework artwork with looping forms and energetic dark shapes.',
		medium: 'Original on Fabriano paper',
		price: 50,
		dimensions: paperDimensions,
		description: [
			[
				{ text: 'It Feels Like a Whirl Pool', italic: true },
				{
					text: ' depicts a continuous cycle of swirling curves representing repetition and fluidity. This piece focuses on the physical feeling of moving through empty space, with Seals gestures flowing and filling up the area around her.'
				}
			]
		]
	},
	{
		id: 5,
		title: "It Feels Like It's Consuming Me",
		slug: 'it-feels-like-its-consuming-me',
		image: art5,
		alt: 'Abstract black linework artwork with circular movement and bold central forms.',
		medium: 'Original on Fabriano paper',
		price: 60,
		dimensions: paperDimensions,
		description: [
			[
				{ text: "It Feels Like It's Consuming Me", italic: true },
				{
					text: ' depicts Seals own movement wrapping and contorting around her physical form to portray her desperation for dance. This piece seperates Seals movement with her body whilst still implying their relation to one another.'
				}
			]
		]
	},
	{
		id: 6,
		title: 'It Feels Like a Ball of Light',
		slug: 'it-feels-like-a-ball-of-light',
		image: art6,
		alt: 'Abstract black linework artwork with long diagonal strokes and dance-like movement.',
		medium: 'Original on Fabriano paper',
		price: 35,
		dimensions: paperDimensions,
		description: [
			[
				{ text: 'It Feels Like a Ball of Light', italic: true },
				{
					text: ' describes a materialization of power felt by Seals dance. The physical ball acts as a compression holding the passion and energy exertion of her movement.'
				}
			]
		]
	}
];

export function getArtworkBySlug(slug: string) {
	return artworks.find((artwork) => artwork.slug === slug);
}

export function buildArtworkEmailText(artwork: Artwork) {
	const priceLine = artwork.price === null ? 'Price: TBC' : `Price: £${artwork.price}`;

	return [
		`Hi Ellie,`,
		``,
		`I would like to buy the original artwork "${artwork.title}" on Fabriano paper.`,
		``,
		priceLine,
		`*** REQUIRED: MY DELIVERY ADDRESS ***`,
		``,
		`Proof of payment screenshot: [please attach a screenshot showing payment for the correct amount before sending]`,
		``,
		`Thanks`
	].join('\n');
}

export function buildArtworkEmailSubject(artwork: Artwork) {
	return `Artwork purchase enquiry: ${artwork.title}`;
}

export function buildArtworkMailtoLink(artwork: Artwork) {
	const subject = buildArtworkEmailSubject(artwork);
	const body = buildArtworkEmailText(artwork);

	return `mailto:ellieseal59@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildArtworkBrowserEmailLink(artwork: Artwork) {
	const subject = buildArtworkEmailSubject(artwork);
	const body = buildArtworkEmailText(artwork);

	return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent('ellieseal59@gmail.com')}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
