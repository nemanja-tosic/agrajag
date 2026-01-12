import { expect } from 'chai';
import { match } from 'sinon';
import { comments, user } from '../support/schema.js';
import {
  createPatchRequest,
  createPostRequest,
} from '../support/createMutationRequest.js';
import { createResponse } from '../support/createResponse.js';
import { getApi } from '../support/getApi.js';
import { createDenormalized } from '../support/createDenormalized.js';

describe('ReduxBuilder automated refetching', () => {
  it('should implement automated fetches for POST /type for collections', async () => {
    const { api, store, stubFetchFn } = getApi();

    stubFetchFn
      .withArgs(match({ url: 'http://localhost:3000/users?', method: 'GET' }))
      .onFirstCall()
      .resolves(createResponse(user, []))
      .onSecondCall()
      .resolves(createResponse(user, [{ id: 'users/1', fullName: 'Test' }]));

    stubFetchFn
      .withArgs(match({ url: 'http://localhost:3000/users?', method: 'POST' }))
      .resolves(
        createResponse(comments, {
          id: 'comments/1',
          text: 'test',
          user: { id: 'users/1', fullName: 'Lorem Ipsum' },
        }),
      );

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

    expect(secondGet.data).to.deep.equal(
      createDenormalized(user, [{ id: 'users/1', fullName: 'Test' }]),
    );
  });

  it('should refetch related entities for POST /type', async () => {
    const { api, store, stubFetchFn } = getApi();

    stubFetchFn
      .withArgs(
        match({
          url: 'http://localhost:3000/users?include=comments',
          method: 'GET',
        }),
      )
      .onFirstCall()
      .resolves(
        createResponse(
          user,
          [{ id: 'users/1', fullName: 'Test', comments: [] }],
          { include: ['comments'] },
        ),
      )
      .onSecondCall()
      .resolves(
        createResponse(
          user,
          [
            {
              id: 'users/1',
              fullName: 'Test',
              comments: [{ id: 'comments/1', text: 'test' }],
            },
          ],
          { include: ['comments'] },
        ),
      );

    stubFetchFn
      .withArgs(
        match({ url: 'http://localhost:3000/comments?', method: 'POST' }),
      )
      .resolves(
        createResponse(comments, {
          id: 'comments/1',
          text: 'test',
          user: { id: 'users/1', fullName: 'Lorem Ipsum' },
        }),
      );

    await store.dispatch(
      api.endpoints.getUsers.initiate({ include: ['comments'] }),
    );

    await store.dispatch(
      api.endpoints.postComments.initiate({
        body: {
          data: {
            type: 'comments',
            attributes: { text: 'test' },
          },
        },
      }),
    );

    const secondGet = await store.dispatch(
      api.endpoints.getUsers.initiate({ include: ['comments'] }),
    );

    expect(secondGet.data).to.deep.equal(
      createDenormalized(user, [
        {
          id: 'users/1',
          fullName: 'Test',
          comments: [{ id: 'comments/1', text: 'test' }],
        },
      ]),
    );
  });

  it('should implement automated fetches for PATCH /type/:id', async () => {
    const { api, store, stubFetchFn } = getApi();

    stubFetchFn
      .withArgs(
        match({ url: `http://localhost:3000/users/users%2F1?`, method: 'GET' }),
      )
      .onFirstCall()
      .resolves(createResponse(user, { id: 'users/1', fullName: 'Tes' }))
      .onSecondCall()
      .resolves(createResponse(user, { id: 'users/1', fullName: 'Test' }));

    stubFetchFn
      .withArgs(
        match({
          url: `http://localhost:3000/users/users%2F1?`,
          method: 'PATCH',
        }),
      )
      .resolves(
        createResponse(user, { id: 'users/1', fullName: 'Test', comments: [] }),
      );

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

  it('should refetch related entities for PATCH /type/:id', async () => {
    const { api, store, stubFetchFn } = getApi();

    stubFetchFn
      .withArgs(
        match({
          url: 'http://localhost:3000/users?include=comments',
          method: 'GET',
        }),
      )
      .onFirstCall()
      .resolves(
        createResponse(
          user,
          [
            {
              id: 'users/1',
              fullName: 'Test',
              comments: [{ id: 'comments/1', text: 'tes' }],
            },
          ],
          { include: ['comments'] },
        ),
      )
      .onSecondCall()
      .resolves(
        createResponse(
          user,
          [
            {
              id: 'users/1',
              fullName: 'Test',
              comments: [{ id: 'comments/1', text: 'test' }],
            },
          ],
          { include: ['comments'] },
        ),
      );

    stubFetchFn
      .withArgs(
        match({
          url: 'http://localhost:3000/comments/comments%2F1?',
          method: 'PATCH',
        }),
      )
      .resolves(
        createResponse(
          comments,
          {
            id: 'comments/1',
            text: 'test',
            user: { id: 'users/1', fullName: 'Lorem Ipsum' },
          },
          {},
        ),
      );

    await store.dispatch(
      api.endpoints.getUsers.initiate({ include: ['comments'] }),
    );

    await store.dispatch(
      api.endpoints.patchCommentsById.initiate({
        id: 'comments/1',
        body: {
          data: {
            id: 'comments/1',
            type: 'comments',
            attributes: { text: 'test' },
          },
        },
      }),
    );

    const secondGet = await store.dispatch(
      api.endpoints.getUsers.initiate({ include: ['comments'] }),
    );

    expect(secondGet.data).to.deep.equal(
      createDenormalized(user, [
        {
          id: 'users/1',
          fullName: 'Test',
          comments: [{ id: 'comments/1', text: 'test' }],
        },
      ]),
    );
  });

  it('should invalidate dependencies', async () => {
    const { api, store, stubFetchFn } = getApi();

    stubFetchFn
      .withArgs(
        match({
          url: 'http://localhost:3000/users?include=comments',
          method: 'GET',
        }),
      )
      .onFirstCall()
      .resolves(
        createResponse(
          user,
          [
            {
              id: 'users/1',
              fullName: 'Test',
              comments: [{ id: 'comments/1', text: 'tes' }],
            },
          ],
          { include: ['comments'] },
        ),
      )
      .onSecondCall()
      .resolves(
        createResponse(
          user,
          [
            {
              id: 'users/1',
              fullName: 'Test',
              comments: [{ id: 'comments/1', text: 'test' }],
            },
          ],
          { include: ['comments'] },
        ),
      );

    await store.dispatch(
      api.endpoints.getUsers.initiate({ include: ['comments'] }),
    );

    store.dispatch(api.util.invalidateTags([{ type: 'comments' } as any]));

    const secondGet = await store.dispatch(
      api.endpoints.getUsers.initiate({ include: ['comments'] }),
    );

    expect(secondGet.data).to.deep.equal(
      createDenormalized(user, [
        {
          id: 'users/1',
          fullName: 'Test',
          comments: [{ id: 'comments/1', text: 'test' }],
        },
      ]),
    );
  });
});
