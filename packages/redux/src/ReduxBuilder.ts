import { Definitions, DefinitionCollection, Builder } from 'agrajag';
import {
  Api,
  coreModuleName,
  createApi,
  CreateApiOptions,
  fetchBaseQuery,
  FetchBaseQueryArgs,
  reactHooksModuleName,
} from '@reduxjs/toolkit/query/react';
import { DefinitionsToEndpoints } from './DefinitionsToEndpoints.js';
import { FetchBaseQuery } from './FetchBaseQuery.js';
import { ReduxServerBuilder, ReduxEndpoints } from './ReduxServerBuilder.js';
import qs from 'qs';

export type BaseApi<
  ReducerPath extends string,
  TagTypes extends string,
  Endpoints extends ReduxEndpoints<ReducerPath, TagTypes>,
> = Api<
  FetchBaseQuery,
  Endpoints,
  ReducerPath,
  TagTypes,
  typeof reactHooksModuleName | typeof coreModuleName
>;

export type BuiltApi<
  TDefinitions extends Definitions,
  ReducerPath extends string,
  TagTypes extends string,
  Endpoints extends ReduxEndpoints<ReducerPath, TagTypes>,
> = Api<
  FetchBaseQuery,
  Endpoints & DefinitionsToEndpoints<TDefinitions, TagTypes, ReducerPath>,
  ReducerPath,
  TagTypes,
  typeof reactHooksModuleName | typeof coreModuleName
>;

export class ReduxBuilder<
  TDefinitions extends Definitions = {},
  ReducerPath extends string = 'api',
  TagTypes extends string = never,
> extends Builder<TDefinitions> {
  addDefinitions<TNewDefinitions extends Definitions>(
    definitions: DefinitionCollection<TNewDefinitions>,
  ): ReduxBuilder<TDefinitions & TNewDefinitions, ReducerPath, TagTypes> {
    this.definitions.addDefinitions(definitions);

    return this as unknown as ReduxBuilder<
      TDefinitions & TNewDefinitions,
      ReducerPath,
      TagTypes
    >;
  }

  build<
    ReducerPath extends string,
    TagTypes extends string,
    Endpoints extends ReduxEndpoints<ReducerPath, TagTypes>,
  >({
    baseQueryArgs,
    ...options
  }: BuildConfig<ReducerPath, TagTypes, Endpoints>): BuiltApi<
    TDefinitions,
    ReducerPath,
    TagTypes,
    Endpoints
  > {
    const api = createApi({
      baseQuery: fetchBaseQuery({
        ...baseQueryArgs,
        paramsSerializer: params =>
          qs.stringify(params, { commaRoundTrip: true }),
      }),
      ...options,
    });

    this.addEndpointBuilder(new ReduxServerBuilder(api, this.definitions));

    for (const definition of this.definitions) {
      this.addResource(definition, {});
    }

    return api as any;
  }
}

export type BuildConfig<
  ReducerPath extends string,
  TagTypes extends string,
  Endpoints extends ReduxEndpoints<ReducerPath, TagTypes>,
> = Omit<
  CreateApiOptions<FetchBaseQuery, Endpoints, ReducerPath, TagTypes>,
  'baseQuery'
> & { baseQueryArgs: FetchBaseQueryArgs };
