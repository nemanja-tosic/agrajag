import { expectAssignable } from 'tsd';
import { Denormalized, Normalized, z, Builder, Stored } from 'agrajag';

const builder = new Builder();

const user = builder.createSchema(
  'users',
  z.object({ name: z.string(), age: z.string() }),
  { relationships: { posts: () => [post] } },
);

type DenormalizedUser = Denormalized<typeof user>;
type NormalizedUser = Normalized<typeof user>;

const post = builder.createSchema('posts', z.object({ text: z.string() }), {
  relationships: { author: () => user, comments: () => [comment] },
});

const comment = builder.createSchema('posts', z.object({ text: z.string() }));

type DenormalizedPost = Denormalized<typeof post>;
type NormalizedPost = Normalized<typeof post>;

declare const denormalizedUser: DenormalizedUser;
expectAssignable<{
  id: string;
  name: string;
  age: string;
  posts: DenormalizedPost[];
}>(denormalizedUser);

declare const normalizedUser: NormalizedUser;
expectAssignable<{
  id: string;
  name: string;
  age: string;
  posts: string[];
}>(normalizedUser);

declare const denormalizedPost: DenormalizedPost;
expectAssignable<{
  id: string;
  text: string;
  author: DenormalizedUser;
}>(denormalizedPost);

declare const normalizedPost: NormalizedPost;
expectAssignable<{
  id: string;
  text: string;
  author: string;
}>(normalizedPost);

declare const storedUser: Stored<typeof user>;
expectAssignable<Stored<typeof post>>({
  id: '1',
  text: '42',
  comments: [],
  author: storedUser,
});
