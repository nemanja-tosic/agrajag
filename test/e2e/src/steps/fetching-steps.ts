import { After, Before, Given, Then, When } from '@cucumber/cucumber';
import { Builder, HonoBuilder } from 'agrajag';
import { deepStrictEqual, strictEqual } from 'node:assert';
import { DocumentStore, DeleteByQueryOperation } from 'ravendb';
import { Resource, ResourceDefinition } from 'agrajag';
import { RavendbCrudEndpointFactory } from '@agrajag/ravendb-adapter';
import { ZodArray, ZodObject, ZodString } from 'zod';

type AuthorDefinition = ResourceDefinition<
  ZodObject<{ name: ZodString; category: ZodString }>
>;

type PhotographerDefinition = ResourceDefinition<
  ZodObject<{ name?: ZodString; category: ZodString }>
>;

type CommentDefinition = ResourceDefinition<
  ZodObject<{ body: ZodString }>,
  { author: AuthorDefinition}
>;

type PhotoDefinition = ResourceDefinition<
  ZodObject<{ name: ZodString }>,
  { photographer: PhotographerDefinition }
>;

type ArticleDefinition = ResourceDefinition<
  ZodObject<{ title: ZodString; body: ZodString; tags: ZodArray<ZodString> }>,
  { author: AuthorDefinition; comments: [CommentDefinition]}
>;

interface World {
  documentStore: DocumentStore;
  response: Response;
  honoBuilder: HonoBuilder;
  builder: Builder;
  schemas: {
    article: ArticleDefinition;
    author: AuthorDefinition;
    comment: CommentDefinition;
    empty: AuthorDefinition;
    photo: PhotoDefinition;
    photographer: PhotographerDefinition;
  };
}

Before<World>(async function () {
  this.honoBuilder = new HonoBuilder();
  this.builder = new Builder({ endpointBuilder: this.honoBuilder });

  const author = this.builder.createSchema('authors', z =>
    z.object({ name: z.string(), category: z.string() }),
  );

  const photographer = this.builder.createSchema('photographers', z =>
    z.object({ name: z.string(), category: z.string() }),
  );

  const photo = this.builder.createSchema('photos', z =>
    z.object({ name: z.string() }),
    {relationships: {photographer}},
  );

  const comment = this.builder.createSchema(
    'comments',
    z => z.object({ body: z.string() }),
    { relationships: { author } },
  );

  const article = this.builder.createSchema(
    'articles',
    z =>
      z.object({
        title: z.string(),
        body: z.string(),
        tags: z.array(z.string()),
      }),
    { relationships: { author, comments: [comment] } },
  );

  const empty = this.builder.createSchema(
    'empty',
    z => z.object({ name: z.string(), category: z.string() }),
  );

  this.schemas = { author , article, comment, empty, photo, photographer};
});

Before<World>(async function () {
  const { author,empty,  article, comment, photo, photographer } = this.schemas;

  this.documentStore = new DocumentStore('http://localhost:8080', 'test-crud');
  this.documentStore.initialize();

  // purge database
  await this.documentStore.operations
    .send(new DeleteByQueryOperation('from @all_docs'))
    .then(op => op.waitForCompletion());

  this.builder.addResource(
    article,
    new RavendbCrudEndpointFactory(this.documentStore),
  );

  this.builder.addResource(
    author,
    new RavendbCrudEndpointFactory(this.documentStore),
  );

  this.builder.addResource(
    photographer,
    new RavendbCrudEndpointFactory(this.documentStore),
  );

  this.builder.addResource(
    comment,
    new RavendbCrudEndpointFactory(this.documentStore),
  );

  this.builder.addResource(
    empty,
    new RavendbCrudEndpointFactory(this.documentStore),
  );

  this.builder.addResource(
    photo,
    new RavendbCrudEndpointFactory(this.documentStore),
  );
});

After(async function () {
  this.documentStore.dispose();
});

