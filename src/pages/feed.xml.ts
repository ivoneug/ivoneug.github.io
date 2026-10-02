import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../data/site';
import { getBlogPosts } from '../lib/posts';

// Served at /feed.xml, the same URL the old Jekyll site used.
export async function GET(context: APIContext) {
	const posts = await getBlogPosts();
	return rss({
		title: SITE.name,
		description: SITE.description,
		site: context.site!,
		trailingSlash: true,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.date,
			categories: post.data.tags,
			link: `/blog/${post.id}/`,
		})),
	});
}
