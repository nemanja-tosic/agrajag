import { expectAssignable } from 'tsd';
import { Denormalized, Normalized, z, createSchema, Stored } from 'agrajag';

const user = createSchema(
  'users',
  z.object({ name: z.string(), age: z.string() }),
  { relationships: { posts: () => [post] } },
);

type DenormalizedUser = Denormalized<typeof user>;
type NormalizedUser = Normalized<typeof user>;

const post = createSchema('posts', z.object({ text: z.string() }), {
  relationships: { author: () => user, comments: () => [comment] },
});

const comment = createSchema('posts', z.object({ text: z.string() }));

type DenormalizedPost = Denormalized<typeof post>;
type NormalizedPost = Normalized<typeof post>;

declare const denormalizedUser: DenormalizedUser;
expectAssignable<{
  id: string;
  name: string;
  age: string;
  posts?: DenormalizedPost[];
}>(denormalizedUser);

declare const normalizedUser: NormalizedUser;
expectAssignable<{
  id: string;
  name: string;
  age: string;
  posts: { id: string }[];
}>(normalizedUser);

declare const denormalizedPost: DenormalizedPost;
expectAssignable<{
  id: string;
  text: string;
  author?: DenormalizedUser;
}>(denormalizedPost);

declare const normalizedPost: NormalizedPost;
expectAssignable<{
  id: string;
  text: string;
  author: { id: string };
}>(normalizedPost);

declare const storedUser: Stored<typeof user>;
expectAssignable<Stored<typeof post>>({
  id: '1',
  text: '42',
  comments: [],
  author: storedUser,
});
