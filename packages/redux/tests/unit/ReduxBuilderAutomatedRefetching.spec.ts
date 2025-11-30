import { expect } from 'chai';
import { match } from 'sinon';
import { user } from '../support/schema.js';
import {
  createPatchRequest,
  createPostRequest,
} from '../support/createMutationRequest.js';
import { createResponse } from '../support/createResponse.js';
import { createEmptyResponse } from '../support/createEmptyResponse.js';
import { getApi } from '../support/getApi.js';
import { createDenormalized } from '../support/createDenormalized.js';

describe('ReduxBuilder automated refetching', () => {
  it('should add implement automated fetches for POST /type', async () => {
    const { api, store, stubFetchFn } = getApi();

    stubFetchFn
      .withArgs(match({ url: 'http://localhost:3000/users?', method: 'GET' }))
      .onFirstCall()
      .resolves(createResponse(user, []))
      // .onSecondCall()
      // .resolves(createResponse(user, [{ id: 'users/1', fullName: 'Test' }]));

    stubFetchFn
      .withArgs(match({ url: 'http://localhost:3000/users?', method: 'POST' }))
      .resolves(createEmptyResponse());

    await store.dispatch(api.endpoints.getUsers.initiate({}));

    await store.dispatch(
      api.endpoints.postUsers.initiate(
        createPostRequest(user, {
          type: 'users',
          attributes: { fullName: 'Test' },
        }),
      ),
    );

    const secondGet = await store.dispatch(api.endpoints.getUsers.initiate({}));

    // expect(secondGet.data).to.deep.equal(
    //   createDenormalized(user, [{ id: 'users/1', fullName: 'Test' }]),
    // );
  });

  it('should add implement automated fetches for PATCH /type/:id', async () => {
    const { api, store, stubFetchFn } = getApi();

    stubFetchFn
      .withArgs(
        match({ url: `http://localhost:3000/users/users%2F1?`, method: 'GET' }),
      )
      // .onFirstCall()
      // .resolves(createResponse(user, { id: 'users/1', fullName: 'Tes' }))
      // .onSecondCall()
      // .resolves(createResponse(user, { id: 'users/1', fullName: 'Test' }));

    stubFetchFn
      .withArgs(
        match({
          url: `http://localhost:3000/users/users%2F1?`,
          method: 'PATCH',
        }),
      )
      .resolves(createEmptyResponse());

    await store.dispatch(
      api.endpoints.getUsersById.initiate({ id: 'users/1' }),
    );

    await store.dispatch(
      api.endpoints.patchUsersById.initiate(
        createPatchRequest(user, {
          id: 'users/1',
          type: 'users',
          attributes: { fullName: 'Test' },
        }),
      ),
    );

    const secondGet = await store.dispatch(
      api.endpoints.getUsersById.initiate({
        id: 'users/1',
      }),
    );

    // expect(secondGet.data).to.deep.equal(
    //   createDenormalized(user, { id: 'users/1', fullName: 'Test' }),
    // );
  });
});
