import { ReduxBuilder } from '@agrajag/redux-adapter';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { definitions } from '../shared/definitions.js';

export const inferredApi = new ReduxBuilder().addDefinitions(definitions).build(
  createApi({
    baseQuery: fetchBaseQuery({ baseUrl: '' }),
    endpoints: () => ({}),
  }),
);
