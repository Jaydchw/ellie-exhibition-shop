export const siteCopy = {
	name: 'Ellie Seal',
	tagline: 'Fine artist and mural painter',
	navigation: [
		{ label: 'Home', href: '/', icon: 'home' },
		{ label: 'Fine Art', href: '/art', icon: 'art' },
		{ label: 'Murals', href: '/murals', icon: 'murals' }
	],
	home: {
		eyebrow: 'Local artist',
		title: 'Ellie Seal',
		intro:
			'Ellie creates fine art and colourful murals inspired by movement, plants, animals and playful shapes.',
		choicesLabel: 'Explore Ellie’s Work',
		choices: {
			art: {
				eyebrow: 'Original work',
				title: 'Fine Art',
				description: 'View abstract movement studies and original works on paper.',
				href: '/art',
				linkLabel: 'View fine art'
			},
			murals: {
				eyebrow: 'Made for your space',
				title: 'Murals',
				description: 'See previous murals and find out how to commission one.',
				href: '/murals',
				linkLabel: 'View murals'
			}
		}
	},
	footer: {
		intro: 'Fine art and custom murals by Ellie Seal.',
		navigationLabel: 'Portfolio',
		contactLabel: 'Contact',
		copyright: `© ${new Date().getFullYear()} Ellie Seal`
	}
} as const;

export const socialLinks = {
	instagram: {
		label: 'Instagram',
		handle: '@sealstuff_',
		href: 'https://www.instagram.com/sealstuff_/'
	},
	facebook: {
		label: 'Facebook',
		handle: 'Ellie Seal Murals',
		href: 'https://www.facebook.com/profile.php?id=61592904743527'
	},
	email: {
		label: 'Email',
		handle: 'ellieseal21@gmail.com',
		href: 'mailto:ellieseal21@gmail.com'
	}
};

export const artPageCopy = {
	eyebrow: 'Fine art',
	title: 'Abstract Movement Originals',
	intro:
		'Original works by Ellie Seal exploring dance, balance and gesture through bold black linework.',
	galleryEyebrow: 'Available works',
	galleryTitle: 'The Collection',
	galleryDescription: 'Select a piece to view its story, dimensions, price and purchase details.'
};
