import { z, Builder, OpenApiEndpointBuilderDecorator } from 'agrajag';
import { StubServerBuilder } from './StubServerBuilder.js';
import { StubEndpointFactory } from './StubEndpointFactory.js';

describe('denormalization', () => {
  it('should handle cyclical references', async () => {
    const builder = new Builder();

    const serverBuilder = new OpenApiEndpointBuilderDecorator(
      new StubServerBuilder(),
    );

    const article = builder.createSchema(
      'articles',
      z.object({ body: z.string() }),
      { relationships: { author: () => author } },
    );

    const author = builder.createSchema(
      'authors',
      z.object({ name: z.string(), category: z.string() }),
      {
        relationships: {
          comments: () => [comment],
          articles: () => [article],
        },
      },
    );

    const comment = builder.createSchema(
      'comments',
      z.object({ body: z.string() }),
      { relationships: { author: () => author } },
    );

    builder.addResource(author, new StubEndpointFactory(), serverBuilder);
    builder.addResource(article, new StubEndpointFactory(), serverBuilder);
    builder.addResource(comment, new StubEndpointFactory(), serverBuilder);

    await builder.build();

    serverBuilder.build();

    // TODO: assert that we have the x-denormalize props
  });
});
