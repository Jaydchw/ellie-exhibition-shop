import botanicalKitchen from '$lib/assets/images/murals/botanical-kitchen-mural.jpg';
import berryWhip from '$lib/assets/images/murals/berry-whip-mural-collaboration.jpg';
import coastalMural from '$lib/assets/images/murals/coastal-mural-collaboration.jpg';
import tropicalMural from '$lib/assets/images/murals/tropical-community-mural-collaboration.jpg';
import muralArtist from '$lib/assets/images/murals/ellie-seal-mural-artist.png';
import koiFish from '$lib/assets/images/mural-concepts/koi-fish-illustration.png';
import lilies from '$lib/assets/images/mural-concepts/lily-illustration.png';
import horse from '$lib/assets/images/mural-concepts/horse-illustration.png';
import parrot from '$lib/assets/images/mural-concepts/parrot-illustration.png';
import ladybird from '$lib/assets/images/mural-concepts/ladybird-illustration.png';
import strawberries from '$lib/assets/images/mural-concepts/strawberries-illustration.jpg';
import blankWall from '$lib/assets/images/mural-inquiry-photos/blank-coffee-shop-wall.jpg';
import finishedParrot from '$lib/assets/images/mural-inquiry-photos/finished-parrot-wall-mockup.png';
import largeParrot from '$lib/assets/images/mural-inquiry-photos/large-parrot-wall-mockup.png';
import parrotReference from '$lib/assets/images/mural-inquiry-photos/parrot-collage-reference.jpg';
import smallParrot from '$lib/assets/images/mural-inquiry-photos/small-parrot-wall-mockup.png';

export type GalleryItem = {
	title: string;
	image: string;
	alt: string;
};

export type ChatMessage = {
	sender: 'client' | 'ellie';
	text: string;
	media?: { image: string; alt: string };
	mediaFirst?: boolean;
};

export const muralPageCopy = {
	metaDescription:
		'View murals by Ellie Seal, check whether your wall is suitable and learn how to request a custom mural.',
	sections: [
		{ label: 'Previous Work', shortLabel: 'Prev.', href: '#previous-work', icon: 'work' },
		{
			label: 'Artwork Examples',
			shortLabel: 'Artwork',
			href: '#artwork-examples',
			icon: 'examples'
		},
		{ label: 'Enquiries', shortLabel: 'Enquire', href: '#commission-process', icon: 'enquiry' },
		{ label: 'Contact', shortLabel: 'Contact', href: '#contact', icon: 'contact' }
	],
	hero: {
		eyebrow: 'Murals',
		title: 'Custom Murals for Your Space',
		intro: 'Ellie paints colourful murals based on your wall, ideas and preferred style.',
		primaryAction: 'Message Ellie',
		image: muralArtist,
		imageAlt: 'Ellie Seal holding a paintbrush'
	},
	work: {
		eyebrow: 'Previous work',
		title: 'Murals',
		intro: 'View Ellie’s previous mural work.'
	},
	preferences: {
		eyebrow: 'Dos and don’ts',
		title: 'Before You Enquire',
		intro: 'Check the subject and wall before sending a message.',
		dosTitle: 'Ellie Can Paint',
		dos: ['Plants and flowers', 'Lettering', 'Animals and bugs', 'Abstract designs'],
		dontsTitle: 'Ellie Does Not Offer',
		donts: ['Human faces', 'Extreme photorealism', 'Heavily textured walls'],
		wallNote:
			'The wall should be smooth and already painted. A base coat can be added for an extra cost if the paint is purchased in advance.'
	},
	concepts: {
		eyebrow: 'Artwork examples',
		title: 'Style Examples',
		intro: 'These examples show subjects and drawing styles that can be adapted for a mural.'
	},
	process: {
		eyebrow: 'Enquiries',
		title: 'How an Enquiry Works',
		intro: 'What Ellie can paint, what your wall needs and an example conversation.'
	},
	contact: {
		eyebrow: 'Contact',
		title: 'Request a Mural',
		intro: 'Facebook Messenger is preferred. Instagram and email are also available.'
	}
} as const;

