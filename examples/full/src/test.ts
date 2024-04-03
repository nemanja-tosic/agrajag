import { honoBuilder, openApiBuilder } from './builder.js';
import { swaggerUI } from '@hono/swagger-ui';
import { serve } from '@hono/node-server';

import './NotificationSchema.js';
import './NotificationGroupSchema.js';

const hono = honoBuilder.build();
const openapi = openApiBuilder.build();

hono.get('/ui', swaggerUI({ url: '/' }));

hono.get('/openapi.json', c => c.json(openapi));

serve({ fetch: hono.fetch, port: 8888 }, () => {
  console.log('Server is running on http://localhost:8888');
});
