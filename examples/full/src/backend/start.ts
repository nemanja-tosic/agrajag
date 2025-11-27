import { swaggerUI } from '@hono/swagger-ui';
import { serve } from '@hono/node-server';
import DocumentStore from 'ravendb';
import { Builder, HonoBuilder, OpenApiEndpointBuilderDecorator } from 'agrajag';
import { RavendbCrudEndpointFactory } from '@agrajag/ravendb-adapter';
import { definitions } from '../shared/definitions.js';

const documentStore = new DocumentStore('http://localhost:8080', 'test-crud');
documentStore.initialize();

const honoBuilder = new HonoBuilder();
// const openApiBuilder = new OpenApiEndpointBuilderDecorator(honoBuilder);

new Builder(honoBuilder).addDefinitions(definitions).build({
  comments: new RavendbCrudEndpointFactory(documentStore),
  articles: new RavendbCrudEndpointFactory(documentStore),
  authors: new RavendbCrudEndpointFactory(documentStore),
});

const hono = honoBuilder.build();

// TODO: move to Hono
// const openapi = openApiBuilder.build();
// hono.get('/ui', swaggerUI({ url: '/', spec: openapi }));
// hono.get('/openapi.json', c => c.json(openapi));

serve({ fetch: hono.fetch, port: 8888 }, () => {
  console.log('Server is running on http://localhost:8888');
});
