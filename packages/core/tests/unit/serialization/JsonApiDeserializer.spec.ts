import { createSchema, JsonApiDeserializer, z } from 'agrajag';
import { expect } from 'chai';

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

describe('JsonApiDeserializer', () => {
  let deserializer = new JsonApiDeserializer();

  it('should deserialize a simple resource', async () => {
    const jsonApiData = {
      data: {
        id: 'user1',
        type: 'users',
        attributes: {
          name: 'John Doe',
          age: 30,
        },
      },
    };

    const result = await deserializer.deserialize(
      userSchema,
      jsonApiData as any,
      {},
    );

    expect(result).to.deep.equal({
      id: 'user1',
      name: 'John Doe',
      age: 30,
    });
  });

  it('should deserialize an array of resources', async () => {
    const jsonApiData = {
      data: [
        {
          id: 'user1',
          type: 'users',
          attributes: {
            name: 'John Doe',
            age: 30,
          },
        },
        {
          id: 'user2',
          type: 'users',
          attributes: {
            name: 'Jane Smith',
            age: 25,
          },
        },
      ],
    };

    const result = await deserializer.deserialize(
      userSchema,
      jsonApiData as any,
      {},
    );

    expect(result).to.deep.equal([
      {
        id: 'user1',
        name: 'John Doe',
        age: 30,
      },
      {
        id: 'user2',
        name: 'Jane Smith',
        age: 25,
      },
    ]);
  });

  it('should deserialize relationships from included', async () => {
    const jsonApiData = {
      data: {
        id: 'user1',
        type: 'users',
        attributes: {
          name: 'John Doe',
          age: 30,
        },
        relationships: {
          articles: {
            data: [{ id: 'article1', type: 'articles' }],
          },
        },
      },
      included: [
        {
          id: 'article1',
          type: 'articles',
          attributes: {
            text: 'Hello World',
            date: '2023-01-01',
          },
        },
      ],
    };

    const result = await deserializer.deserialize(
      userSchema,
      jsonApiData as any,
      { include: ['articles'] },
    );

    expect(result).to.deep.equal({
      id: 'user1',
      name: 'John Doe',
      age: 30,
      articles: [
        {
          id: 'article1',
          text: 'Hello World',
          date: '2023-01-01',
        },
      ],
    });
  });

  it('should handle circular relationships', async () => {
    const jsonApiData = {
      data: {
        id: 'user1',
        type: 'users',
        attributes: {
          name: 'John Doe',
          age: 30,
        },
        relationships: {
          articles: {
            data: [{ id: 'article1', type: 'articles' }],
          },
        },
      },
      included: [
        {
          id: 'article1',
          type: 'articles',
          attributes: {
            text: 'Hello World',
            date: '2023-01-01',
          },
          relationships: {
            author: {
              data: { id: 'user1', type: 'users' },
            },
          },
        },
      ],
    };

    const result = await deserializer.deserialize(
      userSchema,
      jsonApiData as any,
      { include: ['articles', 'articles.author'] },
    );

    // Verify circular reference is maintained
    expect(result.id).to.equal('user1');
    expect(result.name).to.equal('John Doe');
    expect(result.articles).to.have.lengthOf(1);
    expect(result.articles?.[0].id).to.equal('article1');
    expect(result.articles?.[0].text).to.equal('Hello World');

    // Check that the circular reference points back to the same object
    // expect(result.articles?.[0].author).to.equal(result);

    // Stop here as articles.author.articles is not in the include list
    expect(result.articles?.[0].author?.articles).to.eql([{ id: 'article1' }]);
  });

  it('should handle multiple circular relationships', async () => {
    const jsonApiData = {
      data: {
        id: 'user1',
        type: 'users',
        attributes: {
          name: 'John Doe',
          age: 30,
        },
        relationships: {
          articles: {
            data: [
              { id: 'article1', type: 'articles' },
              { id: 'article2', type: 'articles' },
            ],
          },
        },
      },
      included: [
        {
          id: 'article1',
          type: 'articles',
          attributes: {
            text: 'First Article',
            date: '2023-01-01',
          },
          relationships: {
            author: {
              data: { id: 'user1', type: 'users' },
            },
          },
        },
        {
          id: 'article2',
          type: 'articles',
          attributes: {
            text: 'Second Article',
            date: '2023-01-02',
          },
          relationships: {
            author: {
              data: { id: 'user1', type: 'users' },
            },
          },
        },
      ],
    };

    const result = await deserializer.deserialize(
      userSchema,
      jsonApiData as any,
      { include: ['articles', 'articles.author'] },
    );

    expect(result.articles).to.have.lengthOf(2);
    expect(result.articles?.[0].author).to.eql({
      id: 'user1',
      name: 'John Doe',
      age: 30,
      articles: [{ id: 'article1' }, { id: 'article2' }],
    });
    expect(result.articles?.[1].author).to.eql({
      id: 'user1',
      name: 'John Doe',
      age: 30,
      articles: [{ id: 'article1' }, { id: 'article2' }],
    });
  });

  it('should handle missing included resources as references', async () => {
    const jsonApiData = {
      data: {
        id: 'user1',
        type: 'users',
        attributes: {
          name: 'John Doe',
          age: 30,
        },
        relationships: {
          articles: {
            data: [{ id: 'article1', type: 'articles' }],
          },
        },
      },
      // No included section
    };

    const result = await deserializer.deserialize(
      userSchema,
      jsonApiData as any,
      {},
    );

    expect(result).to.deep.equal({
      id: 'user1',
      name: 'John Doe',
      age: 30,
      articles: [{ id: 'article1' }],
    });
  });

  it('should handle null relationships', async () => {
    const jsonApiData = {
      data: {
        id: 'article1',
        type: 'articles',
        attributes: {
          text: 'Hello World',
          date: '2023-01-01',
        },
        relationships: {
          author: {
            data: null,
          },
        },
      },
    };

    const result = await deserializer.deserialize(
      articleSchema,
      jsonApiData as any,
      {},
    );

    expect(result).to.deep.equal({
      id: 'article1',
      text: 'Hello World',
      date: '2023-01-01',
      author: null,
    });
  });
});
