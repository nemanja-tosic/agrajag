import { z, JsonApiSerializer, ZodSchemaFactory } from 'agrajag';
import { expect } from 'chai';

describe('JsonApiSerializer', () => {
  let schemaFactory = new ZodSchemaFactory();
  let serializer = new JsonApiSerializer();

  it('should handle cyclical references', () => {
    const user = schemaFactory.createSchema('user', z.object({}), {
      relationships: { articles: () => [article] },
    });

    const article = schemaFactory.createSchema('article', z.object({}), {
      relationships: { author: () => user },
    });

    // TODO: compare against value
    expect(() =>
      serializer.serialize(user, { id: 'user1', articles: [] }, {}),
    ).to.not.throw();
  });
});
