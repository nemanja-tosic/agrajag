import {
  QueryParams,
  ResourceCapabilities,
  ResourceDefinition,
  Definitions,
  DefinitionCollection,
} from 'agrajag';
import {
  Api,
  coreModuleName,
  CreateApiOptions,
  EndpointDefinitions,
  fetchBaseQuery,
  reactHooksModuleName,
} from '@reduxjs/toolkit/query/react';
import { DefinitionsToEndpoints } from './DefinitionsToEndpoints.js';
import { FetchBaseQuery } from './FetchBaseQuery.js';

export type CreateReduxApiOptions<
  ReducerPath extends string = 'api',
  TagTypes extends string = never,
> = Omit<
  CreateApiOptions<
    ReturnType<typeof fetchBaseQuery>,
    EndpointDefinitions,
    ReducerPath,
    TagTypes
  >,
  'baseQuery' | 'endpoints'
>;

export type BaseApi<
  ReducerPath extends string = 'api',
  TagTypes extends string = never,
> = Api<FetchBaseQuery, {}, ReducerPath, TagTypes>;

export class ReduxBuilder<
  TDefinitions extends Definitions,
  ReducerPath extends string = 'api',
  TagTypes extends string = never,
> {
  readonly #definitions: DefinitionCollection<TDefinitions>;
  readonly #baseApi: BaseApi<ReducerPath, TagTypes>;

  constructor(
    definitionCollection: DefinitionCollection<TDefinitions>,
    api: BaseApi<ReducerPath, TagTypes>,
  ) {
    this.#definitions = definitionCollection;
    this.#baseApi = api;
  }

  addDefinition<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
  ): this {
    if (definition.capabilities & ResourceCapabilities.FetchSelf) {
      this.#addQuery(definition, `/${definition.type}/id`);
    }
    if (definition.capabilities & ResourceCapabilities.FetchCollection) {
      this.#addQuery(definition, `/${definition.type}`);
    }

    return this;
  }

  #addQuery(definition: ResourceDefinition, url: string) {
    this.#baseApi.injectEndpoints({
      endpoints: builder => ({
        [this.#toEndpointName('get', definition)]: builder.query<
          any,
          QueryParams
        >({ query: params => ({ url, params }) }),
      }),
    });
  }

  build(): Api<
    FetchBaseQuery,
    DefinitionsToEndpoints<TDefinitions, TagTypes, ReducerPath>,
    ReducerPath,
    TagTypes,
    typeof reactHooksModuleName | typeof coreModuleName
  > {
    for (const definition of this.#definitions) {
      this.addDefinition(definition);
    }

    return this.#baseApi as any;
  }

  #toEndpointName(method: string, definition: ResourceDefinition) {
    return `${method}${definition.type.charAt(0).toUpperCase() + definition.type.slice(1)}`;
  }
}
