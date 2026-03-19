import { stub } from 'sinon';
import { ReduxBuilder } from '../../src/index.js';
import { definitions } from './definitions.js';
import { configureStore } from '@reduxjs/toolkit';

export function getApi() {
  const stubFetchFn = stub();

  const api = new ReduxBuilder().addDefinitions(definitions).build({
    baseQueryArgs: { baseUrl: 'http://localhost:3000' },
    endpoints: () => ({}),
  });

  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat([api.middleware]),
  });

  return { api, store, stubFetchFn };
}
