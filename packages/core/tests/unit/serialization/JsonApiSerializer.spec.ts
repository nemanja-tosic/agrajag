import { createSchema, JsonApiSerializer, z } from 'agrajag';
import { expect } from 'chai';
import { Denormalized } from '../../../src/index.js';

const userSchema = createSchema(
  'user',
  z.object({ name: z.string(), age: z.number() }),
  { relationships: { articles: () => [articleSchema] } },
);

const articleSchema = createSchema(
  'article',
  z.object({ text: z.string(), date: z.string() }),
  { relationships: { author: () => userSchema } },
);

function createUser(): Denormalized<typeof userSchema> {
  const user: Denormalized<typeof userSchema> = {
    id: 'user1',
    name: 'Lorem Ipsum',
    age: 30,
    articles: [],
  };
  user.articles = [createArticle(user)];
  return user;
}

function createArticle(
  author: Denormalized<typeof userSchema>,
): Denormalized<typeof articleSchema> {
  return { id: 'article1', text: 'Lorem Ipsum', date: '2023-01-01', author };
}

describe('JsonApiSerializer', () => {
  let serializer = new JsonApiSerializer();

  it('should handle cyclical references', () => {
    // TODO: compare against value
    expect(() =>
      serializer.serialize(userSchema, createUser(), {}),
    ).to.not.throw();
  });

  it('should return attributes and relationships', () => {
    const serialized = serializer.serialize(userSchema, createUser(), {});

    expect(serialized).to.deep.equal({
      data: {
        id: 'user1',
        type: 'users',
        attributes: {
          name: 'Lorem Ipsum',
          age: 30,
        },
        relationships: { articles: { data: [] } },
      },
    });
  });

  it('should include relationships', () => {
    const userResource = createUser();

    const serialized = serializer.serialize(userSchema, userResource, {
      include: 'articles',
    });

    expect(serialized).to.deep.equal({
      data: {
        id: 'user1',
        type: 'users',
        attributes: {
          name: 'Lorem Ipsum',
          age: 30,
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
            date: '2023-01-01',
          },
          relationships: { author: { data: { id: 'user1', type: 'authors' } } },
        },
      ],
    });
  });

  it.only('should return sparse fieldsets', () => {
    const userResource = createUser();

    const serialized = serializer.serialize(userSchema, userResource, {
      include: 'articles',
      fields: {
        user: ['name', 'age'],
        'user.articles': ['text'],
      },
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
