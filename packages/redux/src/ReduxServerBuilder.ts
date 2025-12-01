import {
  Denormalized,
  EndpointSchema,
  FetchDeleteHandler,
  JsonApiDeserializer,
  MutationHandler,
  QueryParams,
  Resource,
  ResourceDefinition,
  ResourceIdentifier,
  ServerBuilder,
} from 'agrajag';
import { BaseApi } from './ReduxBuilder.js';
import { camelCase } from 'change-case';
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
          providesTags: (_, __, args) =>
            [this.#addTagType(path)].flatMap(type => [
              type,
              // TODO: add test case
              // ...(args.id ? [{ type, id: args.id }] : []),
            ]),
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
          Denormalized<ResourceDefinition> | undefined,
          QueryParams & { id: string; body: { data: Resource } }
        >({
          query: ({ id, body, ...params }) => ({
            url: this.#getPath(path, id),
            params,
            body,
            method: 'PATCH',
          }),
          invalidatesTags: (response, __, args) => {
            const affected = Object.values(args.body.data.relationships ?? {})
              .flatMap(res => res.data)
              .filter((res): res is ResourceIdentifier => res !== null);

            return [
              this.#addTagType(path),
              ...affected.flatMap(r => [r.type, { type: r.type, id: r.id }]),
              ...Object.entries(definition.relationships).flatMap(
                ([key, rel]) => {
                  if (response === undefined || !(key in response)) {
                    return;
                  }

                  if (Array.isArray(rel)) {
                    return [
                      rel[0].type,
                      { type: rel[0].type, id: (response[key] as any).id },
                    ];
                  } else {
                    return [
                      rel.type,
                      { type: key, id: (response[key] as any).id },
                    ];
                  }
                },
              ),
            ];
          },
          transformResponse: (response: Resource) => {
            if (!response) {
              return response;
            }

            try {
              return this.#deserializer.deserialize(definition, response);
            } catch (error) {
              console.error(error);
            }
          },
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
          QueryParams & { body: { data: Resource } }
        >({
          query: ({ body, ...params }) => ({
            url: path,
            params,
            body,
            method: 'POST',
          }),
          invalidatesTags: (_, __, args) => {
            const affected = Object.values(args.body.data.relationships ?? {})
              .flatMap(res => res.data)
              .filter((res): res is ResourceIdentifier => res !== null);

            return [
              this.#addTagType(path),
              ...affected.flatMap(r => [r.type, { type: r.type, id: r.id }]),
            ];
          },
          transformResponse: (response: Resource) => {
            if (!response) {
              return response;
            }

            try {
              return this.#deserializer.deserialize(definition, response);
            } catch (error) {
              console.error(error);
              return response;
            }
          },
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
