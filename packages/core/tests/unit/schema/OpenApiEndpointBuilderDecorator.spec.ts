import { expect } from 'chai';
import {
  z,
  Builder,
  createSchema,
  OpenApiEndpointBuilderDecorator,
  ZodSchemaFactory,
} from 'agrajag';
import { StubServerBuilder } from './StubServerBuilder.js';
import { StubEndpointFactory } from './StubEndpointFactory.js';
import { DefinitionCollection } from '../../../src/index.js';

describe('OpenAPI doc generation (zod-openapi 6)', () => {
  it('builds a fetchable resource doc without crashing on JSON:API query params', () => {
    // Regression: zod-openapi 6 derives a param's name from the object key and its
    // location from requestParams.path/query. The old `.openapi({ param:{name,in} })`
    // shape (mechanically ported to `.meta`) conflicted with that inference and made
    // createDocument throw ("has both … information") for any fetch-capable resource.
    const tournament = createSchema('tournaments', z.object({ name: z.string() }));
    const factory = new ZodSchemaFactory();
    const decorator = new OpenApiEndpointBuilderDecorator(new StubServerBuilder());
    decorator.addGet(
      tournament,
      () => factory.createEndpointSchema(tournament),
      '/tournaments/:id',
      (() => undefined) as never,
    );

    const doc = decorator.build();
    const params = doc.paths['/tournaments/{id}'].get.parameters as Array<{
      name: string;
      in: string;
    }>;
    expect(params.some(p => p.name === 'include' && p.in === 'query')).to.equal(true);
    expect(params.some(p => p.name === 'id' && p.in === 'path')).to.equal(true);
  });
});

describe('denormalization', () => {
  it('should handle cyclical references', async () => {
    const article = createSchema('articles', z.object({ body: z.string() }), {
      relationships: { author: () => author },
    });

    const author = createSchema(
      'authors',
      z.object({ name: z.string(), category: z.string() }),
      {
        relationships: {
          comments: () => [comment],
          articles: () => [article],
        },
      },
    );

    const comment = createSchema('comments', z.object({ body: z.string() }), {
      relationships: { author: () => author },
    });

    const serverBuilder = new OpenApiEndpointBuilderDecorator(
      new StubServerBuilder(),
    );

    // new BackendBuilder(serverBuilder)
    //   .addDefinitions(
    //     new DefinitionCollection()
    //       .addDefinition(article)
    //       .addDefinition(author)
    //       .addDefinition(comment),
    //   )
    //   .build({
    //     articles: new StubEndpointFactory(),
    //     authors: new StubEndpointFactory(),
    //     comments: new StubEndpointFactory(),
    //   });

    serverBuilder.build();

    // TODO: assert that we have the x-denormalize props
  });
});
