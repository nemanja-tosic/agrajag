import { builder, honoBuilder, openApiBuilder } from './builder.js';
import { swaggerUI } from '@hono/swagger-ui';
import { serve } from '@hono/node-server';

import './schema.js';

await builder.build();
const hono = honoBuilder.build();
const openapi = openApiBuilder.build();

hono.get('/ui', swaggerUI({ url: '/', spec: openapi }));

hono.get('/openapi.json', c => c.json(openapi));

serve({ fetch: hono.fetch, port: 8888 }, () => {
  console.log('Server is running on http://localhost:8888');
});
