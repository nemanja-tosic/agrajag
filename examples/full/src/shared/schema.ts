import { createSchema, z } from 'agrajag';

export const author = createSchema(
  'authors',
  z.object({ name: z.string(), category: z.string() }),
  { relationships: { comments: () => [comment] } },
);

export const comment = createSchema('comments', z.object({ body: z.string() }), {
  relationships: { author: () => author },
});

export const article = createSchema(
  'articles',
  z.object({
    title: z.string(),
    body: z.string(),
    tags: z.array(z.string()),
  }),
  { relationships: { author: () => author, comments: () => [comment] } },
);
