import { serve } from '@hono/node-server';
import DocumentStore from 'ravendb';
import { HonoBuilder } from 'agrajag';
import { RavendbCrudEndpointFactory } from '@agrajag/ravendb-adapter';
import { definitions } from '../shared/definitions.js';

const documentStore = new DocumentStore('http://localhost:8080', 'test-crud');
documentStore.initialize();

const hono = new HonoBuilder().addDefinitions(definitions).build({
  comments: new RavendbCrudEndpointFactory(documentStore),
  articles: new RavendbCrudEndpointFactory(documentStore),
  authors: new RavendbCrudEndpointFactory(documentStore),
});

serve({ fetch: hono.fetch, port: 8888 }, () => {
  console.log('Server is running on http://localhost:8888');
});
