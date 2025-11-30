import { Before } from '@cucumber/cucumber';
import { DefinitionCollection, HonoBuilder } from 'agrajag';
import { World } from '../../common/fetching-steps.js';
import { RavendbCrudEndpointFactory } from '@agrajag/ravendb-adapter';

Before<World>(async function () {
  const hono = new HonoBuilder()
    .addDefinitions(
      new DefinitionCollection()
        .addDefinition(this.schemas.article)
        .addDefinition(this.schemas.author)
        .addDefinition(this.schemas.empty)
        .addDefinition(this.schemas.photo)
        .addDefinition(this.schemas.comment)
        .addDefinition(this.schemas.photographer),
    )
    .build({
      articles: new RavendbCrudEndpointFactory(this.documentStore),
      authors: new RavendbCrudEndpointFactory(this.documentStore),
      comments: new RavendbCrudEndpointFactory(this.documentStore),
      photographers: new RavendbCrudEndpointFactory(this.documentStore),
      empty: new RavendbCrudEndpointFactory(this.documentStore),
      photos: new RavendbCrudEndpointFactory(this.documentStore),
    });

  this.fetch = (path, request) => hono.request(path, request);
});
