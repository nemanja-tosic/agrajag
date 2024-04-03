import { builder } from './builder.js';

export const NotificationGroupSchema = builder.createSchema(
  'notification-groups',
  z => z.object({ name: z.string() }),
);

builder.addResource(NotificationGroupSchema, {
  fetch: {
    self: async ({ id }) => ({ id, name: 'Hello' }),
    collection: async () => [{ id: '1', name: 'Hello' }],
  },
});

builder.addResource(
  builder.createSchema('schema-twos', z => z.object({ name: z.string() }), {
    relationships: { group: NotificationGroupSchema },
  }),
  {
    fetch: {
      self: async ({ id }) => ({
        id,
        name: 'Hello',
        group: { id: '3', name: 'hello' },
      }),
      collection: async () => [
        {
          id: '1',
          name: 'Hello',
          group: { id: '3', name: 'hello' },
        },
      ],
    },
  },
);

const Schema1 = builder.createSchema('schema-ones', z =>
  z.object({ name: z.string() }),
);

builder.addResource(Schema1, {
  fetch: {
    self: async ({ id }) => ({
      id,
      name: 'Hello',
      relationships: {},
    }),
    collection: async () => [{ id: '1', name: 'Hello world' }],
  },
});
