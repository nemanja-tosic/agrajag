import { z, builder, openApiBuilder } from './builder.js';
import {
  DocumentStore,
  RavendbCrudEndpointFactory,
} from '@agrajag/ravendb-adapter';

const author = builder.createSchema(
  'authors',
  z.object({ name: z.string(), category: z.string() }),
  { relationships: { comments: () => [comment] } },
);

const comment = builder.createSchema(
  'comments',
  z.object({ body: z.string() }),
  { relationships: { author: () => author } },
);

const article = builder.createSchema(
  'articles',
  z.object({
    title: z.string(),
    body: z.string(),
    tags: z.array(z.string()),
  }),
  { relationships: { author: () => author, comments: () => [comment] } },
);

const documentStore = new DocumentStore('http://localhost:8080', 'test-crud');
documentStore.initialize();

builder.addResource(
  article,
  new RavendbCrudEndpointFactory(documentStore),
  openApiBuilder,
);

builder.addResource(
  author,
  new RavendbCrudEndpointFactory(documentStore),
  openApiBuilder,
);

builder.addResource(
  comment,
  new RavendbCrudEndpointFactory(documentStore),
  openApiBuilder,
);
