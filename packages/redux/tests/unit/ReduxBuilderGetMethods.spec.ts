import { expect } from 'chai';
import { match } from 'sinon';
import { user } from '../support/schema.js';
import { getApi } from '../support/getApi.js';
import { createResponse } from '../support/createResponse.js';
import { createDenormalized } from '../support/createDenormalized.js';

describe('ReduxBuilder GET methods', () => {
  it('should add a GET endpoint for /type', async () => {
    const { api, store, stubFetchFn } = getApi();

    stubFetchFn
      .withArgs(
        match({
          url: 'http://localhost:3000/users?include=comments',
          method: 'GET',
        }),
      )
      .resolves(
        createResponse(
          user,
          [{ id: 'users/1', fullName: 'Test', comments: [] }],
          { include: ['comments'] },
        ),
      );

    const result = await store.dispatch(
      api.endpoints.getUsers.initiate({ include: ['comments'] }),
    );

    expect(result.data).to.eql([
      createDenormalized(user, {
        id: 'users/1',
        fullName: 'Test',
        comments: [],
      }),
    ]);
  });

  it('should add a GET endpoint for /type/:id', async () => {
    const { api, store, stubFetchFn } = getApi();

    stubFetchFn
      .withArgs(
        match({
          url: 'http://localhost:3000/users/users%2F1?include=comments',
          method: 'GET',
        }),
      )
      .resolves(
        createResponse(
          user,
          { id: 'users/1', fullName: 'Test', comments: [] },
          { include: ['comments'] },
        ),
      );

    const result = await store.dispatch(
      api.endpoints.getUsersById.initiate({
        id: 'users/1',
        include: ['comments'],
      }),
    );

    expect(result.data).to.eql(
      createDenormalized(user, {
        id: 'users/1',
        fullName: 'Test',
        comments: [],
      }),
    );
  });
});
