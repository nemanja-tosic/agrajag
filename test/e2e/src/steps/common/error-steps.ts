import { Before } from '@cucumber/cucumber';
import { z } from 'agrajag';
// import { World } from './fetching-steps.js';

Before<any>(function () {
  // an endpoint that fails processing
  this.builder.addResource(
    this.builder.createSchema('errors', z.object({})),
    {
      createEndpoints: () => ({
        fetch: {
          collection: async () => {
            throw new Error('test error');
          },
        },
        create: {
          self: async () => {
            throw new Error('test error');
          },
        },
      }),
    },
    this.serverBuilder,
  );
});
