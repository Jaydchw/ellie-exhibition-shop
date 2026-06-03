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
		price: 35,
		dimensions: paperDimensions,
		description: [
			[
				{ text: 'It Feels Like a Cosmic Shard', italic: true },
				{
					text: " is Seal's first attempt at depicting expressive movement."
				}
			],
			[
				{ text: 'Cosmic shard', italic: true },
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
		price: 60,
		dimensions: paperDimensions,
		description: [
			[
				{ text: 'It Feels Like Love Is the Key', italic: true },
				{
					text: ' is a homage piece to the late Jonathan Gaughan, the grandfather of Ellie Seal. Jonathan Gaughan spent his life spreading love and faith through his music career.'
				}
			],
			[
				{
					text: 'This piece depicts the movement and emotion of Ellie Seal as she dances to his most popular song '
				},
				{ text: 'Love Is the Key', italic: true },
				{
					text: ', a song describing how his faith guided him through his troubles and how loving one another is the key to redemption.'
				}
			]
		]
	},
	{
		id: 3,
		title: 'Untitled Balance Study',
		slug: 'untitled-balance-study',
		image: art3,
		alt: 'Abstract black linework composition with mirrored forms resembling a yin and yang butterfly.',
		status: 'placeholder-title',
		medium: 'Original on Fabriano paper',
		price: null,
		dimensions: paperDimensions,
		description: [
			[
				{ text: 'Untitled Balance Study', italic: true },
				{
					text: " is a piece depicting Seal's reliance on balance with body and mind."
				}
			],
			[
				{
					text: 'Seal believes dancing tangentially mirrors life in that we must create a balance between the body and mind to remain content. This is portrayed with a '
				},
				{ text: 'yin and yang', italic: true },
				{ text: ' inspired composition.' }
			]
		]
	},
	{
		id: 4,
		title: 'Untitled Movement Study II',
		slug: 'untitled-movement-study-ii',
		image: art4,
		alt: 'Abstract black linework artwork with looping forms and energetic dark shapes.',
		status: 'placeholder-title',
		medium: 'Original on Fabriano paper',
		price: 45,
		dimensions: paperDimensions,
		description: [
			[
				{ text: 'Untitled Movement Study II', italic: true },
				{
					text: ' explores how a dancing body can be translated into sweeping lines, suspended weight, and controlled release.'
				}
			],
			[
				{
					text: 'The composition keeps the marks open and minimal, allowing the viewer to follow rhythm, breath, and gesture through negative space.'
				}
			]
		]
	},
	{
		id: 5,
		title: 'Untitled Movement Study III',
		slug: 'untitled-movement-study-iii',
		image: art5,
		alt: 'Abstract black linework artwork with circular movement and bold central forms.',
		status: 'placeholder-title',
		medium: 'Original on Fabriano paper',
		price: 60,
		dimensions: paperDimensions,
		description: [
			[
				{ text: 'Untitled Movement Study III', italic: true },
				{
					text: ' studies rotation, balance, and the pressure of a gesture as it travels across a surface.'
				}
			],
			[
				{
					text: 'Bold black forms anchor the work while finer lines suggest the traces left behind by motion.'
				}
			]
		]
	},
	{
		id: 6,
		title: 'Untitled Movement Study IV',
		slug: 'untitled-movement-study-iv',
		image: art6,
		alt: 'Abstract black linework artwork with long diagonal strokes and dance-like movement.',
		status: 'placeholder-title',
		medium: 'Original on Fabriano paper',
		price: 60,
		dimensions: paperDimensions,
		description: [
			[
				{ text: 'Untitled Movement Study IV', italic: true },
				{
					text: ' focuses on expansion, reach, and the charged moments between one physical shape and the next.'
				}
			],
			[
				{
					text: 'Its long diagonals create a sense of momentum, while softer curves hold the composition in tension.'
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

export function buildArtworkEmailLink(artwork: Artwork) {
	const subject = `Artwork purchase enquiry: ${artwork.title}`;
	const body = buildArtworkEmailText(artwork);

	return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent('ellieseal59@gmail.com')}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
