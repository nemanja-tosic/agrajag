import {
  EndpointSchema,
  FetchDeleteHandler,
  JsonApiDeserializer,
  MutationHandler,
  QueryParams,
  Resource,
  ResourceDefinition,
  ServerBuilder,
} from 'agrajag';
import { BaseApi } from './ReduxBuilder.js';
import { camelCase } from 'change-case';
import { BaseQueryMeta } from '@reduxjs/toolkit/query';
import { EndpointDefinition } from '@reduxjs/toolkit/query/react';
import { FetchBaseQuery } from './FetchBaseQuery.js';

export class ReduxServerBuilder<
  ReducerPath extends string,
  TagTypes extends string,
  Endpoints extends ReduxEndpoints<ReducerPath, TagTypes>,
> extends ServerBuilder {
  readonly #baseApi: BaseApi<ReducerPath, TagTypes, Endpoints>;
  readonly #deserializer = new JsonApiDeserializer();

  constructor(api: BaseApi<ReducerPath, TagTypes, Endpoints>) {
    super();

    this.#baseApi = api;
  }

  #addTagType(path: string): any {
    const tagType = path.split('/')[1];
    this.#baseApi.enhanceEndpoints({ addTagTypes: [tagType] });
    return tagType;
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
          unknown,
          QueryParams & { id?: string },
          Resource<TDefinition> | Resource<TDefinition>[]
        >({
          query: ({ id, ...params }) => {
            return {
              url: this.#getPath(path, id),
              params,
            };
          },
          providesTags: [this.#addTagType(path)],
          transformResponse: response => {
            try {
              return this.#deserializer.deserialize(
                definition,
                response as any,
              );
            } catch (error) {
              console.error(error);
            }
          },
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

  addDelete<TPath extends string>(
    definition: ResourceDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
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

  addPatch<TPath extends string>(
    definition: ResourceDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {
    this.#baseApi.injectEndpoints({
      endpoints: builder => ({
        [this.#mapParts('patch', path)]: builder.mutation<
          unknown,
          QueryParams & { id: string; body: unknown }
        >({
          query: ({ id, body, ...params }) => ({
            url: this.#getPath(path, id),
            params,
            body,
            method: 'PATCH',
          }),
          invalidatesTags: [this.#addTagType(path)],
        }),
      }),
    });
  }

  addPost<TPath extends string>(
    definition: ResourceDefinition,
    createEndpointSchema: () => EndpointSchema,
    path: TPath,
    handler: MutationHandler<TPath>,
  ): void {
    this.#baseApi.injectEndpoints({
      endpoints: builder => ({
        [this.#mapParts('post', path)]: builder.mutation<
          unknown,
          QueryParams & { body: unknown }
        >({
          query: ({ body, ...params }) => ({
            url: path,
            params,
            body,
            method: 'POST',
          }),
          invalidatesTags: [this.#addTagType(path)],
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
}

export type ReduxEndpoints<
  ReducerPath extends string,
  TagTypes extends string,
> = Record<
  string,
  EndpointDefinition<any, FetchBaseQuery, TagTypes, any, ReducerPath>
>;
