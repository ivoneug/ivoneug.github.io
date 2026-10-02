import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// English posts written for ivon.dev.
const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		updated: z.coerce.date().optional(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

// Posts migrated as-is from the old blog at bibobo.ru (mostly Russian).
const archive = defineCollection({
	loader: glob({ base: './src/content/archive', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		tags: z.array(z.string()).default([]),
		lang: z.enum(['ru', 'en']).default('ru'),
		kind: z.enum(['article', 'project']).default('article'),
		originalUrl: z.string(),
	}),
});

// Standalone documents such as the apps privacy policy.
const pages = defineCollection({
	loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
	}),
});

export const collections = { blog, archive, pages };
