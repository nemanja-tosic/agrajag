import { z, createSchema } from '../builder.js';

export const AuthorSchema = createSchema(
  'authors',
  z.object({ name: z.string(), category: z.string() }),
);

export const CommentSchema = createSchema(
  'comments',
  z.object({ body: z.string() }),
  { relationships: { AuthorSchema } },
);

export const ArticleSchema = createSchema(
  'articles',
  z.object({
    title: z.string(),
    body: z.string(),
    tags: z.array(z.string()),
  }),
  { relationships: { AuthorSchema, comments: [CommentSchema] } },
);
