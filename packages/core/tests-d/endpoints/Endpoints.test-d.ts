import { expectAssignable } from 'tsd';
import { Denormalized, z, createSchema, Stored } from 'agrajag';

const user = createSchema(
  'users',
  z.object({ name: z.string(), age: z.string() }),
  { relationships: { posts: () => [post] } },
);

type DenormalizedUser = Denormalized<typeof user>;
type StoredUser = Stored<typeof user>;

const post = createSchema('posts', z.object({ text: z.string() }), {
  relationships: { author: () => user, comments: () => [comment] },
});

const comment = createSchema('posts', z.object({ text: z.string() }));

type DenormalizedPost = Denormalized<typeof post>;
type StoredPost = Stored<typeof post>;

declare const denormalizedUser: DenormalizedUser;
expectAssignable<{
  id: string;
  name: string;
  age: string;
  posts?: DenormalizedPost[];
}>(denormalizedUser);

// expectAssignable<StoredUser>(denormalizedUser);

declare const denormalizedPost: DenormalizedPost;
expectAssignable<{
  id: string;
  text: string;
  author?: DenormalizedUser;
}>(denormalizedPost);

declare const storedUser: Stored<typeof user>;
expectAssignable<Stored<typeof post>>({
  id: '1',
  text: '42',
  comments: [],
  author: storedUser,
});

// expectAssignable<StoredPost>(denormalizedPost);
