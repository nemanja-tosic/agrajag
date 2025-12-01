import { z, JsonApiSerializer, createSchema } from 'agrajag';
import { expect } from 'chai';
import { Denormalized } from '../../../src/index.js';

const user = createSchema('user', z.object({ name: z.string() }), {
  relationships: { articles: () => [article] },
});

const article = createSchema('article', z.object({ text: z.string() }), {
  relationships: { author: () => user },
});

describe('JsonApiSerializer', () => {
  let serializer = new JsonApiSerializer();

  it('should handle cyclical references', () => {
    // TODO: compare against value
    expect(() =>
      serializer.serialize(
        user,
        { id: 'user1', name: 'Lorem Ipsum', articles: [] },
        {},
      ),
    ).to.not.throw();
  });

  it('should return attributes and relationships', () => {
    const serialized = serializer.serialize(
      user,
      { id: 'user1', name: 'Lorem Ipsum', articles: [] },
      {},
    );

    expect(serialized).to.deep.equal({
      data: {
        id: 'user1',
        type: 'users',
        attributes: {
          name: 'Lorem Ipsum',
        },
        relationships: { articles: { data: [] } },
      },
    });
  });

  it('should include relationships', () => {
    const userResource = {
      id: 'user1',
      name: 'Lorem Ipsum',
      articles: [] as any,
    } satisfies Denormalized<typeof user>;

    const articleResource = {
      id: 'article1',
      text: 'Lorem Ipsum',
      author: userResource,
    } satisfies Denormalized<typeof article>;

    userResource.articles.push(articleResource);

    const serialized = serializer.serialize(user, userResource, {
      include: 'articles',
    });

    expect(serialized).to.deep.equal({
      data: {
        id: 'user1',
        type: 'users',
        attributes: {
          name: 'Lorem Ipsum',
        },
        relationships: {
          articles: { data: [{ id: 'article1', type: 'articles' }] },
        },
      },
      included: [
        {
          id: 'article1',
          type: 'articles',
          attributes: {
            text: 'Lorem Ipsum',
          },
          relationships: { author: { data: { id: 'user1', type: 'authors' } } },
        },
      ],
    });
  });
});
