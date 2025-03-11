import { z, builder } from '../builder.js';

export const AuthorSchema = builder.createSchema(
  'authors',
  z.object({ name: z.string(), category: z.string() }),
);

export const CommentSchema = builder.createSchema(
  'comments',
  z.object({ body: z.string() }),
  { relationships: { AuthorSchema } },
);

export const ArticleSchema = builder.createSchema(
  'articles',
  z.object({
    title: z.string(),
    body: z.string(),
    tags: z.array(z.string()),
  }),
  { relationships: { AuthorSchema, comments: [CommentSchema] } },
);
