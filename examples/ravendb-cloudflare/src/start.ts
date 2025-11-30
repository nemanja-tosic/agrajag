import { ArticleSchema, AuthorSchema, CommentSchema, } from './schemas/NotificationGroupSchema.js';
import { CloudflareDocumentStore, RavendbCrudEndpointFactory, } from '@agrajag/ravendb-adapter';
import { ExportedHandler } from '@cloudflare/workers-types';
import { Hono } from 'hono';
import { DefinitionCollection, HonoBuilder } from 'agrajag';

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
  documentStore.initialize();

  const definitions = new DefinitionCollection()
    .addDefinition(AuthorSchema)
    .addDefinition(CommentSchema)
    .addDefinition(ArticleSchema);

  return new HonoBuilder().addDefinitions(definitions).build({
    authors: new RavendbCrudEndpointFactory(documentStore),
    comments: new RavendbCrudEndpointFactory(documentStore),
    articles: new RavendbCrudEndpointFactory(documentStore),
  });
}
