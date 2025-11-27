import { ReduxServerBuilder } from '@agrajag/redux-adapter';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { definitions } from '../shared/definitions.js';
import { Builder } from 'agrajag';

export const reduxBuilder = new ReduxServerBuilder(
  createApi({
    baseQuery: fetchBaseQuery({ baseUrl: '' }),
    endpoints: builder => ({}),
  }),
);

new Builder(reduxBuilder).addDefinitions(definitions).build({
  comments: null as any,
  articles: null as any,
  authors: null as any,
});

export const inferredApi = reduxBuilder.build();
