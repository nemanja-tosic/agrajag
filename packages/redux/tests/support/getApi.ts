import { stub } from 'sinon';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ReduxBuilder } from '../../src/index.js';
import { definitions } from './definitions.js';
import { configureStore } from '@reduxjs/toolkit';

export function getApi() {
  const stubFetchFn = stub();

  const baseApi = createApi({
    baseQuery: fetchBaseQuery({
      baseUrl: 'http://localhost:3000',
      fetchFn: stubFetchFn,
    }),
    endpoints: () => ({}),
  });

  const api = new ReduxBuilder().addDefinitions(definitions).build(baseApi);

  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat([api.middleware]),
  });

  return { api, store, stubFetchFn };
}
