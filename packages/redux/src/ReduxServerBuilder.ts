import {
  QueryParams,
  ResourceCapabilities,
  ResourceDefinition,
  Definitions,
  DefinitionCollection,
  ServerBuilder,
  EndpointSchema,
  MutationHandler,
  FetchDeleteHandler,
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
import { BaseApi } from './ReduxBuilder.js';

// export type CreateReduxApiOptions<
//   ReducerPath extends string = 'api',
//   TagTypes extends string = never,
// > = Omit<
//   CreateApiOptions<
//     ReturnType<typeof fetchBaseQuery>,
//     EndpointDefinitions,
//     ReducerPath,
//     TagTypes
//   >,
//   'baseQuery' | 'endpoints'
// >;
//
// export type BaseApi<
//   ReducerPath extends string = 'api',
//   TagTypes extends string = never,
// > = Api<FetchBaseQuery, {}, ReducerPath, TagTypes>;

export class ReduxServerBuilder<
  TDefinitions extends Definitions,
  ReducerPath extends string = 'api',
  TagTypes extends string = never,
> extends ServerBuilder {
  // readonly #definitions: DefinitionCollection<TDefinitions>;
  readonly #baseApi: BaseApi<ReducerPath, TagTypes>;

  constructor(
    // definitionCollection: DefinitionCollection<TDefinitions>,
    api: BaseApi<ReducerPath, TagTypes>,
  ) {
    super();

    // this.#definitions = definitionCollection;
    this.#baseApi = api;
  }

  // addDefinition<TDefinition extends ResourceDefinition>(
  //   definition: TDefinition,
  // ): this {
  //   if (definition.capabilities & ResourceCapabilities.FetchSelf) {
  //     this.#addQuery(definition, `/${definition.type}/id`);
  //   }
  //   if (definition.capabilities & ResourceCapabilities.FetchCollection) {
  //     this.#addQuery(definition, `/${definition.type}`);
  //   }
  //
  //   return this;
  // }
  //
  // #addQuery(definition: ResourceDefinition, url: string) {
  //   this.#baseApi.injectEndpoints({
  //     endpoints: builder => ({
  //       [this.#toEndpointName('get', definition)]: builder.query<
  //         any,
  //         QueryParams
  //       >({ query: params => ({ url, params }) }),
  //     }),
  //   });
  // }

  addGet<TPath extends string, TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: FetchDeleteHandler<TPath, TDefinition>,
  ): void {
    this.#baseApi.injectEndpoints({
      endpoints: builder => ({
        [this.#toEndpointName('get', definition)]: builder.query<
          unknown,
          QueryParams
        >({ query: params => ({ url: path, params }) }),
      }),
    });
  }

  addDelete<TPath extends string>(
    definition: ResourceDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {
    this.#baseApi.injectEndpoints({
      endpoints: builder => ({
        [this.#toEndpointName('get', definition)]: builder.query<
          any,
          QueryParams
        >({ query: params => ({ url: path, params }) }),
      }),
    });
  }

  addPatch<TPath extends string>(
    definition: ResourceDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {}

  addPost<TPath extends string>(
    definition: ResourceDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {}

  // build(): Api<
  //   FetchBaseQuery,
  //   DefinitionsToEndpoints<TDefinitions, TagTypes, ReducerPath>,
  //   ReducerPath,
  //   TagTypes,
  //   typeof reactHooksModuleName | typeof coreModuleName
  // > {
  //   for (const definition of this.#definitions) {
  //     this.addDefinition(definition);
  //   }
  //
  //   return this.#baseApi as any;
  // }
  //
  #toEndpointName(method: string, definition: ResourceDefinition) {
    return `${method}${definition.type.charAt(0).toUpperCase() + definition.type.slice(1)}`;
  }

  build(): Api<
    FetchBaseQuery,
    DefinitionsToEndpoints<TDefinitions, TagTypes, ReducerPath>,
    ReducerPath,
    TagTypes,
    typeof reactHooksModuleName | typeof coreModuleName
  > {
    // for (const definition of this.#definitions) {
    //   this.addDefinition(definition);
    // }

    return this.#baseApi as any;
  }
}
