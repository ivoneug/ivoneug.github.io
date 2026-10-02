import { getCollection } from 'astro:content';

const byDateDesc = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
	b.data.date.valueOf() - a.data.date.valueOf();

export async function getBlogPosts() {
	const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
	return posts.sort(byDateDesc);
}

export async function getArchivePosts() {
	const posts = await getCollection('archive');
	return posts.sort(byDateDesc);
}
