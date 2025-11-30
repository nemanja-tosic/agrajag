import { expectAssignable } from 'tsd';
import { createSchema, Denormalized, z, DefinitionCollection } from 'agrajag';
import { ReduxBuilder } from '@agrajag/redux-adapter';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const user = createSchema(
  'users',
  z.object({ name: z.string(), age: z.string() }),
  { relationships: { comments: () => [comment] } },
);

const comment = createSchema('comments', z.object({ text: z.string() }), {
  relationships: {},
});

const definitions = new DefinitionCollection()
  .addDefinition(user)
  .addDefinition(comment);

export const reduxApi = new ReduxBuilder().addDefinitions(definitions).build(
  createApi({
    baseQuery: fetchBaseQuery({ baseUrl: '' }),
    endpoints: builder => ({
      getPreExisting: builder.query({ query: () => '/pre-existing' }),
    }),
  }),
);

reduxApi.endpoints.getUsers;
const { data: users } = reduxApi.useGetUsersQuery({ include: '' });
expectAssignable<Denormalized<typeof user>[] | undefined>(users);

reduxApi.endpoints.getUsersById;
const { data: userById } = reduxApi.useGetUsersByIdQuery({
  id: '',
  include: '',
});
expectAssignable<Denormalized<typeof user> | undefined>(userById);

reduxApi.endpoints.postUsers;
const [trigger] = reduxApi.usePostUsersMutation();
trigger({
  body: {
    data: {
      id: '1234',
      type: 'users',
      attributes: { name: 'test', age: '12' },
    },
  },
});

reduxApi.endpoints.patchUsersById;
const [update] = reduxApi.usePatchUsersByIdMutation();
update({
  id: '1234',
  body: {
    data: {
      id: '1234',
      type: 'users',
      attributes: { name: 'test', age: '12' },
    },
  },
});

reduxApi.endpoints.deleteUsersById;
const [deleteUser] = reduxApi.useDeleteUsersByIdMutation();
deleteUser({ id: '12345' });
