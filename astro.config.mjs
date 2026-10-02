// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://ivon.dev',
	trailingSlash: 'always',
	integrations: [sitemap()],
	// Keep URLs from the old Jekyll site working.
	redirects: {
		'/combine/swift/2021/09/19/combine-framework-overview': '/blog/combine-framework-overview/',
		'/swiftui/sharing/2021/09/25/sharing-dialog-magic-in-swiftui': '/blog/sharing-dialog-magic-in-swiftui/',
		'/contacts': '/#contact',
		'/contact': '/#contact',
		'/portfolio': '/#work',
	},
	markdown: {
		// Code blocks are always dark, like the editor card on the landing page.
		shikiConfig: { theme: 'github-dark' },
	},
});
