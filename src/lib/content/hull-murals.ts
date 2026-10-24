import { muralPageCopy } from './murals';

export const hullMuralCopy = {
	...muralPageCopy,
	metaDescription:
		'Custom murals in Hull by Ellie Seal. Explore wall art for homes, businesses and community spaces, see previous work and request a free quote.',
	hero: {
		...muralPageCopy.hero,
		eyebrow: 'Hull',
		title: 'Murals in Hull',
		intro:
			'Hand-painted wall art for homes, businesses and community spaces. Made around your wall, your ideas and your colours.'
	},
	work: {
		...muralPageCopy.work,
		title: 'Previous mural work',
		intro: 'A look at Ellie’s murals and collaborative projects.'
	},
	process: {
		...muralPageCopy.process,
		title: 'From your wall to a mural',
		intro: 'See how a conversation becomes a design, then a finished wall.'
	},
	contact: {
		...muralPageCopy.contact,
		title: 'Tell Ellie about your Hull wall',
		intro:
			'Send a photo, rough measurements and your postcode for a free quote. Facebook Messenger is preferred; Instagram and email work too.'
	}
};

export const hullMuralBrief = [
	'Your Hull postcode and whether the wall is indoors or outdoors.',
	'A clear photo and the approximate width and height.',
	'Your colours, subject ideas and budget, if you have one.',
	'When the space can be accessed, especially during business opening hours.'
];

export const hullMuralQuestions = [
	{
		question: 'How much will my mural cost?',
		answer:
			'The quote depends on the wall size, design detail and preparation needed. Send a photo and measurements so Ellie can quote for your actual space.'
	},
	{
		question: 'What does the wall need before painting?',
		answer:
			'A smooth, already painted surface is the starting point. Tell Ellie about any texture, damage or damp before booking. A base coat can be added for an extra cost if the paint is purchased in advance.'
	},
	{
		question: 'Can I enquire for a business or shared space?',
		answer:
			'Yes. Include how the room is used, access arrangements and who approves the design. For an outdoor wall, mention that in your first message so Ellie can check its suitability.'
	}
];
