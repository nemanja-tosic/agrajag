import { NotificationGroupSchema } from './NotificationGroupSchema.js';
import { builder } from './builder.js';

export const NotificationSchema = builder.createSchema(
  'notifications',
  z => z.object({ message: z.object({ subject: z.string() }) }),
  { relationships: { group: NotificationGroupSchema } },
);

builder.addResource(NotificationSchema, {
  fetch: {
    self: async ({ id }) => ({
      id,
      message: {
        subject: 'Hello',
      },
      group: { id: '3', name: 'Group Name' },
    }),
    collection: async () => [
      {
        id: '1',
        message: { subject: 'Hello' },
        group: { id: '3', name: 'hello' },
      },
    ],
  },
  create: {
    self: async () => ({
      id: '1',
      message: { subject: 'Hello' },
      group: { id: '3', name: 'hello' },
    }),
  },
  delete: {
    self: async body => ({
      id: body.data.id,
      message: { subject: 'Hello' },
      group: { id: '3', name: 'hello' },
    }),
  },
});
