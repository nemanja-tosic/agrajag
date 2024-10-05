import { builder, honoBuilder } from './builder.js';
import {
  DocumentStore,
  RavendbCrudEndpointFactory,
} from '@agrajag/ravendb-adapter';

const author = builder.createSchema('authors', z =>
  z.object({ name: z.string(), category: z.string() }),
);

const comment = builder.createSchema(
  'comments',
  z => z.object({ body: z.string() }),
  { relationships: { author } },
);

const article = builder.createSchema(
  'articles',
  z =>
    z.object({
      title: z.string(),
      body: z.string(),
      tags: z.array(z.string()),
    }),
  { relationships: { author, comments: [comment] } },
);

const documentStore = new DocumentStore('http://localhost:8080', 'test-crud');
documentStore.initialize();

builder.addResource(
  article,
  new RavendbCrudEndpointFactory(documentStore),
  honoBuilder,
);

builder.addResource(
  author,
  new RavendbCrudEndpointFactory(documentStore),
  honoBuilder,
);

builder.addResource(
  comment,
  new RavendbCrudEndpointFactory(documentStore),
  honoBuilder,
);
