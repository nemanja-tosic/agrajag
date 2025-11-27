import {
  z,
  Builder,
  createSchema,
  OpenApiEndpointBuilderDecorator,
} from 'agrajag';
import { StubServerBuilder } from './StubServerBuilder.js';
import { StubEndpointFactory } from './StubEndpointFactory.js';
import { DefinitionCollection } from '../../../src/index.js';

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

    new Builder(serverBuilder)
      .addDefinitions(
        new DefinitionCollection()
          .addDefinition(article)
          .addDefinition(author)
          .addDefinition(comment),
      )
      .addEndpointFactories({
        articles: new StubEndpointFactory(),
        authors: new StubEndpointFactory(),
        comments: new StubEndpointFactory(),
      });

    serverBuilder.build();

    // TODO: assert that we have the x-denormalize props
  });
});
