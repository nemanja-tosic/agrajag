import { expect } from 'chai';
import { createSchema, JsonApiSerializer, z } from 'agrajag';
import { BaseEndpointFactory } from '../../../src/endpoints/BaseEndpointFactory.js';
import type { Resolver } from '../../../src/application/Resolver.js';
import type { ResourceDefinition } from '../../../src/resources/ResourceDefinition.js';
import type { Stored } from '../../../src/index.js';

const authorSchema = createSchema('authors', z.object({ name: z.string() }));

const bookSchema = createSchema('books', z.object({ title: z.string() }), {
  relationships: { author: () => authorSchema },
});

// Mappers expose relationships as lazy getters (loading guards live inside).
// Serialization must not invoke a getter for a relationship the request did
// not include — pre-fix, #denormalize spread the entity and probed every
// relationship key, firing the getters and blowing up on unloaded relations.
function createBook(): Stored<typeof bookSchema> {
  return {
    id: 'book1',
    title: 'Lorem Ipsum',
    get author(): never {
      throw new Error('author not loaded');
    },
  } as unknown as Stored<typeof bookSchema>;
}

class StubEndpointFactory extends BaseEndpointFactory<typeof bookSchema> {
  protected createExternal(): Resolver<typeof bookSchema> {
    return {
      byId: async () => createBook(),
      byIds: async () => [],
      byType: async () => ({
        data: [createBook()],
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
        total: 1,
      }),
      post: async (entity: unknown) => entity,
      patch: async (entity: unknown) => entity,
      delete: async () => undefined,
      [Symbol.asyncDispose]: async () => undefined,
    } as unknown as Resolver<typeof bookSchema>;
  }
}

describe('endpoint serialization with lazy relationship getters', () => {
  const endpoints = new StubEndpointFactory().createEndpoints(
    bookSchema as ResourceDefinition as typeof bookSchema,
    new JsonApiSerializer(),
  );

  it('fetch.self does not invoke an unrequested relationship getter', async () => {
    const document = await endpoints.fetch!.self!({ id: 'book1' } as never);
    expect(document?.data).to.deep.include({ id: 'book1', type: 'books' });
  });

  it('fetch.collection does not invoke unrequested relationship getters', async () => {
    const document = await endpoints.fetch!.collection!({} as never);
    expect(document?.data).to.have.length(1);
  });
});
