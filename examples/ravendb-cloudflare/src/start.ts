import { builder, honoBuilder } from './builder.js';
import {
  ArticleSchema,
  AuthorSchema,
  CommentSchema,
} from './schemas/NotificationGroupSchema.js';
import {
  CloudflareDocumentStore,
  RavendbCrudEndpointFactory,
} from '@agrajag/ravendb-adapter';
import { ExportedHandler } from '@cloudflare/workers-types';
import { Hono } from 'hono';

export interface Env {
  DB_URLS: string;
  DB_NAME: string;
}

let hono: Hono;

export default {
  async fetch(request, env, ctx) {
    if (!hono) {
      hono = createHono(env);
    }

    return (await hono.fetch(request as any, env, ctx)) as any;
  },
} satisfies ExportedHandler<Env>;

function createHono(env: Env): Hono {
  const documentStore = new CloudflareDocumentStore(
    JSON.parse(env.DB_URLS),
    env.DB_NAME,
  );

  builder.addResource(
    AuthorSchema,
    new RavendbCrudEndpointFactory(documentStore),
  );

  builder.addResource(
    CommentSchema,
    new RavendbCrudEndpointFactory(documentStore),
  );

  builder.addResource(
    ArticleSchema,
    new RavendbCrudEndpointFactory(documentStore),
  );

  documentStore.initialize();

  return honoBuilder.build();
}
