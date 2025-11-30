import { createSchema, z } from 'agrajag';

export const user = createSchema('users', z.object({ fullName: z.string() }), {
  relationships: {
    comments: () => [comments],
  },
});

export const comments = createSchema(
  'comments',
  z.object({ text: z.string() }),
  { relationships: { user: () => user } },
);
