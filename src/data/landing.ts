// Landing page copy. Values in [BRACKETS] are placeholders waiting for real content.

import clashTheCubeIcon from '../assets/projects/clash-the-cube-icon.png';
import cluttercutResults from '../assets/projects/cluttercut-01-results.jpg';
import cluttercutDuplicates from '../assets/projects/cluttercut-03-duplicates.jpg';
import cluttercutIcon from '../assets/projects/cluttercut-icon.png';
import langolandIcon from '../assets/projects/langoland-icon.png';
import luckyDiceIcon from '../assets/projects/lucky-dice-icon.png';
import quickFlashcardsIcon from '../assets/projects/quick-flashcards-icon.png';
import shortStoriesIcon from '../assets/projects/short-stories-icon.png';
import triviaQuizIcon from '../assets/projects/trivia-quiz-icon.png';
import wordMatchIcon from '../assets/projects/word-match-icon.png';

export const HERO = {
	comment: "// Hi, I'm Evgeniy Ivon",
	// Words wrapped in *asterisks* are highlighted with the accent colour.
	title: 'One developer for *iPhone*, *Android* and *backend*.',
	lead: 'Native iOS and Android apps on a Firebase backend, designed and built by me. You talk to the person who writes the code — from the first prototype to the store release.',
	workMode: 'remote · worldwide',
};

export const SERVICES = [
	{
		title: 'iOS apps',
		text: 'Native Swift and SwiftUI apps that feel at home on iPhone and iPad.',
		stack: ['Swift', 'SwiftUI', 'UIKit'],
	},
	{
		title: 'Android apps',
		text: 'Native Android clients that share the product logic and look of your iOS app.',
		stack: ['Kotlin', 'Jetpack Compose'],
	},
	{
		title: 'Firebase backend',
		text: 'Firestore data model, security rules, Cloud Functions, auth and push notifications.',
		stack: ['Firestore', 'Cloud Functions', 'Auth', 'FCM'],
	},
	{
		title: 'Idea to release',
		text: 'Prototype, store submission, analytics and support after launch.',
		stack: ['App Store', 'Google Play', 'Analytics'],
	},
];

export const FEATURED = {
	meta: 'featured · photo & video · iOS · 2026',
	title: 'ClutterCut AI',
	icon: cluttercutIcon,
	text: 'An AI photo cleaner for iPhone. One scan finds duplicates, near-identical shots, blurry photos and forgotten videos, sorts them into categories and shows how many gigabytes you get back. All analysis runs on the device — photos never leave the phone.',
	link: { label: 'view on the App Store', href: 'https://apps.apple.com/us/app/cluttercut-ai-photo-cleaner/id6748902282' },
	screenshots: [
		{ src: cluttercutResults, alt: 'ClutterCut scan results: a chart of reclaimable space by category' },
		{ src: cluttercutDuplicates, alt: 'ClutterCut duplicate photos grouped with the best shot kept' },
	],
};

const appStore = (id: string) => ({ platform: 'iOS', href: `https://apps.apple.com/us/app/${id}` });
const googlePlay = (pkg: string) => ({ platform: 'Android', href: `https://play.google.com/store/apps/details?id=${pkg}` });

// Shown newest year first (see index.astro); same-year apps keep this order.
// `stores` lists only the stores where the app is live right now; `site` links the title.
export const PROJECTS = [
	{
		year: '2022',
		title: 'Lucky Dice 2',
		icon: luckyDiceIcon,
		about: 'Relaxing dice game for a quick break',
		stores: [appStore('lucky-dice-2/id1606243051'), googlePlay('games.greenflag.luckydice')],
	},
	{
		year: '2021',
		title: 'Quick Flashcards',
		icon: quickFlashcardsIcon,
		about: 'Vocabulary trainer built around spaced repetition',
		stores: [appStore('quick-flashcards/id1575765696')],
	},
	{
		year: '2021',
		title: 'Word Match Searching',
		icon: wordMatchIcon,
		about: 'Word search game written in SwiftUI',
		stores: [appStore('word-match-searching/id1571894190')],
	},
	{
		year: '2021',
		title: 'Clash the Cube',
		icon: clashTheCubeIcon,
		about: 'Endless merge-the-cubes puzzle',
		stores: [appStore('clash-the-cube/id1553756560')],
	},
	{
		year: '2019',
		title: 'LangoLand',
		icon: langolandIcon,
		about: 'English words with pictures and audio, for Russian speakers',
		site: 'https://langoland.ru/',
		stores: [appStore('langoland/id1453318711')],
	},
	{
		year: '2018',
		title: 'Trivia Quiz',
		icon: triviaQuizIcon,
		about: '5,000+ questions in 24 fields of study',
		stores: [googlePlay('ru.bibobo.trivia_quiz_app')],
	},
	{
		year: '2018',
		title: '160 Great Short Stories',
		icon: shortStoriesIcon,
		about: 'Reader for classic short stories in English',
		stores: [googlePlay('ru.bibobo.great_short_stories')],
	},
];

export const PROCESS = [
	{ step: 'discover', text: 'A call about the idea, users and constraints. You get a scope and an estimate.' },
	{ step: 'prototype', text: 'Key screens and the Firestore data model, agreed before the build starts.' },
	{ step: 'build', text: 'Weekly builds on TestFlight and Firebase App Distribution, with a changelog.' },
	{ step: 'ship', text: 'Store release, analytics and crash reports, then support and new features.' },
];

export const CONTACT = {
	title: 'Have an app in mind?',
	text: 'Tell me what you are building. I usually reply within a day.',
};
