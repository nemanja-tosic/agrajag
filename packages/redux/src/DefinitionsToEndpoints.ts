import {
  Api,
  Denormalized,
  Endpoints,
  MutateEndpointBody,
  QueryParams,
  Definitions,
} from 'agrajag';
import {
  MutationDefinition,
  QueryDefinition,
} from '@reduxjs/toolkit/query/react';

import { FetchBaseQuery } from './FetchBaseQuery.js';

export type DefinitionsToEndpoints<
  TDefinitions extends Definitions,
  TagTypes extends string,
  ReducerPath extends string,
  TApi extends Record<string, Endpoints<any>> = {
    [K in keyof TDefinitions]: Endpoints<TDefinitions[K]>;
  },
> = {
  [K in keyof TApi as Methods<TApi, K, 'get'>]: QueryManyEndpoint<
    TApi[K],
    TagTypes,
    ReducerPath
  >;
} & {
  [K in keyof TApi as Methods<TApi, K, 'get', 'byId'>]: QueryEndpoint<
    TApi[K],
    TagTypes,
    ReducerPath
  >;
} & {
  [K in keyof TApi as Methods<TApi, K, 'post'>]: MutationEndpoint<
    TApi[K],
    TagTypes,
    ReducerPath
  >;
} & {
  [K in keyof TApi as Methods<TApi, K, 'patch', 'byId'>]: MutationEndpoint<
    TApi[K],
    TagTypes,
    ReducerPath
  >;
} & {
  [K in keyof TApi as Methods<TApi, K, 'delete', 'byId'>]: MutationEndpoint<
    TApi[K],
    TagTypes,
    ReducerPath,
    never
  >;
};

export type QueryManyEndpoint<
  TEndpoints extends Endpoints<any>,
  TagTypes extends string,
  ReducerPath extends string,
  TId extends string = never,
> = QueryDefinition<
  QueryParams & TId extends never ? {} : { id: TId },
  FetchBaseQuery,
  TagTypes,
  TEndpoints extends Endpoints<infer T> ? Denormalized<T>[] | undefined : never,
  ReducerPath
>;

export type QueryEndpoint<
  TEndpoints extends Endpoints<any>,
  TagTypes extends string,
  ReducerPath extends string,
  TId extends string = never,
> = QueryDefinition<
  QueryParams & TId extends never ? {} : { id: TId },
  FetchBaseQuery,
  TagTypes,
  TEndpoints extends Endpoints<infer T> ? Denormalized<T> : never,
  ReducerPath
>;

export type MutationEndpoint<
  TEndpoints extends Endpoints<any>,
  TagTypes extends string,
  ReducerPath extends string,
  TBody = TEndpoints extends Endpoints<infer T> ? MutateEndpointBody<T> : never,
> = MutationDefinition<
  QueryParams & TBody extends never ? {} : { body: TBody },
  FetchBaseQuery,
  TagTypes,
  TEndpoints extends Endpoints<infer T> ? Denormalized<T> : never,
  ReducerPath
>;

export type Methods<
  TApi extends Api,
  TKey extends keyof TApi,
  TMethods extends string,
  TSuffix extends string = '',
> = `${TMethods}${Capitalize<string & TKey>}${Capitalize<TSuffix>}`;
