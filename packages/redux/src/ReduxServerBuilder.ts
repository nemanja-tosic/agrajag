import {
  DefinitionCollection,
  Denormalized,
  Deserializer,
  EndpointSchema,
  FetchDeleteHandler,
  JsonApiDeserializer,
  MutationHandler,
  QueryParams,
  Resource,
  ResourceDefinition,
  ServerBuilder,
  Document,
  SingleResourceDocument,
  MultipleResourceDocument,
} from 'agrajag';
import { BaseApi } from './ReduxBuilder.js';
import { camelCase } from 'change-case';
import {
  EndpointDefinition,
  TagDescription,
} from '@reduxjs/toolkit/query/react';
import { FetchBaseQuery } from './FetchBaseQuery.js';

export class ReduxServerBuilder<
  ReducerPath extends string,
  TagTypes extends string,
  Endpoints extends ReduxEndpoints<ReducerPath, TagTypes>,
> extends ServerBuilder {
  readonly #baseApi: BaseApi<ReducerPath, TagTypes, Endpoints>;
  readonly #deserializer: Deserializer = new JsonApiDeserializer();

  constructor(
    api: BaseApi<ReducerPath, TagTypes, Endpoints>,
    definitions: DefinitionCollection,
  ) {
    super();

    this.#baseApi = api;

    this.#baseApi.enhanceEndpoints({
      addTagTypes: [...definitions].map(d => d.type),
    });
  }

  addGet<TPath extends string, TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: FetchDeleteHandler<TPath, TDefinition>,
  ): void {
    this.#baseApi.injectEndpoints({
      endpoints: builder => ({
        [this.#mapParts('get', path)]: builder.query<
          Denormalized<TDefinition>[] | Denormalized<TDefinition> | undefined,
          QueryParams & { id?: string },
          Document<TDefinition>
        >({
          query: ({ id, ...params }) => ({
            url: this.#getPath(path, id),
            params,
          }),
          providesTags: response =>
            this.#providesTags(definition, path, response),
          transformResponse: response =>
            this.#transformResponse(definition, response),
        }),
      }),
    });
  }

  #getPath(path: string, id?: string): string {
    if (!path.includes(':id')) {
      return path;
    }

    if (!id) {
      throw new Error(`Missing id for path: ${path}`);
    }

    return path.replace(':id', encodeURIComponent(id));
  }

  addDelete<TPath extends string, TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
  ): void {
    this.#baseApi.injectEndpoints({
      endpoints: builder => ({
        [this.#mapParts('delete', path)]: builder.mutation<
          unknown,
          QueryParams
        >({
          query: params => ({ url: path, params, method: 'DELETE' }),
        }),
      }),
    });
  }

  addPatch<TPath extends string, TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
  ): void {
    this.#baseApi.injectEndpoints({
      endpoints: builder => ({
        [this.#mapParts('patch', path)]: builder.mutation<
          Denormalized<TDefinition> | undefined,
          QueryParams & { id: string; body: { data: Resource<TDefinition> } },
          SingleResourceDocument<TDefinition>
        >({
          query: ({ id, body, ...params }) => ({
            url: this.#getPath(path, id),
            params,
            body,
            method: 'PATCH',
          }),
          invalidatesTags: response =>
            this.#invalidateTags(definition, path, response),
          transformResponse: response =>
            this.#transformResponse(definition, response),
        }),
      }),
    });
  }

  addPost<TPath extends string, TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath, TDefinition>,
  ): void {
    this.#baseApi.injectEndpoints({
      endpoints: builder => ({
        [this.#mapParts('post', path)]: builder.mutation<
          Denormalized<TDefinition> | undefined,
          QueryParams & { body: { data: Resource<TDefinition> } },
          SingleResourceDocument<TDefinition>
        >({
          query: ({ body, ...params }) => ({
            url: path,
            params,
            body,
            method: 'POST',
          }),
          invalidatesTags: response =>
            this.#invalidateTags(definition, path, response),
          transformResponse: response =>
            this.#transformResponse(definition, response),
        }),
      }),
    });
  }

  #mapParts(method: string, path: string): string {
    return camelCase(
      [method]
        .concat(
          path
            .split('/')
            // skip the first slash
            .slice(1)
            .map(part => part.replace(':', 'by-')),
        )
        .join('-'),
    );
  }

  async #transformResponse<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    response: SingleResourceDocument<TDefinition> | undefined,
  ): Promise<Denormalized<TDefinition> | undefined>;
  async #transformResponse<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    response: MultipleResourceDocument<TDefinition> | undefined,
  ): Promise<Denormalized<TDefinition>[] | undefined>;
  async #transformResponse<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    response: Document<TDefinition> | undefined,
  ): Promise<
    Denormalized<TDefinition> | Denormalized<TDefinition>[] | undefined
  >;
  async #transformResponse<TDefinition extends ResourceDefinition>(
    definition: TDefinition,
    response: Document<TDefinition> | undefined,
  ): Promise<
    Denormalized<TDefinition> | Denormalized<TDefinition>[] | undefined
  > {
    if (!response) {
      return response;
    }

    try {
      return this.#deserializer.deserialize(definition, response);
    } catch (error) {
      console.error(error);
    }
  }

  #invalidateTags(
    definition: ResourceDefinition,
    path: string,
    response: Denormalized<ResourceDefinition> | undefined,
  ): TagDescription<TagTypes>[] {
    return [
      definition.type,
      ...Object.entries(definition.relationships).flatMap(([key, rel]) => {
        if (response === undefined || !(key in response)) {
          return;
        }

        if (Array.isArray(rel)) {
          return [rel[0].type, { type: rel[0].type, id: response[key].id }];
        } else {
          return [rel.type, { type: rel.type, id: response[key].id }];
        }
      }),
    ] as TagTypes[];
  }

  #providesTags(
    definition: ResourceDefinition,
    path: string,
    response:
      | Denormalized<ResourceDefinition>
      | Denormalized<ResourceDefinition>[]
      | undefined,
  ): TagDescription<TagTypes>[] {
    return [definition.type] as TagTypes[];
  }
}

export type ReduxEndpoints<
  ReducerPath extends string,
  TagTypes extends string,
> = Record<
  string,
  EndpointDefinition<any, FetchBaseQuery, TagTypes, any, ReducerPath>
>;