export const muralProjects: GalleryItem[] = [
	{
		title: 'Botanical Kitchen Mural',
		image: botanicalKitchen,
		alt: 'Botanical mural with large pink flowers, green branches and abstract shapes on a kitchen wall'
	},
	{
		title: 'Berry Whip Mural',
		image: berryWhip,
		alt: 'Artists standing in front of a pink mural with bold Berry Whip lettering'
	},
	{
		title: 'Tropical Mural Project',
		image: tropicalMural,
		alt: 'Mural group in front of a colourful outdoor tropical landscape painting'
	},
	{
		title: 'Coastal Mural Project',
		image: coastalMural,
		alt: 'Mural group in front of a coastal sunset wall painting with palm trees'
	}
];

export const muralConcepts: GalleryItem[] = [
	{
		title: 'Lilies',
		image: lilies,
		alt: 'Digital illustration of pale lilies with dark green leaves'
	},
	{
		title: 'Koi Fish',
		image: koiFish,
		alt: 'Digital illustration of two orange and cream koi fish'
	},
	{
		title: 'Horse',
		image: horse,
		alt: 'Abstract digital illustration of a horse in warm neutral tones'
	},
	{ title: 'Macaw', image: parrot, alt: 'Digital illustration of a blue and yellow macaw' },
	{
		title: 'Ladybird',
		image: ladybird,
		alt: 'Digital illustration of a red ladybird on a textured background'
	},
	{
		title: 'Strawberries',
		image: strawberries,
		alt: 'Digital illustration of a bowl of strawberries and grapefruit'
	}
];

export const muralEnquiry: ChatMessage[] = [
	{ sender: 'client', text: 'Hi, I would love to have a custom mural for my coffee shop!!' },
	{
		sender: 'ellie',
		text: 'Fantastic thank you for messaging! How big is the wall and what would you like?'
	},
	{
		sender: 'client',
		text: "It's 3 meters wide and 2 meters tall and I would like a mural of a parrot!"
	},
	{
		sender: 'ellie',
		text: 'Sounds great. Would you like to send me some inspiration pictures or describe the style and vibe?'
	},
	{
		sender: 'client',
		text: 'I would like the painting to include the head of the parrot with a colourful collage style. Sort of like this!',
		media: {
			image: parrotReference,
			alt: 'Collage artwork of a red parrot used as a style reference'
		}
	},
	{
		sender: 'ellie',
		text: 'Awesome! Could you send me a picture of the wall so that I can draw a digital mock up?'
	},
	{
		sender: 'client',
		text: 'Yes of course',
		media: { image: blankWall, alt: 'Blank wall inside a coffee shop with tables and chairs' }
	},
	{ sender: 'ellie', text: 'Thank you I will start a concept for you and reply soon!' },
	{
		sender: 'ellie',
		text: 'Do you like this?',
		media: {
			image: smallParrot,
			alt: 'Small line drawing of a parrot placed on the coffee-shop wall'
		},
		mediaFirst: true
	},
	{ sender: 'client', text: 'I do! Could you make the parrot bigger?' },
	{ sender: 'ellie', text: 'I can!' },
	{
		sender: 'ellie',
		text: 'Is this better?',
		media: {
			image: largeParrot,
			alt: 'Larger line drawing of a parrot placed on the coffee-shop wall'
		},
		mediaFirst: true
	},
	{ sender: 'client', text: "Yes that's great :)" },
	{ sender: 'ellie', text: "I'm glad you like it! I'll start completing the drawing" },
	{
		sender: 'ellie',
		text: "Here is the finished drawing with full colour! Let me know if you'd like any changes",
		media: {
			image: finishedParrot,
			alt: 'Finished full-colour parrot mural concept placed on the coffee-shop wall'
		},
		mediaFirst: true
	},
	{ sender: 'client', text: 'That looks great! How much will this be?' },
	{
		sender: 'ellie',
		text: 'This mural will cost anywhere from £390 to £420, with a deposit of £135 :)'
	},
	{ sender: 'client', text: 'Okay, I will send the deposit now!' },
	{ sender: 'ellie', text: 'Thank you. What dates would you like to organise?' },
	{ sender: 'client', text: 'Are you available on the 13th at 11am?' },
	{
		sender: 'ellie',
		text: 'I am! This mural will take around 8 to 11 hours so I would predict we will need a maximum of 4 sessions'
	},
	{ sender: 'client', text: "That sounds good! I'll see you on the 13th" }
];