When<World>(
  'I send a "GET" request to {string}',
  async function (path: string) {
    const hono = this.honoBuilder.build();

    this.response = await hono.request(path, { method: 'GET' });
  },
);

When<World>(
  'I send a "POST" request to {string} with the resource',
  async function (path: string, body: string) {
    const hono = this.honoBuilder.build();

    this.response = await hono.request(path, {
      body,
      method: 'POST',
      headers: { 'Content-Type': 'application/vnd.api+json' },
    });
  },
);

When<World>(
  'I send a "PATCH" request to {string} with the resource',
  async function (path: string, body: string) {
    const hono = this.honoBuilder.build();

    this.response = await hono.request(path, {
      body,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/vnd.api+json' },
    });
  },
);


When<World>(
  'I send a "DELETE" request to {string}',
  async function (path: string) {
    const hono = this.honoBuilder.build();

    this.response = await hono.request(path, { method: 'DELETE' });
  },
);


Then<World>(
  'the response status should be {int}',
  async function (statusCode: number) {
    strictEqual(this.response.status, statusCode);
  },
);

Then<World>(
  'the response body should be:',
  async function (responseBody: string) {
    const response = (await this.response.json()) as Resource;

    deepStrictEqual(response, JSON.parse(responseBody));
  },
);

Given<World>(
  'i have sent a "POST" request to {string} with the following body:',
  async function (path: string, body: string) {
    const hono = this.honoBuilder.build();

    this.response = await hono.request(path, {
      body,
      method: 'POST',
      headers: { 'Content-Type': 'application/vnd.api+json' },
    });
  },
);

Given<World>('the test data', async function () {
  const hono = this.honoBuilder.build();

  const authors = [
    {
      id: 'authors-1',
      type: 'authors',
      attributes: { name: 'Nemanja', category: 'IT' },
      relationships: {},
    },
    {
      id: 'authors-2',
      type: 'authors',
      attributes: { name: 'Dunja', category: 'Crochet' },
      relationships: {},
    },
  ] satisfies Resource<AuthorDefinition>[];

  const empty = [] satisfies Resource<AuthorDefinition>[];

  const photos = [
    {
      id: 'photos-1',
      type: 'photos',
      attributes: { name: 'Foo'},
      relationships:{
        photographer: {data: null},
      },
    },
  ] satisfies Resource<PhotoDefinition>[];

  const comments = [
    {
      id: 'comments-1',
      type: 'comments',
      attributes: { body: 'Foo' },
      relationships: { author: { data: authors[0] } },
    },
    {
      id: 'comments-2',
      type: 'comments',
      attributes: { body: 'Bar' },
      relationships: { author: { data: authors[0] } },
    },
    {
      id: 'comments-3',
      type: 'comments',
      attributes: { body: 'Baz' },
      relationships: { author: { data: authors[1] } },
    },
  ] satisfies Resource<CommentDefinition>[];

  const articles: Resource<ArticleDefinition>[] = [
    {
      id: 'articles-1',
      type: 'articles',
      attributes: { title: 'Foo', body: 'Bar', tags: ['Baz'] },
      relationships: {
        author: { data: authors[0] },
        comments: { data: [comments[0], comments[1]] },
      },
    },
    {
      id: 'articles-2',
      type: 'articles',
      attributes: { title: 'Foo', body: 'Bar', tags: ['Baz'] },
      relationships: {
        author: { data: authors[0] },
        comments: { data: [comments[2]] },
      },
    },
    {
      id: 'articles-3',
      type: 'articles',
      attributes: { title: 'Foo1', body: 'Bar', tags: ['Baz'] },
      relationships: {
        author: { data: null},
        comments: { data: [] },
      },
    },
  ] satisfies Resource<ArticleDefinition>[];

  for (const resource of [...authors, ...articles, ...comments, ...empty, ...photos,]) {
    await hono.request(`/${resource.type}`, {
      body: JSON.stringify({ data: resource }),
      method: 'POST',
      headers: { 'Content-Type': 'application/vnd.api+json' },
    });
  }
});
