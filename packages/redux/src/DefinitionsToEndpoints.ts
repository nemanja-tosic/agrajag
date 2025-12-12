import {
  Denormalized,
  MutateEndpointBody,
  QueryParams,
  Definitions,
  ResourceDefinition,
} from 'agrajag';
import {
  MutationDefinition,
  QueryDefinition,
} from '@reduxjs/toolkit/query/react';

import { FetchBaseQuery } from './FetchBaseQuery.js';
import { CamelCase } from './CamelCase.js';

export type DefinitionsToEndpoints<
  TDefinitions extends Definitions,
  TagTypes extends string,
  ReducerPath extends string,
> = {
  [K in keyof TDefinitions as `get${Capitalize<CamelCase<string & K>>}`]: QueryManyEndpoint<
    TDefinitions[K],
    TagTypes,
    ReducerPath
  >;
} & {
  [K in keyof TDefinitions as `get${Capitalize<CamelCase<string & K>>}ById`]: QueryEndpoint<
    TDefinitions[K],
    TagTypes,
    ReducerPath
  >;
} & {
  [K in keyof TDefinitions as `post${Capitalize<CamelCase<string & K>>}`]: PostEndpoint<
    TDefinitions[K],
    TagTypes,
    ReducerPath
  >;
} & {
  [K in keyof TDefinitions as `patch${Capitalize<CamelCase<string & K>>}ById`]: PatchEndpoint<
    TDefinitions[K],
    TagTypes,
    ReducerPath
  >;
} & {
  [K in keyof TDefinitions as `delete${Capitalize<CamelCase<string & K>>}ById`]: DeleteEndpoint<
    TDefinitions[K],
    TagTypes,
    ReducerPath
  >;
};

export type QueryManyEndpoint<
  TDefinition extends ResourceDefinition,
  TagTypes extends string,
  ReducerPath extends string,
> = QueryDefinition<
  QueryParams<TDefinition>,
  FetchBaseQuery,
  TagTypes,
  Denormalized<TDefinition>[],
  ReducerPath
>;

export type QueryEndpoint<
  TDefinition extends ResourceDefinition,
  TagTypes extends string,
  ReducerPath extends string,
> = QueryDefinition<
  QueryParams<TDefinition> & { id: string },
  FetchBaseQuery,
  TagTypes,
  Denormalized<TDefinition>,
  ReducerPath
>;

export type PostEndpoint<
  TDefinition extends ResourceDefinition,
  TagTypes extends string,
  ReducerPath extends string,
  TBody = MutateEndpointBody<TDefinition>,
> = MutationDefinition<
  QueryParams<TDefinition> & { id?: string; body: TBody },
  FetchBaseQuery,
  TagTypes,
  Denormalized<TDefinition>,
  ReducerPath
>;

export type PatchEndpoint<
  TDefinition extends ResourceDefinition,
  TagTypes extends string,
  ReducerPath extends string,
  TBody = MutateEndpointBody<TDefinition>,
> = MutationDefinition<
  QueryParams<TDefinition> & { id: string; body: TBody },
  FetchBaseQuery,
  TagTypes,
  Denormalized<TDefinition>,
  ReducerPath
>;

export type DeleteEndpoint<
  TDefinition extends ResourceDefinition,
  TagTypes extends string,
  ReducerPath extends string,
> = MutationDefinition<
  QueryParams<TDefinition> & { id: string },
  FetchBaseQuery,
  TagTypes,
  {},
  ReducerPath
>;
