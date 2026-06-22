import { defineCollections, defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { transformerTwoslash } from 'fumadocs-twoslash';
import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { z } from 'zod';

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      rightSidebar: z.boolean().optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const snippets = defineCollections({
  type: 'doc',
  dir: 'content/snippets',
  postprocess: {
    includeProcessedMarkdown: true,
  },
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    author: z.string(),
    tags: z.array(z.string()),
  }),
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      transformers: [...(rehypeCodeDefaultOptions.transformers ?? []), transformerTwoslash()],
      // important: Shiki doesn't support lazy loading languages for codeblocks in Twoslash popups
      // make sure to define them first (e.g. the common ones)
      langs: ['js', 'jsx', 'ts', 'tsx'],
    },
  },
});
